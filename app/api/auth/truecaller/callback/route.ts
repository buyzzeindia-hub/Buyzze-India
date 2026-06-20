export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";

// ✅ Helper function to lazily initialize Supabase ONLY at runtime
const getSupabaseAdmin = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const body = await req.json();

    if (body.status && !body.accessToken) {
      return NextResponse.json({ status: "IGNORED" });
    }

    const requestId = body.requestId || body.state;
    if (!requestId) return NextResponse.json({ error: "Missing requestId" }, { status: 400 });

    let phoneNumber = "";
    let firstName = "";
    let lastName = "";
    let actualEmail = "";

    if (body.endpoint && body.accessToken) {
      const profileRes = await fetch(body.endpoint, {
        method: "GET",
        headers: { "Authorization": `Bearer ${body.accessToken}`, "Cache-Control": "no-cache" }
      });

      if (profileRes.ok) {
        const profileData = await profileRes.json();
        const rawPhone = profileData.phoneNumbers?.[0]?.toString() || "";
        if (rawPhone) phoneNumber = rawPhone.startsWith("+") ? rawPhone : `+${rawPhone}`;

        firstName = profileData.names?.[0]?.givenName || "";
        lastName = profileData.names?.[0]?.familyName || "";
        actualEmail = profileData.emailAddresses?.[0]?.value || "";
      }
    } else {
      return NextResponse.json({ error: "Invalid Truecaller payload" }, { status: 400 });
    }

    if (!phoneNumber) {
      return NextResponse.json({ error: "Could not fetch phone number" }, { status: 400 });
    }

    const fullName = `${firstName} ${lastName}`.trim() || "Truecaller User";
    let existingProfile = null;

    if (actualEmail) {
      const { data: emailMatch } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("email", actualEmail)
        .order("created_at", { ascending: true })
        .limit(1);
      existingProfile = emailMatch?.[0];
    }

    if (!existingProfile) {
      const { data: phoneMatch } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("verified_phone", phoneNumber)
        .order("created_at", { ascending: true })
        .limit(1);
      existingProfile = phoneMatch?.[0];
    }

    let userId = existingProfile?.id;

    if (!existingProfile) {
      userId = `tc_${uuidv4()}`;
      const cleanPhone = phoneNumber.replace("+", "");
      const finalEmail = actualEmail || `${cleanPhone}@ghost.buyzze.com`;

      await supabaseAdmin.from("profiles").insert([{
        id: userId,
        full_name: fullName,
        email: finalEmail,
        is_phone_verified: true,
        verified_phone: phoneNumber,
        verified_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      }]);
    } else {
      await supabaseAdmin.from("profiles").update({
        verified_phone: phoneNumber,
        is_phone_verified: true,
        verified_at: new Date().toISOString()
      }).eq("id", userId);
    }

    await supabaseAdmin.from("auth_requests").update({ status: "verified", user_id: userId }).eq("id", requestId);

    return NextResponse.json({ success: true, user_id: userId });

  } catch (error: any) {
    console.error("Truecaller Callback Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
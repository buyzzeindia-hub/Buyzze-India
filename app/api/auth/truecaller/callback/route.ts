import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: Request) {
  try {
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
        if (rawPhone) phoneNumber = rawPhone.startsWith("+") ? rawPhone : "+" + rawPhone;
        firstName = profileData.name?.first || "";
        lastName = profileData.name?.last || "";
        actualEmail = profileData.onlineIdentities?.email || "";
      } else {
        return NextResponse.json({ error: "Truecaller token verification failed" }, { status: 400 });
      }
    }

    if (!phoneNumber) return NextResponse.json({ error: "Phone missing" }, { status: 400 });

    const fullName = `${firstName} ${lastName}`.trim() || "Truecaller User";

    const { data: authRequest } = await supabaseAdmin
      .from("auth_requests")
      .select("*")
      .eq("id", requestId)
      .eq("status", "pending")
      .single();

    if (!authRequest) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

    let existingProfile = null;

    // 🔥 SMART CHECK 1: Pehle Email se dhoondho (Agar user ne pehle Google se login kiya ho)
    if (actualEmail) {
      const { data: emailMatch } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("email", actualEmail)
        .order("created_at", { ascending: true })
        .limit(1);
      existingProfile = emailMatch?.[0];
    }

    // 🔥 SMART CHECK 2: Agar Email se na mile, toh Phone Number se dhoondho
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
      // Dono se nahi mila? Tabhi naya account banao
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
      // ✅ ACCOUNT MIL GAYA: Purane account mein phone number update (link) kar do
      await supabaseAdmin.from("profiles").update({
        verified_phone: phoneNumber,
        is_phone_verified: true,
        verified_at: new Date().toISOString()
      }).eq("id", userId);
    }

    await supabaseAdmin.from("auth_requests").update({ status: "verified", user_id: userId }).eq("id", requestId);

    return NextResponse.json({ status: "SUCCESS" });

  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
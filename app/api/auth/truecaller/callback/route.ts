import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("📥 Truecaller Raw Webhook Payload:", body);

    // 🔥 FIX: Agar Truecaller sirf "flow_invoked" ya koi aur status bhej raha hai bina token ke, toh use ignore karo
    if (body.status && !body.accessToken) {
      console.log(`ℹ️ Ignoring intermediate Truecaller status: ${body.status}`);
      return NextResponse.json({ status: "IGNORED" });
    }

    const requestId = body.requestId || body.state;
    if (!requestId) {
      return NextResponse.json({ error: "Missing requestId" }, { status: 400 });
    }

    let phoneNumber = "";
    let firstName = "";
    let lastName = "";
    let actualEmail = "";

    // TRUECALLER PRODUCTION PAYLOAD DECODING
    if (body.endpoint && body.accessToken) {
      console.log("🔄 Fetching user profile from Truecaller secure server...");
      
      const profileRes = await fetch(body.endpoint, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${body.accessToken}`,
          "Cache-Control": "no-cache"
        }
      });

      if (profileRes.ok) {
        const profileData = await profileRes.json();
        console.log("👤 Decoded Truecaller Profile:", profileData);
        
        const rawPhone = profileData.phoneNumbers?.[0]?.toString() || "";
        if (rawPhone) {
          phoneNumber = rawPhone.startsWith("+") ? rawPhone : "+" + rawPhone;
        }
        
        firstName = profileData.name?.first || "";
        lastName = profileData.name?.last || "";
        actualEmail = profileData.onlineIdentities?.email || "";
      } else {
        console.error("❌ Failed to fetch from Truecaller endpoint");
        return NextResponse.json({ error: "Truecaller token verification failed" }, { status: 400 });
      }
    }

    // Final Validation check
    if (!phoneNumber) {
      return NextResponse.json({ error: "Phone number could not be retrieved" }, { status: 400 });
    }

    const fullName = `${firstName} ${lastName}`.trim() || "Truecaller User";

    const { data: authRequest, error: reqError } = await supabaseAdmin
      .from("auth_requests")
      .select("*")
      .eq("id", requestId)
      .eq("status", "pending")
      .single();

    if (reqError || !authRequest) {
      return NextResponse.json({ error: "Invalid or expired request ID" }, { status: 400 });
    }

    let { data: existingProfile } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("verified_phone", phoneNumber)
      .single();

    let userId = existingProfile?.id;

    if (!existingProfile) {
      userId = `tc_${uuidv4()}`;
      const cleanPhone = phoneNumber.replace("+", "");
      const finalEmail = actualEmail || `${cleanPhone}@ghost.buyzze.com`;

      const { error: insertError } = await supabaseAdmin
        .from("profiles")
        .insert([{
          id: userId,
          full_name: fullName,
          email: finalEmail,
          is_phone_verified: true,
          verified_phone: phoneNumber,
          verified_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);

      if (insertError) throw insertError;
    }

    const { error: updateError } = await supabaseAdmin
      .from("auth_requests")
      .update({ 
        status: "verified",
        user_id: userId
      })
      .eq("id", requestId);

    if (updateError) throw updateError;

    return NextResponse.json({ status: "SUCCESS" });

  } catch (error: any) {
    console.error("Callback Webhook Runtime Exception:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";

// Supabase Admin initialization using Service Role Key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: Request) {
  try {
    const { payload } = await req.json();
    
    // Truecaller Web SDK user profile se details extract kar rahe hain
    const phoneNumber = payload?.phoneNumber;
    const firstName = payload?.firstName || "";
    const lastName = payload?.lastName || "";
    const fullName = `${firstName} ${lastName}`.trim() || "Truecaller User";
    const email = payload?.email || null;

    if (!phoneNumber) {
      return NextResponse.json({ error: "Phone number is missing from payload" }, { status: 400 });
    }

    console.log("🔄 Truecaller Auth: Supabase mein phone number check ho raha hai:", phoneNumber);

    // 1. Check karo kya ye phone number profiles table mein pehle se verified_phone me hai?
    let { data: existingUser, error: searchError } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("verified_phone", phoneNumber)
      .maybeSingle(); // Next.js 15 standard, search fail par crash nahi karega

    if (searchError) {
      console.error("❌ Supabase Search Error:", searchError);
      throw searchError;
    }

    let userId = existingUser?.id;

    // 2. Agar user nahi mila, toh fresh phone-verified profile create karenge
    if (!existingUser) {
      userId = `tc_${uuidv4()}`;
      console.log("🆕 Naya Truecaller user mila! Supabase me insert ho raha hai ID:", userId);
      
      const { error: insertError } = await supabaseAdmin
        .from("profiles")
        .insert([{
          id: userId,
          full_name: fullName,
          email: email,
          verified_phone: phoneNumber,
          is_phone_verified: true, // Truecaller se verified aaya hai isliye direct true
          created_at: new Date().toISOString(),
        }]);

      if (insertError) {
        console.error("❌ Supabase Insert Error:", insertError);
        throw insertError;
      }
      console.log("✅ Truecaller profile successfully create ho gayi database mein!");
    } else {
      console.log("ℹ️ Truecaller user pehle se exists karta hai ID:", userId);
    }

    // 3. 🔥 NEXT.JS 15 COMPLIANT COOKIE SET ENGINE
    const cookieStore = await cookies(); // Explicitly awaited for Next.js 15 dynamic APIs
    cookieStore.set({
      name: "buyzze_fast_session",
      value: userId,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30, // 30 Days session validity
      path: "/",
    });

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("❌ Truecaller Backend Route Exception:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
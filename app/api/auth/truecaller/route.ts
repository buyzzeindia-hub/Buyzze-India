export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";

// ✅ Helper function to lazily initialize Supabase ONLY at runtime
const getSupabaseAdmin = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { payload } = await req.json();
    
    const phoneNumber = payload?.phoneNumber;
    const firstName = payload?.firstName || "";
    const lastName = payload?.lastName || "";
    const fullName = `${firstName} ${lastName}`.trim() || "Truecaller User";
    const email = payload?.email || null;

    if (!phoneNumber) {
      return NextResponse.json({ error: "Phone number missing" }, { status: 400 });
    }

    let existingUser = null;

    if (email) {
      const { data: emailMatch } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("email", email)
        .order("created_at", { ascending: true })
        .limit(1);
      existingUser = emailMatch?.[0];
    }

    if (!existingUser) {
      const { data: phoneMatch } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("verified_phone", phoneNumber)
        .order("created_at", { ascending: true })
        .limit(1);
      existingUser = phoneMatch?.[0];
    }

    let userId = existingUser?.id;

    if (!existingUser) {
      userId = `tc_${uuidv4()}`;
      await supabaseAdmin.from("profiles").insert([{
        id: userId,
        full_name: fullName,
        email: email,
        verified_phone: phoneNumber,
        is_phone_verified: true,
        created_at: new Date().toISOString(),
      }]);
    } else {
      await supabaseAdmin.from("profiles").update({
        verified_phone: phoneNumber,
        is_phone_verified: true,
      }).eq("id", userId);
    }

    const cookieStore = await cookies(); 
    cookieStore.set({
      name: "buyzze_fast_session",
      value: userId!,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30, 
      path: "/",
    });

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("Truecaller Standard API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
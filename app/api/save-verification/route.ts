import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Service role key use karo — RLS bypass ke liye
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { userId, phone } = await req.json();

    if (!userId || !phone) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from("profiles")
      .update({
        is_phone_verified: true,
        verified_phone: phone,
        verified_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) {
      console.error("Supabase error:", error);
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Save verification error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
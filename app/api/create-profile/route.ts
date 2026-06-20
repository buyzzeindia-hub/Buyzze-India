export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const getSupabaseAdmin = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

export async function POST(req: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { userId, full_name, email } = await req.json();

    if (!userId || !email) {
      return NextResponse.json({ error: "userId and email required" }, { status: 400 });
    }

    if (!userId.startsWith("user_")) {
      return NextResponse.json({ error: "Invalid userId" }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from("profiles")
      .upsert(
        {
          id: userId,
          full_name: full_name?.trim() || email.split("@")[0],
          email: email.trim().toLowerCase(),
          avatar_url: null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );

    if (error) {
      console.error("Profile save error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("Profile saved:", userId);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

// ✅ Helper function to lazily initialize Supabase ONLY at runtime
const getSupabaseAdmin = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      return NextResponse.json({ status: "pending" }); 
    }

    const { requestId } = body;

    if (!requestId) {
      return NextResponse.json({ error: "Request ID is required" }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();

    const { data: authRequest, error } = await supabaseAdmin
      .from("auth_requests")
      .select("status, user_id")
      .eq("id", requestId)
      .single();

    if (error || !authRequest) {
      return NextResponse.json({ status: "pending" });
    }

    if (authRequest.status === "verified" && authRequest.user_id) {
      
      const cookieStore = await cookies();
      
      cookieStore.set({
        name: "buyzze_fast_session",
        value: authRequest.user_id,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 30, 
        path: "/",
      });

      await supabaseAdmin.from("auth_requests").delete().eq("id", requestId);

      return NextResponse.json({ status: "verified" });
    }

    return NextResponse.json({ status: "pending" });

  } catch (error: any) {
    console.error("Poll Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
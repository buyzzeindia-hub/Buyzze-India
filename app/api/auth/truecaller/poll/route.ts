export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: Request) {
  try {
    let body;
    try {
      // 🔥 FIX: Error handling for Empty or Aborted JSON Requests
      body = await req.json();
    } catch (parseError) {
      return NextResponse.json({ status: "pending" }); // Silently ignore broken requests
    }

    const { requestId } = body;

    if (!requestId) {
      return NextResponse.json({ error: "Request ID is required" }, { status: 400 });
    }

    // Database se request status check karo
    const { data: authRequest, error } = await supabaseAdmin
      .from("auth_requests")
      .select("status, user_id")
      .eq("id", requestId)
      .single();

    if (error || !authRequest) {
      return NextResponse.json({ status: "pending" });
    }

    // ✅ Agar Truecaller callback ne status 'verified' kar diya hai
    if (authRequest.status === "verified" && authRequest.user_id) {
      
      const cookieStore = await cookies();
      
      cookieStore.set({
        name: "buyzze_fast_session",
        value: authRequest.user_id,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 30, // 30 Days session duration
        path: "/",
      });

      // Temporary token cleanup from tracking table
      await supabaseAdmin.from("auth_requests").delete().eq("id", requestId);

      return NextResponse.json({ status: "verified" });
    }

    // Agar abhi bhi user ne app me click nahi kiya hai
    return NextResponse.json({ status: "pending" });

  } catch (error) {
    console.error("Polling API Critical Error:", error);
    return NextResponse.json({ status: "failed", error: "Internal server error" });
  }
}
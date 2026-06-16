import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: Request) {
  try {
    const { code } = await req.json();

    if (!code) {
      return NextResponse.json({ error: "Code is required" }, { status: 400 });
    }

    // Database se request status check karo
    const { data: waRequest, error } = await supabaseAdmin
      .from("whatsapp_requests")
      .select("status, user_id")
      .eq("code", code)
      .single();

    if (error || !waRequest) {
      return NextResponse.json({ status: "pending" });
    }

    // ✅ Agar WhatsApp callback ne status 'verified' kar diya hai
    if (waRequest.status === "verified" && waRequest.user_id) {
      
      const cookieStore = await cookies();
      
      cookieStore.set({
        name: "buyzze_fast_session",
        value: waRequest.user_id,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 30, // 30 Days
        path: "/",
      });

      // Verification ke baad table se temporary code clean kar do
      await supabaseAdmin.from("whatsapp_requests").delete().eq("code", code);

      return NextResponse.json({ status: "verified" });
    }

    return NextResponse.json({ status: "pending" });

  } catch (error) {
    console.error("WhatsApp Polling Error:", error);
    return NextResponse.json({ status: "failed", error: "Internal server error" });
  }
}
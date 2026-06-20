export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";

// ✅ Helper function to lazily initialize Supabase ONLY at runtime
const getSupabaseAdmin = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST() {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const requestId = uuidv4();

    const { error } = await supabaseAdmin
      .from("auth_requests")
      .insert([{
        id: requestId,
        status: "pending",
        user_id: null 
      }]);

    if (error) {
      console.error("Supabase Insert Error:", error.message);
      throw error;
    }

    return NextResponse.json({ 
      success: true, 
      request_id: requestId 
    });

  } catch (error: any) {
    console.error("Init API Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to initialize auth request" }, 
      { status: 500 }
    );
  }
}
export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";

// Admin client use kar rahe hain kyunki ye backend process hai
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST() {
  try {
    // 1. Ek unique Request ID generate karo
    const requestId = uuidv4();

    // 2. Database mein 'pending' status ke sath save karo
    const { error } = await supabaseAdmin
      .from("auth_requests")
      .insert([{
        id: requestId,
        status: "pending",
        user_id: null // Abhi user verify nahi hua hai
      }]);

    if (error) {
      console.error("Supabase Insert Error:", error.message);
      throw error;
    }

    // 3. Frontend ko ID wapas bhej do
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
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { jwtDecode } from "jwt-decode"; 
import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid"; 

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: Request) {
  try {
    const { credential } = await req.json();
    const decoded: any = jwtDecode(credential);
    const { email, name, picture } = decoded;

    if (!email) {
      return NextResponse.json({ error: "Invalid Token" }, { status: 400 });
    }

    // 🔥 SMART CHECK: Sabse purana account dhoondho is email se
    const { data: existingUsers } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("email", email)
      .order("created_at", { ascending: true })
      .limit(1);

    let existingUser = existingUsers?.[0];
    let userId = existingUser?.id;

    // Sirf tabhi naya account banao jab is email se koi na mile
    if (!existingUser) {
      userId = `google_${uuidv4()}`; 
      
      const { error: insertError } = await supabaseAdmin
        .from("profiles")
        .insert([{
          id: userId,
          full_name: name,
          email: email,
          avatar_url: picture,
          is_phone_verified: false, 
        }]);

      if (insertError) throw insertError;
    }

    // Session set karo
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
    console.error("Google Server Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
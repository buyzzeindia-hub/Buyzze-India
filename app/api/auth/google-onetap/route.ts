import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { jwtDecode } from "jwt-decode"; // npm install jwt-decode
import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid"; // npm install uuid

// ⚠️ API Routes mein humesha SERVICE_ROLE_KEY use hoti hai database likhne ke liye
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: Request) {
  try {
    const { credential } = await req.json();

    // 1. Decode Token
    const decoded: any = jwtDecode(credential);
    const { email, name, picture } = decoded;

    if (!email) {
      return NextResponse.json({ error: "Invalid Token" }, { status: 400 });
    }

    // 2. Check if user already exists in profiles
    let { data: existingUser } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("email", email)
      .single();

    let userId = existingUser?.id;

    // 3. Create new user if not found
    if (!existingUser) {
      userId = `google_${uuidv4()}`; // Clerk ids se alag dikhne ke liye prefix
      
      const { error: insertError } = await supabaseAdmin
        .from("profiles")
        .insert([{
          id: userId,
          full_name: name,
          email: email,
          avatar_url: picture,
          is_phone_verified: false, // Phone abhi verify nahi hua
        }]);

      if (insertError) throw insertError;
    }

    // 4. Set Fast Authentication Cookie (For our unified session)
    const cookieStore = await cookies(); // Yahan await lagana zaroori hai
    cookieStore.set({
      name: "buyzze_fast_session",
      value: userId,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30, // 30 Days login rahega
      path: "/",
    });

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("Google Server Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
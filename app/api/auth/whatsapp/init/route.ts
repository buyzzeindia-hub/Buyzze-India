import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // 1. Ek random 4-digit unique code banao (e.g., 4928)
    const randomCode = Math.floor(1000 + Math.random() * 9000).toString();
    const verificationCode = `BUYZZE-${randomCode}`;

    // 2. Database mein save karo
    const { error } = await supabaseAdmin
      .from("whatsapp_requests")
      .insert([{
        user_id: userId,
        code: verificationCode,
        status: "pending"
      }]);

    if (error) {
      console.error("Supabase Insert Error:", error.message);
      return NextResponse.json({ error: "Failed to generate code" }, { status: 500 });
    }

    // 3. WhatsApp wa.me link generate karo
    const waNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER!;
    const message = `Verify my Buyzze account.%0A%0ACode: ${verificationCode}`;
    const waLink = `https://wa.me/${waNumber}?text=${message}`;

    return NextResponse.json({ 
      success: true, 
      code: verificationCode,
      wa_link: waLink
    });

  } catch (error: any) {
    console.error("WhatsApp Init Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
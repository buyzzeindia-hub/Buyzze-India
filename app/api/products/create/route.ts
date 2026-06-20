export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { auth } from "@clerk/nextjs/server";

const getSupabaseAdmin = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    let finalUserId: string | null = null;

    try {
      const { userId } = await auth();
      finalUserId = userId;
    } catch (e) {
      finalUserId = null; 
    }

    if (!finalUserId && body.user_id) {
      finalUserId = body.user_id;
    }

    if (!finalUserId) {
      const fastSession = req.cookies.get("buyzze_fast_session")?.value;
      const sessionCookie = req.cookies.get("__session")?.value;
      finalUserId = fastSession || sessionCookie || null;
    }

    if (!finalUserId) {
      finalUserId = "user_buyzze_active_oauth";
    }

    const supabaseAdmin = getSupabaseAdmin();

    const { data, error } = await supabaseAdmin
      .from("products")
      .insert({
        title: body.title,
        description: body.description,
        price: Number(body.price),
        brand: body.brand,
        model: body.model,
        ram: body.ram,
        storage: body.storage,
        color: body.color,
        condition: body.condition,
        cond_screen: body.cond_screen || "",
        cond_body: body.cond_body || "",
        cond_cam: body.cond_cam || "",
        cond_func: body.cond_func || "",
        cond_warr: body.cond_warr || "",
        cond_age: body.cond_age || "",
        category: body.category || "Mobile",
        state: body.state,
        city: body.city,
        pincode: body.pincode,
        address: body.address,
        images: body.images || [],
        owner_id: finalUserId, 
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Product insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, product: data });
  } catch (err: any) {
    console.error("Products API error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
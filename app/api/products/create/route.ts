import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { auth } from "@clerk/nextjs/server";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

export async function POST(req: NextRequest) {
  try {
    // ✅ Sirf logged-in Clerk user insert kar sake
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

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
        category: body.category || "Mobile",
        state: body.state,
        city: body.city,
        pincode: body.pincode,
        address: body.address,
        images: body.images || [],
        owner_id: userId, // ✅ Server se set — client spoof nahi kar sakta
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Product insert error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, product: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) {
    return new Response("CLERK_WEBHOOK_SECRET missing", { status: 500 });
  }

  const headerPayload = await headers();
  const svix_id        = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Missing svix headers", { status: 400 });
  }

  const payload = await req.json();
  const body    = JSON.stringify(payload);

  let evt: WebhookEvent;
  try {
    evt = new Webhook(WEBHOOK_SECRET).verify(body, {
      "svix-id":        svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch {
    return new Response("Webhook verification failed", { status: 400 });
  }

  if (evt.type === "user.created" || evt.type === "user.updated") {
    const { id, first_name, last_name, email_addresses, image_url } = evt.data;

    const fullName = `${first_name || ""} ${last_name || ""}`.trim();
    const email    = email_addresses?.[0]?.email_address || null;

    const { error } = await supabaseAdmin.from("profiles").upsert(
      {
        id,
        full_name:  fullName || email?.split("@")[0] || null,
        email,
        avatar_url: image_url || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );

    if (error) {
      console.error("❌ Webhook Supabase error:", error.message);
      return new Response("DB error: " + error.message, { status: 500 });
    }

    console.log(`✅ Webhook profile synced: ${id}`);
  }

  if (evt.type === "user.deleted") {
    const { id } = evt.data;
    if (id) {
      await supabaseAdmin.from("profiles").delete().eq("id", id);
      console.log(`🗑️ Profile deleted: ${id}`);
    }
  }

  return new Response("OK", { status: 200 });
}
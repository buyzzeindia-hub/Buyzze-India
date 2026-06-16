import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// 🟢 PART 1: Meta Verification (GET) - Bulletproof
export async function GET(req: Request) {
  const url = new URL(req.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");

  const VERIFY_TOKEN = "buyzze_secret_whatsapp_123";

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("✅ Token Match! Meta Webhook Verified.");
    return new Response(challenge, {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  }

  return new Response("Forbidden", { status: 403 });
}

// 🟢 PART 2: Catching the WhatsApp Message & Auto-Reply Bot (POST)
export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (body.object) {
      if (
        body.entry &&
        body.entry[0].changes &&
        body.entry[0].changes[0] &&
        body.entry[0].changes[0].value.messages &&
        body.entry[0].changes[0].value.messages[0]
      ) {
        const message = body.entry[0].changes[0].value.messages[0];
        const rawPhone = message.from; // Sender ka asli phone number
        const textBody = message.text?.body; // User ka bheja hua message
        const messageId = message.id; // 🔥 Incoming message ID (Seen karne ke liye zaroori hai)

        if (textBody) {
          // Message me se "BUYZZE-XXXX" code nikalna
          const codeMatch = textBody.match(/BUYZZE-\d{4}/);
          
          if (codeMatch) {
            const code = codeMatch[0];
            const phoneNumber = "+" + rawPhone; // Format: +91XXXXXXXXXX

            console.log(`📱 WhatsApp verification received for Code: ${code} from ${phoneNumber}`);

            // 1. Database me pending code dhundo
            const { data: requestRecord, error: reqError } = await supabaseAdmin
              .from("whatsapp_requests")
              .select("user_id")
              .eq("code", code)
              .eq("status", "pending")
              .single();

            if (requestRecord && !reqError) {
              const userId = requestRecord.user_id;

              // 2. User ki profile me Phone Number update aur verify kar do
              await supabaseAdmin
                .from("profiles")
                .update({ 
                  is_phone_verified: true, 
                  verified_phone: phoneNumber,
                  updated_at: new Date().toISOString()
                })
                .eq("id", userId);

              // 3. Request tracker ko 'verified' mark kar do
              await supabaseAdmin
                .from("whatsapp_requests")
                .update({ status: "verified" })
                .eq("code", code);
                
              console.log("✅ Profile Verified via WhatsApp!");

              // 🤖 4. BOT AUTO-REPLY LOGIC: Mark as "seen" and send reply
              const PHONE_ID = process.env.WHATSAPP_PHONE_ID;
              const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

              if (PHONE_ID && ACCESS_TOKEN) {
                try {
                  const metaApiUrl = `https://graph.facebook.com/v20.0/${PHONE_ID}/messages`;
                  
                  // 🔥 Step A: Message ko "Seen" (Blue Ticks) mark karo
                  if (messageId) {
                    await fetch(metaApiUrl, {
                      method: "POST",
                      headers: {
                        "Authorization": `Bearer ${ACCESS_TOKEN}`,
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({
                        messaging_product: "whatsapp",
                        status: "read",
                        message_id: messageId
                      })
                    });
                    console.log("👀 Message marked as seen (Blue ticks)");
                  }

                  // 🔥 Step B: Verification Complete ka Reply bhejo
                  await fetch(metaApiUrl, {
                    method: "POST",
                    headers: {
                      "Authorization": `Bearer ${ACCESS_TOKEN}`,
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      messaging_product: "whatsapp",
                      to: rawPhone, // User ko wapas reply bhej rahe hain
                      type: "text",
                      text: {
                        body: "✅ *Verification Complete!*\n\nWelcome to Buyzze! Aapka phone number successfully verify ho gaya hai. Ab aap website par wapas ja sakte hain."
                      }
                    })
                  });
                  console.log("📨 Bot reply sent to user successfully!");
                } catch (botErr) {
                  console.error("❌ Failed to send bot reply or mark as read:", botErr);
                }
              } else {
                console.warn("⚠️ Bot reply skipped: PHONE_ID or ACCESS_TOKEN missing in .env.local");
              }
            }
          }
        }
      }
      return new NextResponse("EVENT_RECEIVED", { status: 200 });
    } else {
      return new NextResponse("NOT_FOUND", { status: 404 });
    }
  } catch (error) {
    console.error("WhatsApp Webhook Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
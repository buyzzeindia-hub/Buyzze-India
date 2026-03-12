import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getDatabase } from "firebase-admin/database";

// ✅ Firebase Admin SDK — server side, secure
// .env.local mein ye add karo:
// FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}  (Firebase Console → Project Settings → Service Accounts → Generate new private key)
// NEXT_PUBLIC_FIREBASE_DB_URL=https://buyzze-chat-default-rtdb.asia-southeast1.firebasebasedatabase.app

function getFirebaseAdmin() {
  if (getApps().find(app => app.name === "admin")) {
    return getApps().find(app => app.name === "admin")!;
  }

  const serviceAccount = JSON.parse(
    process.env.FIREBASE_SERVICE_ACCOUNT_KEY!
  );

  return initializeApp(
    {
      credential: cert(serviceAccount),
      databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DB_URL!,
    },
    "admin"
  );
}

// ✅ POST — Naya chat banao ya existing chat ID return karo
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sellerId, productId, productTitle, productPrice, productImage } = await req.json();

    if (!sellerId || !productId) {
      return NextResponse.json({ error: "sellerId and productId required" }, { status: 400 });
    }

    // Apne product pe message nahi kar sakte
    if (sellerId === userId) {
      return NextResponse.json({ error: "Cannot chat with yourself" }, { status: 400 });
    }

    const adminApp = getFirebaseAdmin();
    const db = getDatabase(adminApp);

    // ✅ Check — is product ke liye pehle se chat exist karti hai?
    const chatId = `product_${productId}_${sellerId}_${userId}`;
    const chatRef = db.ref(`chats/${chatId}`);
    const snap = await chatRef.get();

    if (snap.exists()) {
      // Pehle se hai — same chat ID return karo
      return NextResponse.json({ success: true, chatId });
    }

    // ✅ Naya chat banao
    await chatRef.set({
      chatId,
      productId,
      productTitle: productTitle || "",
      productPrice: productPrice || "",
      productImage: productImage || "",
      sellerId,
      buyerId: userId,
      createdAt: Date.now(),
      unread: { buyer: 0, seller: 0 },
    });

    return NextResponse.json({ success: true, chatId });
  } catch (err: any) {
    console.error("Chat API error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
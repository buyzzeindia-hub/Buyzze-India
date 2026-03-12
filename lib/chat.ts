import { db } from "./firebase";
import { ref, set, get } from "firebase/database";

export const createChatRoom = async (buyerId: string, sellerId: string, productId: string) => {
  // chatroom id unique per seller-buyer-product
  const chatRoomId = `${sellerId}_${buyerId}_${productId}`;

  const chatRef = ref(db, `chats/${chatRoomId}`);
  const snapshot = await get(chatRef);

  // If chat doesn't exist — create it
  if (!snapshot.exists()) {
    await set(chatRef, {
      participants: {
        buyerId,
        sellerId,
      },
      productId,
      messages: {},
    });

    // Add chatroom to buyer chats list
    await set(ref(db, `userChats/${buyerId}/${chatRoomId}`), true);
    // Add chatroom to seller chats list
    await set(ref(db, `userChats/${sellerId}/${chatRoomId}`), true);
  }

  return chatRoomId;
};

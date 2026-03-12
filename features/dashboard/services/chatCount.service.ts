import { ref, get } from "firebase/database";
import { database } from "@/lib/firebase";

export const getChatCountForProduct = async (
  productId: number,
  sellerId: string
): Promise<number> => {
  try {
    // ✅ Query ki jagah simple get — Firebase rules ke saath compatible
    const snap = await get(ref(database, "chats"));

    if (!snap.exists()) return 0;

    const chats = snap.val();
    let count = 0;

    Object.keys(chats).forEach((key) => {
      const chat = chats[key];
      // ✅ Is seller ka + is product ka chat count karo
      if (
        key.includes(`product_${productId}_`) &&
        chat?.sellerId === sellerId
      ) {
        count += 1;
      }
    });

    return count;
  } catch (error) {
    // ✅ Permission denied pe silently 0 return karo — dashboard crash na ho
    return 0;
  }
};
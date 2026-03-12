import { ref, remove } from "firebase/database";
import { database as db } from "@/lib/firebase";

export const chatService = {
  deleteProductChats(productId: number) {
    return remove(ref(db, `chats/${productId}`));
  },
};
import { db } from "./firebase";
import { ref, push, onValue } from "firebase/database";

export const sendMessage = async (chatRoomId: string, senderId: string, text: string) => {
  await push(ref(db, `chats/${chatRoomId}/messages`), {
    senderId,
    text,
    timestamp: Date.now(),
  });
};

export const listenToMessages = (chatRoomId: string, callback: Function) => {
  onValue(ref(db, `chats/${chatRoomId}/messages`), (snapshot) => {
    const data = snapshot.val();
    callback(data ? Object.values(data) : []);
  });
};

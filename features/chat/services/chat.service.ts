import { ref, push, onValue, off, update, remove, onDisconnect, set, get, query, limitToLast } from "firebase/database";
import { database } from "@/lib/firebase";

// --- MESSAGE FUNCTIONS ---
export const sendMessage = async (chatId: string, uid: string, text: string) => {
  const chatRef = ref(database, `chats/${chatId}`);
  const newMessageRef = push(ref(database, `chats/${chatId}/messages`));
  const now = Date.now();

  const snap = await get(chatRef);
  const chatData = snap.val();
  const receiverRole = chatData?.sellerId === uid ? "buyer" : "seller";
  const currentUnread = (chatData?.unread?.[receiverRole] || 0) + 1;

  const updates: any = {};
  updates[`chats/${chatId}/messages/${newMessageRef.key}`] = { 
    senderId: uid, text, createdAt: now, edited: false 
  };
  updates[`chats/${chatId}/lastMessageText`] = text;
  updates[`chats/${chatId}/lastMessageAt`] = now;
  updates[`chats/${chatId}/lastSenderId`] = uid;
  updates[`chats/${chatId}/unread/${receiverRole}`] = currentUnread;

  return update(ref(database), updates);
};

// DELETE FIX: Delete hone par preview update karne ka logic
export const deleteMessage = async (chatId: string, msgId: string) => {
  // 1. Message delete karein
  await remove(ref(database, `chats/${chatId}/messages/${msgId}`));

  // 2. Check karein ki kya ye last message tha?
  const lastMsgsQuery = query(ref(database, `chats/${chatId}/messages`), limitToLast(1));
  const snap = await get(lastMsgsQuery);
  const lastMsgs = snap.val();

  if (lastMsgs) {
    const [lastId, lastData]: any = Object.entries(lastMsgs)[0];
    await update(ref(database, `chats/${chatId}`), {
      lastMessageText: lastData.text,
      lastMessageAt: lastData.createdAt,
      lastSenderId: lastData.senderId
    });
  } else {
    // Agar koi message nahi bacha
    await update(ref(database, `chats/${chatId}`), {
      lastMessageText: null,
      lastMessageAt: null,
      lastSenderId: null
    });
  }
};

export const editMessage = (chatId: string, msgId: string, text: string) => {
  const updates: any = {};
  updates[`chats/${chatId}/messages/${msgId}/text`] = text;
  updates[`chats/${chatId}/messages/${msgId}/edited`] = true;
  updates[`chats/${chatId}/lastMessageText`] = text; // Preview bhi update karein
  return update(ref(database), updates);
};

export const markMessagesAsSeen = async (chatId: string, role: "buyer" | "seller") => {
  return set(ref(database, `chats/${chatId}/unread/${role}`), 0);
};

export const listenToMessages = (chatId: string, cb: any) => {
  const r = ref(database, `chats/${chatId}/messages`);
  onValue(r, (s) => {
    const v = s.val() || {};
    cb(Object.entries(v).map(([id, m]: any) => ({ id, ...m })).sort((a: any, b: any) => a.createdAt - b.createdAt));
  });
  return () => off(r);
};

export const setTyping = (chatId: string, userId: string, isTyping: boolean) => 
  set(ref(database, `chats/${chatId}/typing/${userId}`), isTyping);

export const listenTyping = (chatId: string, cb: any) => {
  const r = ref(database, `chats/${chatId}/typing`);
  onValue(r, (s) => cb(s.val() || {}));
  return () => off(r);
};

export const initUserPresence = (userId: string) => {
  const statusRef = ref(database, `users/${userId}/presence`);
  onValue(ref(database, ".info/connected"), (snap) => {
    if (snap.val() === true) {
      onDisconnect(statusRef).update({ state: "offline", lastSeen: Date.now() });
    }
  });
};

export const updateUserStatus = (userId: string, status: "online" | "offline") => 
  update(ref(database, `users/${userId}/presence`), { state: status, lastSeen: Date.now() });

export const listenUserPresence = (userId: string, cb: any) => {
  const r = ref(database, `users/${userId}/presence/state`);
  onValue(r, (s) => cb(s.val() || "offline"));
  return () => off(r);
};
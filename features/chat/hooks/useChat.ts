"use client";
import { useEffect, useRef, useState } from "react";
import { ref, onValue } from "firebase/database";
import { database } from "@/lib/firebase";
import { 
  listenToMessages, sendMessage, setTyping, listenTyping, 
  initUserPresence, listenUserPresence, updateUserStatus, 
  markMessagesAsSeen, deleteMessage, editMessage 
} from "../services/chat.service";

export const useChat = (chatId: string, userId: string | null, otherUserId: string | null) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [typingUsers, setTypingUsers] = useState<Record<string, boolean>>({});
  const [otherOnline, setOtherOnline] = useState<"online" | "offline">("offline");
  const typingTimer = useRef<any>(null);

  useEffect(() => {
    if (!userId || !chatId) return;
    initUserPresence(userId);
    updateUserStatus(userId, "online");

    // Auto Mark Seen logic
    const chatRef = ref(database, `chats/${chatId}`);
    const unsubscribe = onValue(chatRef, (snap) => {
      const data = snap.val();
      if (data) {
        const role = data.buyerId === userId ? "buyer" : "seller";
        if (data.unread?.[role] > 0) markMessagesAsSeen(chatId, role);
      }
    });

    return () => {
      updateUserStatus(userId, "offline");
      setTyping(chatId, userId, false);
      unsubscribe();
    };
  }, [userId, chatId]);

  useEffect(() => {
    if (!chatId) return;
    return listenToMessages(chatId, setMessages);
  }, [chatId]);

  useEffect(() => {
    if (!chatId) return;
    return listenTyping(chatId, setTypingUsers);
  }, [chatId]);

  useEffect(() => {
    if (!otherUserId) return;
    return listenUserPresence(otherUserId, setOtherOnline);
  }, [otherUserId]);

  const handleTyping = (v: string) => {
    setInput(v);
    if (!userId) return;
    setTyping(chatId, userId, true);
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => setTyping(chatId, userId, false), 1500);
  };

  const handleSend = async () => {
    if (!input.trim() || !userId) return;
    const text = input;
    setInput("");
    await sendMessage(chatId, userId, text);
    setTyping(chatId, userId, false);
  };

  return {
    messages, input, handleTyping, handleSend,
    deleteMessage: (id: string) => deleteMessage(chatId, id),
    editMessage: (id: string, t: string) => editMessage(chatId, id, t),
    otherTyping: otherUserId ? typingUsers[otherUserId] : false,
    otherOnline,
  };
};
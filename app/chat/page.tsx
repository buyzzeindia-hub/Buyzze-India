"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useBuyzzeAuth } from "@/hooks/useBuyzzeAuth"; // ✅ Connected to Unified Auth Hook
import { ref, onValue } from "firebase/database";
import { database } from "@/lib/firebase";

export default function ChatInboxPage() {
  const router = useRouter();
  const { user, isLoaded } = useBuyzzeAuth(); // ✅ Unified auth state mapping
  
  const [userId, setUserId] = useState<string | null>(null);
  const [buyingChats, setBuyingChats] = useState<Record<string, any>>({});
  const [sellingChats, setSellingChats] = useState<Record<string, any>>({});
  const [activeTab, setActiveTab] = useState<"selling" | "buying">("selling");
  const [loading, setLoading] = useState(true);

  // ✅ Client-side Identity Extraction (Sync with both Clerk and Fast Auth)
  useEffect(() => {
    if (user?.id) {
      setUserId(user.id);
    } else if (typeof window !== "undefined") {
      const isLogged = localStorage.getItem("buyzze_logged_in") === "true";
      if (isLogged) {
        setUserId("oauth_buyzze_active_user"); // Fallback key match for Google/Truecaller
      }
    }
  }, [user]);

  // ✅ Auth Loop Guard Fix
  useEffect(() => {
    if (!isLoaded) return;
    
    const isLoggedLocal = typeof window !== "undefined" && localStorage.getItem("buyzze_logged_in") === "true";
    
    if (!user && !isLoggedLocal) {
      router.push("/login");
    }
  }, [isLoaded, user, router]);

  // ✅ Complete Firebase Chat Fetching Engine
  useEffect(() => {
    if (!userId) return;

    const chatsRef = ref(database, "chats");

    const unsub = onValue(chatsRef, (snap) => {
      const data = snap.val();
      const buyingGroups: Record<string, any> = {};
      const sellingGroups: Record<string, any> = {};

      if (data) {
        Object.entries<any>(data).forEach(([chatId, chat]) => {
          const isSeller = chat?.sellerId === userId;
          const isBuyer = chat?.buyerId === userId;
          if (!isSeller && !isBuyer) return;

          const productTitle = chat.productTitle || chat.title || "Product";
          const productId = chat.productId || "misc";

          let lastMsg = chat.lastMessageText;
          let lastSender = chat.lastSenderId;
          let lastTime = chat.lastMessageAt || chat.createdAt || Date.now();

          if (!lastMsg && chat.messages) {
            const msgs = Object.values(chat.messages).sort((a: any, b: any) => b.createdAt - a.createdAt);
            if (msgs.length > 0) {
              lastMsg = (msgs[0] as any).text;
              lastSender = (msgs[0] as any).senderId;
              lastTime = (msgs[0] as any).createdAt;
            }
          }

          const prefix = lastMsg ? (lastSender === userId ? "YOU - " : "USER - ") : "";
          const unreadCount = isBuyer ? chat?.unread?.buyer || 0 : chat?.unread?.seller || 0;

          const chatInfo = {
            chatId,
            lastMessage: lastMsg ? `${prefix}${lastMsg}` : "No messages yet",
            time: lastTime,
            unread: unreadCount,
            otherParty: isBuyer ? "Seller" : "Buyer",
          };

          const target = isSeller ? sellingGroups : buyingGroups;
          if (!target[productId]) target[productId] = { title: productTitle, conversations: [] };
          target[productId].conversations.push(chatInfo);
        });
      }

      setBuyingChats(buyingGroups);
      setSellingChats(sellingGroups);
      setLoading(false);
    });

    return () => unsub();
  }, [userId]);

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return d.toDateString() === new Date().toDateString()
      ? d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : d.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  // Loader state handling
  if (!isLoaded || loading) return (
    <div className="min-h-screen flex items-center justify-center p-12 text-center font-black dark:text-white uppercase tracking-widest animate-pulse bg-[#F8FAFC] dark:bg-slate-950">
      Loading Inbox...
    </div>
  );

  const currentData = activeTab === "selling" ? sellingChats : buyingChats;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 min-h-screen bg-[#F8FAFC] dark:bg-slate-950 transition-colors">
      <header className="mb-10">
        <h1 className="text-5xl font-black uppercase text-slate-900 dark:text-white tracking-tighter">Inbox</h1>

        <div className="flex gap-4 mt-8 bg-slate-200/50 dark:bg-slate-800/50 p-1.5 rounded-2xl w-fit shadow-inner">
          <button onClick={() => setActiveTab("selling")} className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase transition-all ${activeTab === "selling" ? "bg-white dark:bg-slate-700 text-blue-600 shadow-md" : "text-slate-500 hover:text-slate-700"}`}>
            My Listings ({Object.keys(sellingChats).length})
          </button>
          <button onClick={() => setActiveTab("buying")} className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase transition-all ${activeTab === "buying" ? "bg-white dark:bg-slate-700 text-blue-600 shadow-md" : "text-slate-500 hover:text-slate-700"}`}>
            I'm Buying ({Object.keys(buyingChats).length})
          </button>
        </div>
      </header>

      <div className="space-y-12">
        {Object.keys(currentData).length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">No conversations yet</p>
          </div>
        ) : (
          Object.entries(currentData).map(([productId, group]: any) => (
            <section key={productId} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-4 mb-6">
                <h2 className="text-[11px] font-black uppercase text-slate-400 tracking-[0.2em]">{group.title}</h2>
                <div className="h-[2px] flex-1 bg-slate-200 dark:bg-slate-800 opacity-50"></div>
              </div>

              <div className="grid gap-4">
                {group.conversations.map((chat: any, index: number) => (
                  <div key={chat.chatId} onClick={() => router.push(`/chat/${chat.chatId}`)}
                    className={`relative flex items-center gap-5 p-6 cursor-pointer rounded-[2.5rem] border bg-white dark:bg-slate-900 transition-all hover:shadow-2xl active:scale-[0.98] group
                      ${chat.unread > 0 ? "border-blue-500 ring-2 ring-blue-50 dark:ring-blue-900/20 shadow-blue-100" : "border-slate-100 dark:border-slate-800 shadow-sm"}`}>

                    <div className={`w-14 h-14 rounded-full flex items-center justify-center text-lg font-black shrink-0 transition-all group-hover:scale-110 ${chat.unread > 0 ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30" : "bg-slate-100 dark:bg-slate-800 text-slate-400"}`}>
                      #{index + 1}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">{chat.otherParty} #{index + 1}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">{formatTime(chat.time)}</span>
                      </div>
                      <p className={`text-sm truncate ${chat.unread > 0 ? "text-slate-900 dark:text-white font-bold" : "text-slate-500 dark:text-slate-400 font-medium"}`}>
                        {chat.lastMessage}
                      </p>
                    </div>

                    {chat.unread > 0 && (
                      <div className="absolute right-6 bottom-6 h-7 min-w-[28px] px-2 flex items-center justify-center bg-blue-600 text-white text-[11px] font-black rounded-full shadow-xl animate-bounce">
                        {chat.unread}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </div>
  );
}
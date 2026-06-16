"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { useBuyzzeAuth } from "@/hooks/useBuyzzeAuth"; // ✅ Custom Unified Auth Hook
import { ref, onValue } from "firebase/database";
import { database } from "@/lib/firebase";
import { supabase } from "@/lib/supabaseClient";
import { useChat } from "./hooks/useChat";
import { ChatInput } from "./components/ChatInput";
import { ChatMessageBubble } from "./components/ChatMessage";
import { EmptyChat } from "./components/EmptyChat";
import { TypingIndicator } from "./components/TypingIndicator";

export function ChatScreen() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);

  // ✅ Unified Auth Call
  const { user, isLoaded } = useBuyzzeAuth(); 
  const [userId, setUserId] = useState<string | null>(null);

  const [otherUserId, setOtherUserId]   = useState<string | null>(null);
  const [productTitle, setProductTitle] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productImage, setProductImage] = useState("");
  const [otherUserName, setOtherUserName]     = useState("BuyZze User");
  const [otherUserAvatar, setOtherUserAvatar] = useState("");
  const [myRole, setMyRole] = useState<"buyer" | "seller" | null>(null);

  // ✅ Client-side Unified Auth ID setting
  useEffect(() => {
    if (user?.id) {
      setUserId(user.id);
    } else if (typeof window !== "undefined") {
      const isLogged = localStorage.getItem("buyzze_logged_in") === "true";
      if (isLogged) {
        setUserId("oauth_buyzze_active_user");
      }
    }
  }, [user]);

  // Firebase Chat Loading
  useEffect(() => {
    if (!isLoaded || !userId) return;

    const chatRef = ref(database, `chats/${id}`);
    const unsub = onValue(chatRef, (snap) => {
      const chat = snap.val();
      if (!chat) return;

      const isSeller = chat.sellerId === userId;
      setMyRole(isSeller ? "seller" : "buyer");

      const otherId = isSeller ? chat.buyerId : chat.sellerId;
      setOtherUserId(otherId);
      setProductTitle(chat.productTitle || chat.title || "");
      setProductPrice(
        chat.productPrice
          ? `₹${Number(chat.productPrice).toLocaleString("en-IN")}`
          : ""
      );
      setProductImage(chat.productImage || "");

      if (otherId) {
        supabase
          .from("profiles")
          .select("full_name, avatar_url")
          .eq("id", otherId)
          .single()
          .then(({ data: p }) => {
            if (p?.full_name) setOtherUserName(p.full_name);
            if (p?.avatar_url) setOtherUserAvatar(p.avatar_url);
          });
      }
    });

    return () => unsub();
  }, [id, isLoaded, userId]);

  const {
    messages, input, handleTyping, handleSend,
    deleteMessage, editMessage, otherTyping, otherOnline,
  } = useChat(id as string, userId, otherUserId);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 150;
    if (nearBottom || messages.length <= 1)
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, otherTyping]);

  const isOnline      = otherOnline === "online";
  const otherRoleLabel = myRole === "seller" ? "Buyer" : "Seller";
  const initials = otherUserName.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) || "B";

  // Auth loader safeguard
  if (!isLoaded) return null;

  return (
    <div
      className="buyzze-chat-active"
      style={{
        position: "fixed", inset: 0, zIndex: 99999,
        display: "flex", flexDirection: "column",
        height: "100dvh", overflow: "hidden",
        background: "#efeae2",
        fontFamily: "'DM Sans','Segoe UI',system-ui,sans-serif",
      }}
    >
      <header
        className="chat-header"
        style={{
          flexShrink: 0,
          background: "#fff",
          borderBottom: "1px solid #e8eaed",
          boxShadow: "0 2px 16px rgba(0,0,0,0.09)",
        }}
      >
        <div style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: "12px 16px", maxWidth: 768, margin: "0 auto", width: "100%",
        }}>

          <button
            onClick={() => router.back()}
            style={{
              width: 38, height: 38, borderRadius: "50%",
              background: "#f3f4f6", border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="#374151" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <div style={{ position: "relative", flexShrink: 0 }}>
            <div style={{
              width: 46, height: 46, borderRadius: "50%", overflow: "hidden",
              background: otherUserAvatar ? "transparent" : "linear-gradient(135deg,#6366f1,#8b5cf6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 15, fontWeight: 700, color: "#fff",
              outline: isOnline ? "2.5px solid #22c55e" : "2px solid #e5e7eb",
              outlineOffset: 2,
            }}>
              {otherUserAvatar
                ? <img src={otherUserAvatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : initials}
            </div>
            <span style={{
              position: "absolute", bottom: 1, right: 1,
              width: 12, height: 12, borderRadius: "50%",
              border: "2.5px solid #fff",
              background: isOnline ? "#22c55e" : "#9ca3af",
              boxShadow: isOnline ? "0 0 0 3px rgba(34,197,94,.2),0 0 8px rgba(34,197,94,.5)" : "none",
              transition: "all .4s",
            }} />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <span style={{
                fontSize: 15, fontWeight: 600, color: "#111827",
                lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 170,
              }}>
                {otherUserName}
              </span>
              {myRole && (
                <span style={{
                  fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em",
                  padding: "2px 8px", borderRadius: 99, flexShrink: 0,
                  background: myRole === "seller" ? "#eff6ff" : "#f0fdf4",
                  color: myRole === "seller" ? "#2563eb" : "#16a34a",
                  border: `1px solid ${myRole === "seller" ? "#dbeafe" : "#dcfce7"}`,
                }}>
                  {otherRoleLabel}
                </span>
              )}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 3, height: 16 }}>
              {otherTyping ? (
                <span style={{ fontSize: 11.5, fontWeight: 600, color: "#16a34a" }}>typing…</span>
              ) : isOnline ? (
                <>
                  <span style={{
                    width: 6, height: 6, borderRadius: "50%", background: "#22c55e", flexShrink: 0,
                    boxShadow: "0 0 6px rgba(34,197,94,.8)",
                  }} />
                  <span style={{ fontSize: 11.5, fontWeight: 600, color: "#16a34a" }}>online</span>
                </>
              ) : (
                <span style={{ fontSize: 11.5, color: "#9ca3af" }}>last seen recently</span>
              )}
            </div>
          </div>

          <button style={{
            width: 38, height: 38, borderRadius: "50%",
            background: "transparent", border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <svg width="4" height="18" viewBox="0 0 4 18" fill="#9ca3af">
              <circle cx="2" cy="2" r="1.8" />
              <circle cx="2" cy="9" r="1.8" />
              <circle cx="2" cy="16" r="1.8" />
            </svg>
          </button>
        </div>

        {productTitle && (
          <div style={{ padding: "0 16px 12px", maxWidth: 768, margin: "0 auto", width: "100%" }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "10px 14px",
              background: "linear-gradient(135deg,#eff6ff 0%,#f0fdf4 100%)",
              border: "1px solid #dbeafe", borderRadius: 16,
            }}>
              <div style={{
                width: 42, height: 42, borderRadius: 11, flexShrink: 0,
                background: "#fff", border: "1px solid #e5e7eb",
                display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden",
              }}>
                {productImage
                  ? <img src={productImage} alt="" style={{ width: "100%", height: "100%", objectFit: "contain", padding: 4 }} />
                  : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                      stroke="#6366f1" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                      <line x1="3" y1="6" x2="21" y2="6" />
                      <path d="M16 10a4 4 0 0 1-8 0" />
                    </svg>
                  )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  fontSize: 9.5, fontWeight: 700, textTransform: "uppercase",
                  letterSpacing: ".08em", color: "#93c5fd", marginBottom: 2,
                }}>
                  {productTitle} — {otherRoleLabel}
                </p>
                <p style={{
                  fontSize: 13, fontWeight: 600, color: "#1e3a5f",
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>
                  {productTitle}
                </p>
                {productPrice && (
                  <p style={{ fontSize: 12, fontWeight: 700, color: "#16a34a", marginTop: 1 }}>
                    {productPrice}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      <main
        ref={scrollRef}
        style={{
          flex: 1, overflowY: "auto", overscrollBehavior: "contain",
          background: "#efeae2",
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.025'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      >
        <div style={{ maxWidth: 768, margin: "0 auto", padding: "12px 8px 20px" }}>
          {messages.length === 0 ? (
            <EmptyChat />
          ) : (
            <>
              {messages.map((m, index) => (
                <ChatMessageBubble
                  key={m.id}
                  message={m}
                  isMe={m.senderId === userId}
                  isFirst={index === 0}
                  onDelete={() => deleteMessage(m.id)}
                  onEdit={(t: string) => editMessage(m.id, t)}
                />
              ))}
              {otherTyping && (
                <div style={{ marginTop: 4 }}>
                  <TypingIndicator text="typing" />
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <footer style={{ flexShrink: 0 }}>
        <div style={{ maxWidth: 768, margin: "0 auto", width: "100%" }}>
          <ChatInput value={input} onChange={handleTyping} onSend={handleSend} />
        </div>
      </footer>
    </div>
  );
}
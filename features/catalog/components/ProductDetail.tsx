"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ref, set, get } from "firebase/database";
import { database } from "@/lib/firebase";
import { SellerMiniCard } from "@/features/sellers/components/SellerMiniCard";
import { SimilarProducts } from "./SimilarProducts";
import Image from "next/image";

/* ═══════════════════════════════════════════════
   ICONS
═══════════════════════════════════════════════ */
const IC = {
  ram: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="2" y="8" width="20" height="8" rx="2"/>
      <path d="M6 8V6m4 2V6m4 2V6m4 2V6M6 16v2m4-2v2m4-2v2m4-2v2"/>
    </svg>
  ),
  storage: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <ellipse cx="12" cy="5" rx="9" ry="3"/>
      <path d="M21 12c0 1.66-4.03 3-9 3S3 13.66 3 12"/>
      <path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5"/>
    </svg>
  ),
  color: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="13.5" cy="6.5" r="2.5"/>
      <circle cx="17.5" cy="10.5" r="2.5"/>
      <circle cx="8.5" cy="7.5" r="2.5"/>
      <circle cx="6.5" cy="12.5" r="2.5"/>
      <path d="M12 22c4.42 0 8-3.58 8-8s-8-12-8-12S4 9.58 4 14s3.58 8 8 8z"/>
    </svg>
  ),
  condition: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
  brand: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
      <line x1="7" y1="7" x2="7.01" y2="7"/>
    </svg>
  ),
  model: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="5" y="2" width="14" height="20" rx="2"/>
      <line x1="12" y1="18" x2="12.01" y2="18"/>
    </svg>
  ),
  category: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="3" width="7" height="7"/>
      <rect x="14" y="3" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/>
      <rect x="3" y="14" width="7" height="7"/>
    </svg>
  ),
  chat: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>
    </svg>
  ),
  heart: (filled: boolean) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? "#EF4444" : "none"} stroke={filled ? "#EF4444" : "currentColor"} strokeWidth="2">
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
    </svg>
  ),
  flag: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
      <line x1="4" y1="22" x2="4" y2="15"/>
    </svg>
  ),
  share: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="18" cy="5" r="3"/>
      <circle cx="6" cy="12" r="3"/>
      <circle cx="18" cy="19" r="3"/>
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
    </svg>
  ),
  back: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M19 12H5M12 5l-7 7 7 7"/>
    </svg>
  ),
  chevron: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="9,18 15,12 9,6"/>
    </svg>
  ),
};

/* ═══════════════════════════════════════════════
   RATE BADGE  (color-coded)
═══════════════════════════════════════════════ */
function RateBadge({ r }: { r: number }) {
  const bg = r >= 4 ? "#16A34A" : r >= 3 ? "#FBBF24" : r >= 2 ? "#F97316" : "#DC2626";
  const tc = r >= 3 && r < 4 ? "#1a1a1a" : "white";
  return (
    <span
      className="inline-flex items-center gap-1 text-[11px] font-black px-2 py-[3px] rounded-lg"
      style={{ background: bg, color: tc }}
    >
      {r.toFixed(1)}
      <svg width="9" height="9" viewBox="0 0 24 24" fill={tc}>
        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
      </svg>
    </span>
  );
}

/* ═══════════════════════════════════════════════
   STARS
═══════════════════════════════════════════════ */
function Stars({
  val,
  size = 13,
  interactive = false,
  onChange,
}: {
  val: number;
  size?: number;
  interactive?: boolean;
  onChange?: (v: number) => void;
}) {
  const [hov, setHov] = useState(0);
  const show = hov || val;
  return (
    <span className="inline-flex items-center gap-[2px]">
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          style={{ cursor: interactive ? "pointer" : "default", display: "inline-flex" }}
          onMouseEnter={() => interactive && setHov(i)}
          onMouseLeave={() => interactive && setHov(0)}
          onClick={() => interactive && onChange?.(i)}
        >
          <svg
            width={size} height={size} viewBox="0 0 24 24"
            fill={show >= i ? "#FBBF24" : "none"}
            stroke={show >= i ? "#FBBF24" : "#D1D5DB"}
            strokeWidth="1.5"
          >
            <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
          </svg>
        </span>
      ))}
    </span>
  );
}

/* ═══════════════════════════════════════════════
   REVIEW POPUP
═══════════════════════════════════════════════ */
function ReviewPopup({
  productId,
  onClose,
  onDone,
}: {
  productId: number;
  onClose: () => void;
  onDone: () => void;
}) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);
  const labels = ["", "Poor 😞", "Fair 😐", "Good 🙂", "Very Good 😊", "Excellent 🤩"];

  const submit = async () => {
    if (!rating) { setErr("Please select a rating"); return; }
    setLoading(true); setErr("");
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: productId, rating, comment }),
      });
      const d = await res.json();
      if (d.success) {
        setDone(true);
        localStorage.setItem(`reviewed_${productId}`, "1");
        setTimeout(onDone, 1400);
      } else {
        setErr(d.error || "Failed to submit");
      }
    } catch { setErr("Something went wrong"); }
    finally { setLoading(false); }
  };

  return (
    <div
      className="fixed inset-0 z-[500] flex items-end sm:items-center justify-center"
      style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white dark:bg-[#181818] w-full max-w-sm mx-3 rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl">
        <div className="px-6 pt-5 pb-4" style={{ background: "linear-gradient(135deg,#1A56DB,#1e3a8a)" }}>
          <p className="text-white font-black text-sm">Rate this Product</p>
          <p className="text-blue-200 text-[11px] mt-0.5 font-medium">Help others make smarter decisions</p>
        </div>
        <div className="px-6 py-5">
          {done ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: "#DCFCE7" }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5">
                  <polyline points="20,6 9,17 4,12"/>
                </svg>
              </div>
              <p className="font-black text-gray-900 dark:text-white text-sm">Review Submitted!</p>
              <p className="text-[11px] text-gray-400 mt-1">Thank you for your honest feedback</p>
            </div>
          ) : (
            <>
              <div className="flex flex-col items-center gap-2 mb-5 py-2">
                <Stars val={rating} size={40} interactive onChange={setRating} />
                {rating > 0 && (
                  <span className="text-xs font-black" style={{ color: "#FBBF24" }}>
                    {labels[rating]}
                  </span>
                )}
              </div>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Write your review... (optional)"
                rows={3}
                className="w-full text-xs bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 resize-none outline-none text-gray-700 dark:text-gray-200 placeholder:text-gray-400 font-medium mb-3 focus:border-blue-400 transition-colors"
              />
              {err && <p className="text-[11px] text-red-500 font-bold mb-3">{err}</p>}
              <div className="flex gap-2.5">
                <button onClick={onClose} className="flex-1 py-3 rounded-2xl text-xs font-black text-gray-400 border-2 border-gray-200 dark:border-gray-700">
                  Skip
                </button>
                <button
                  onClick={submit}
                  disabled={loading || !rating}
                  className="flex-1 py-3 rounded-2xl text-xs font-black text-white flex items-center justify-center gap-2 disabled:opacity-50"
                  style={{ background: rating ? "#1A56DB" : "#9CA3AF" }}
                >
                  {loading && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  Submit
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════ */
export function ProductDetail({
  product,
  userId,
}: {
  product: any;
  userId: string | null;
}) {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);

  const [active, setActive]               = useState(0);
  const [mobileZoom, setMobileZoom]       = useState(false);
  const [showZoom, setShowZoom]           = useState(false);
  const [zoomPos, setZoomPos]             = useState({ x: 50, y: 50 });
  const [chatLoading, setChatLoading]     = useState(false);
  const [isFav, setIsFav]                 = useState(false);
  const [favLoading, setFavLoading]       = useState(false);
  const [showReviewPopup, setShowReviewPopup] = useState(false);
  const [reviews, setReviews]             = useState<any[]>([]);
  const [avgRating, setAvgRating]         = useState(0);
  const [totalReviews, setTotalReviews]   = useState(0);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [copied, setCopied]               = useState(false);

  if (!product) return null;

  const images = Array.isArray(product?.images) && product.images.length > 0
    ? product.images
    : ["/placeholder.png"];
  const isOwner = userId === product.owner_id;
  const discount = (product.id % 15) + 1;

  const specSections = [
    { label: "RAM",       icon: IC.ram,       value: product.ram },
    { label: "Storage",   icon: IC.storage,   value: product.storage },
    { label: "Color",     icon: IC.color,     value: product.color },
    { label: "Condition", icon: IC.condition, value: product.condition },
    { label: "Brand",     icon: IC.brand,     value: product.brand },
    { label: "Model",     icon: IC.model,     value: product.model },
    { label: "Category",  icon: IC.category,  value: product.category },
  ].filter((s) => s.value);

  /* load reviews */
  const loadReviews = useCallback(() => {
    if (!product?.id) return;
    setReviewsLoading(true);
    fetch(`/api/reviews?product_id=${product.id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setReviews(d.reviews || []);
          setAvgRating(d.average || 0);
          setTotalReviews(d.total || 0);
        }
      })
      .catch(() => {})
      .finally(() => setReviewsLoading(false));
  }, [product?.id]);

  useEffect(() => { loadReviews(); }, [loadReviews]);

  /* load favorites */
  useEffect(() => {
    if (!userId || !product?.id) return;
    fetch("/api/favorites")
      .then((r) => r.json())
      .then((d) => setIsFav(d.favorites?.some((f: any) => f.product_id === product.id)))
      .catch(() => {});
  }, [userId, product?.id]);

  /* auto review popup */
  useEffect(() => {
    if (!userId || !product?.id || isOwner) return;
    const already = localStorage.getItem(`reviewed_${product.id}`);
    if (localStorage.getItem(`show_review_${product.id}`) === "1" && !already) {
      setShowReviewPopup(true);
      localStorage.removeItem(`show_review_${product.id}`);
    }
  }, [userId, product?.id]);

  const scrollTo = (i: number) => {
    scrollRef.current?.scrollTo({ left: i * scrollRef.current.offsetWidth, behavior: "smooth" });
    setActive(i);
  };

  const toggleFav = async () => {
    if (!userId) { router.push("/login"); return; }
    setFavLoading(true);
    try {
      const r = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: product.id }),
      });
      const d = await r.json();
      if (d.success) setIsFav(d.action === "added");
    } catch {}
    finally { setFavLoading(false); }
  };

  const startChat = async () => {
    if (!userId) { router.push("/login"); return; }
    if (isOwner) { alert("This is your own product"); return; }
    setChatLoading(true);
    try {
      const chatId = `product_${product.id}_${product.owner_id}_${userId}`;
      const chatRef = ref(database, `chats/${chatId}`);
      const snap = await get(chatRef);
      if (!snap.exists()) {
        await set(chatRef, {
          productId: product.id, title: product.title,
          productTitle: product.title, productPrice: product.price,
          productImage: images[0] || "", sellerId: product.owner_id,
          buyerId: userId, createdAt: Date.now(),
          lastMessageText: null, lastMessageAt: null,
        });
      }
      localStorage.setItem(`show_review_${product.id}`, "1");
      router.push(`/chat/${chatId}`);
    } catch (e) { console.error(e); }
    finally { setChatLoading(false); }
  };

  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true); setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  /* ════════════════════════════════════════
     RENDER
  ════════════════════════════════════════ */
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        .pd { font-family: 'Nunito', sans-serif; }
        .hs::-webkit-scrollbar { display: none; }
        .hs { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes fu {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .a1{animation:fu .35s ease both;}
        .a2{animation:fu .35s .07s ease both;}
        .a3{animation:fu .35s .14s ease both;}
        .a4{animation:fu .35s .21s ease both;}
        .a5{animation:fu .35s .28s ease both;}
        .a6{animation:fu .35s .35s ease both;}

        /* spec card dark mode */
        .spec-card { background:#F8FAFF; border:1.5px solid #E0E7FF; }
        .dark .spec-card { background:#111827; border-color:#1e2d4a; }
      `}</style>

      {/* ── Review Popup ── */}
      {showReviewPopup && (
        <ReviewPopup
          productId={product.id}
          onClose={() => setShowReviewPopup(false)}
          onDone={() => { setShowReviewPopup(false); loadReviews(); }}
        />
      )}

      {/* ── Mobile full-screen zoom ── */}
      {mobileZoom && (
        <div className="fixed inset-0 z-[300] bg-black flex flex-col">
          <div className="flex items-center justify-between px-4 py-3">
            <button onClick={() => setMobileZoom(false)} className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white">
              {IC.back}
            </button>
            <span className="text-white/50 text-xs font-bold">{active + 1} / {images.length}</span>
            <div className="w-9" />
          </div>
          <div className="flex-1 flex items-center justify-center p-4">
            <img src={images[active]} className="max-w-full max-h-full object-contain" alt="" />
          </div>
          {images.length > 1 && (
            <div className="flex justify-center gap-1.5 pb-8">
              {images.map((_: any, i: number) => (
                <button key={i} onClick={() => setActive(i)} className="h-1 rounded-full transition-all"
                  style={{ width: active === i ? 22 : 6, background: active === i ? "#1A56DB" : "rgba(255,255,255,0.25)" }} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ════ PAGE ════ */}
      <div className="pd min-h-screen bg-[#F1F3F6] dark:bg-[#0D0D0D]" style={{ paddingBottom: 80 }}>

        {/* ── Mobile sticky header ── */}
        <div className="lg:hidden sticky top-0 z-40 flex items-center gap-3 px-4 py-3 bg-white dark:bg-[#181818]"
          style={{ borderBottom: "1px solid #F0F0F0", boxShadow: "0 1px 8px rgba(0,0,0,0.06)" }}>
          <button onClick={() => router.back()}
            className="w-9 h-9 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300">
            {IC.back}
          </button>
          <p className="flex-1 text-xs font-bold text-gray-800 dark:text-gray-100 truncate">{product.title}</p>
          <button onClick={share}
            className="w-9 h-9 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-500">
            {copied
              ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5"><polyline points="20,6 9,17 4,12"/></svg>
              : IC.share}
          </button>
          {!isOwner && (
            <button onClick={toggleFav}
              className="w-9 h-9 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
              {IC.heart(isFav)}
            </button>
          )}
        </div>

        {/* ── Desktop breadcrumb ── */}
        <div className="hidden lg:block bg-white dark:bg-[#181818] border-b border-gray-100 dark:border-gray-800">
          <div className="max-w-7xl mx-auto px-6 py-2.5 flex items-center gap-1 text-[11px] text-gray-400 font-semibold">
            <button onClick={() => router.push("/")} className="hover:text-blue-600 transition-colors">Home</button>
            {IC.chevron}
            <span>{product.category || "Mobiles"}</span>
            {IC.chevron}
            <span className="text-gray-600 dark:text-gray-300 truncate max-w-xs">{product.title}</span>
          </div>
        </div>

        {/* ════ MAIN GRID ════ */}
        <div className="max-w-7xl mx-auto lg:px-6 lg:py-5">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-6">

            {/* ─────────────────────────────
                LEFT — Image column
            ───────────────────────────── */}
            <div className="lg:col-span-5">

              {/* Main image box */}
              <div
                className="bg-white dark:bg-[#181818] lg:rounded-3xl relative overflow-hidden a1"
                style={{ aspectRatio: "1/1", cursor: "crosshair" }}
                onMouseEnter={() => setShowZoom(true)}
                onMouseLeave={() => setShowZoom(false)}
                onMouseMove={(e) => {
                  const r = e.currentTarget.getBoundingClientRect();
                  setZoomPos({
                    x: ((e.clientX - r.left) / r.width) * 100,
                    y: ((e.clientY - r.top) / r.height) * 100,
                  });
                }}
                onClick={() => window.innerWidth < 1024 && setMobileZoom(true)}
              >
                {/* Condition badge — Yellow bg, Black text */}
                <div className="absolute top-3 left-3 z-20 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow"
                  style={{ background: "#FBBF24", color: "#111827" }}>
                  {product.condition}
                </div>

                {/* Best Value badge — top right, green */}
                <div className="absolute top-3 right-3 z-20 flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-full shadow"
                  style={{ background: "#16A34A", color: "white" }}>
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="white">
                    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
                  </svg>
                  BEST VALUE
                </div>

                {/* Dot indicators */}
                {images.length > 1 && (
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
                    {images.map((_: any, i: number) => (
                      <div key={i} className="h-1.5 rounded-full transition-all"
                        style={{ width: active === i ? 20 : 6, background: active === i ? "#1A56DB" : "rgba(0,0,0,0.18)" }} />
                    ))}
                  </div>
                )}

                {/* Scrollable images */}
                <div
                  ref={scrollRef}
                  className="flex overflow-x-auto snap-x snap-mandatory h-full hs"
                  onScroll={() => {
                    if (scrollRef.current)
                      setActive(Math.round(scrollRef.current.scrollLeft / scrollRef.current.offsetWidth));
                  }}
                >
                  {images.map((img: string, i: number) => (
                    <div key={i} className="min-w-full h-full snap-center flex items-center justify-center p-8">
                      <img src={img} className="w-full h-full object-contain pointer-events-none select-none" alt={`img-${i}`} />
                    </div>
                  ))}
                </div>

                {/* Desktop Amazon-zoom overlay */}
                {showZoom && images[active] && (
                  <div
                    className="hidden lg:block absolute inset-0 z-30 pointer-events-none lg:rounded-3xl"
                    style={{
                      backgroundImage: `url('${images[active]}')`,
                      backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
                      backgroundSize: "300%",
                      backgroundRepeat: "no-repeat",
                    }}
                  />
                )}

                {/* Prev / Next arrows */}
                {images.length > 1 && active > 0 && (
                  <button onClick={(e) => { e.stopPropagation(); scrollTo(active - 1); }}
                    className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 bg-white/90 dark:bg-gray-800 rounded-full shadow flex items-center justify-center">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6"/></svg>
                  </button>
                )}
                {images.length > 1 && active < images.length - 1 && (
                  <button onClick={(e) => { e.stopPropagation(); scrollTo(active + 1); }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 bg-white/90 dark:bg-gray-800 rounded-full shadow flex items-center justify-center">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
                  </button>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="bg-white dark:bg-[#181818] flex gap-2 px-3 py-2.5 hs overflow-x-auto lg:rounded-b-2xl"
                  style={{ borderTop: "1px solid #F5F5F5" }}>
                  {images.map((img: string, i: number) => (
                    <button key={i} onClick={() => scrollTo(i)}
                      className="flex-shrink-0 rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-900 transition-all"
                      style={{
                        width: 52, height: 52,
                        border: active === i ? "2.5px solid #1A56DB" : "2px solid transparent",
                        opacity: active === i ? 1 : 0.5,
                        transform: active === i ? "scale(1.06)" : "scale(1)",
                      }}>
                      <Image src={img} alt="" width={52} height={52} className="object-contain p-1" />
                    </button>
                  ))}
                </div>
              )}

            </div>{/* end image column */}

            {/* ─────────────────────────────
                RIGHT — Details column
            ───────────────────────────── */}
            <div className="lg:col-span-7 flex flex-col gap-2 lg:gap-3">

              {/* ①  Title + Price
                  IMAGE KE BAAD SEEDHA YAHI DIKHEGA */}
              <div className="bg-white dark:bg-[#181818] px-5 py-5 mt-2 lg:mt-0 lg:rounded-3xl shadow-sm a1">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                  {product.brand} · {product.category}
                </p>
                <h1 className="text-lg lg:text-xl font-extrabold text-gray-900 dark:text-white leading-tight mb-3">
                  {product.title}
                </h1>

                {/* Inline rating chip (just badge + stars + count) */}
                {totalReviews > 0 && (
                  <div className="flex items-center gap-2 mb-3">
                    <RateBadge r={avgRating} />
                    <Stars val={Math.round(avgRating)} size={12} />
                    <span className="text-[11px] font-bold text-gray-400">({totalReviews} Reviews)</span>
                  </div>
                )}

                {/* Price row */}
                <div className="flex flex-wrap items-center gap-3 mb-1">
                  <span className="text-2xl lg:text-3xl font-black text-black dark:text-white">
                    ₹{product.price?.toLocaleString("en-IN")}
                  </span>
                  <span className="text-xs font-black px-2.5 py-1 rounded-lg"
                    style={{ background: "#DCFCE7", color: "#15803D" }}>
                    {discount}% OFF
                  </span>
                </div>
                <p className="text-[10px] text-gray-400 font-medium">Inclusive of all taxes · No hidden charges</p>
              </div>

              {/* ②  Product Specifications — grid card style */}
              {specSections.length > 0 && (
                <div className="bg-white dark:bg-[#181818] px-5 py-5 lg:rounded-3xl shadow-sm a2">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">
                    Product Specifications
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {specSections.map((s, i) => (
                      <div key={i} className="spec-card flex flex-col gap-2 p-3 rounded-2xl">
                        <div className="text-blue-600 dark:text-blue-400">{s.icon}</div>
                        <div>
                          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">{s.label}</p>
                          <p className="text-[12px] font-black text-gray-800 dark:text-gray-200 leading-tight">{s.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ③  Desktop CTA buttons */}
              <div className="hidden lg:flex gap-3 a2">
                <button onClick={startChat} disabled={chatLoading}
                  className="flex-1 py-3.5 rounded-2xl text-sm font-black text-white flex items-center justify-center gap-2.5 transition-all active:scale-[0.98]"
                  style={{ background: "linear-gradient(135deg,#1A56DB,#1e3a8a)", boxShadow: "0 8px 24px rgba(26,86,219,0.28)" }}>
                  {chatLoading
                    ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    : IC.chat}
                  {chatLoading ? "Opening..." : "Chat with Seller"}
                </button>
                {!isOwner && (
                  <button onClick={toggleFav} disabled={favLoading}
                    className="px-5 py-3.5 rounded-2xl text-sm font-black flex items-center gap-2 border-2 transition-all active:scale-[0.98]"
                    style={isFav
                      ? { background: "#FFF1F2", color: "#EF4444", borderColor: "#FCA5A5" }
                      : { background: "white", color: "#6B7280", borderColor: "#E5E7EB" }}>
                    {IC.heart(isFav)}
                    {isFav ? "Saved" : "Wishlist"}
                  </button>
                )}
              </div>

              {/* ④  BuYzze Assured — blue gradient, same as search card */}
              <div className="bg-white dark:bg-[#181818] px-4 py-3.5 lg:rounded-2xl a3">
                <div className="flex items-center gap-3 px-4 py-3 rounded-2xl"
                  style={{ background: "linear-gradient(135deg,#1A56DB,#1e3a8a)" }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-white/20">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-black text-white">BuYzze Assured</p>
                    <p className="text-[10px] text-blue-200 font-medium mt-0.5">
                      Quality checked · Verified seller · Safe transaction
                    </p>
                  </div>
                  <div className="bg-white/20 p-1 rounded-full flex-shrink-0">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                      <polyline points="20,6 9,17 4,12"/>
                    </svg>
                  </div>
                </div>
              </div>

              {/* ⑤  Pickup Location — full address card */}
              <div className="bg-white dark:bg-[#181818] px-5 py-4 lg:rounded-3xl shadow-sm a3">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
                  Pickup Location
                </p>
                <div className="flex items-start gap-3 p-4 rounded-2xl"
                  style={{ background: "#EEF2FF", border: "1.5px solid #C7D2FE" }}>
                  {/* Blue pin icon */}
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: "#1A56DB" }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                  </div>
                  {/* Full address */}
                  <div className="flex-1 min-w-0">
                    {product.address && (
                      <p className="text-[12px] font-black text-gray-800 dark:text-gray-100 mb-0.5">
                        {product.address}
                      </p>
                    )}
                    <p className="text-[11px] font-bold text-gray-600 dark:text-gray-300">
                      {[product.city, product.state].filter(Boolean).join(", ")}
                    </p>
                    {product.pincode && (
                      <p className="text-[10px] font-semibold text-gray-400 mt-0.5">
                        PIN: {product.pincode}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* ⑥  Seller */}
              <div className="bg-white dark:bg-[#181818] px-5 py-4 lg:rounded-3xl shadow-sm a4">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
                  Trusted Seller
                </p>
                <SellerMiniCard sellerId={product.owner_id} />
              </div>

              {/* ⑦  REVIEWS SECTION  ← yahan rating summary bhi hai
                  (similar products ke bilkul upar) */}
              <div className="bg-white dark:bg-[#181818] px-5 py-5 lg:rounded-3xl shadow-sm a5">

                {/* Header row */}
                <div className="flex items-center justify-between mb-5">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Customer Reviews
                  </p>
                  {userId && !isOwner && (
                    <button onClick={() => setShowReviewPopup(true)}
                      className="text-[11px] font-black px-3 py-1.5 rounded-full transition-all active:scale-95"
                      style={{ background: "#EEF2FF", color: "#1A56DB", border: "1px solid #C7D2FE" }}>
                      + Rate Product
                    </button>
                  )}
                </div>

                {/* ── Rating Summary (1★–5★ bar chart) ──
                    YAHAN HAI — reviews ke saath, similar ke upar */}
                <div className="flex items-center gap-4 mb-6 pb-5"
                  style={{ borderBottom: "1.5px solid #F3F4F6" }}>

                  {/* Big score box */}
                  <div
                    className="flex flex-col items-center justify-center w-[80px] h-[80px] rounded-2xl flex-shrink-0"
                    style={{
                      background:
                        avgRating >= 4 ? "#DCFCE7"
                        : avgRating >= 3 ? "#FEF9C3"
                        : avgRating > 0 ? "#FEE2E2"
                        : "#F3F4F6",
                    }}
                  >
                    <span
                      className="text-[32px] font-black leading-none"
                      style={{
                        color:
                          avgRating >= 4 ? "#16A34A"
                          : avgRating >= 3 ? "#B45309"
                          : avgRating > 0 ? "#DC2626"
                          : "#9CA3AF",
                      }}
                    >
                      {avgRating > 0 ? avgRating.toFixed(1) : "—"}
                    </span>
                    <Stars val={Math.round(avgRating)} size={11} />
                    <span className="text-[9px] text-gray-400 mt-1 font-semibold">{totalReviews} ratings</span>
                  </div>

                  {/* Bar rows 5→1 */}
                  <div className="flex-1">
                    {[5, 4, 3, 2, 1].map((s) => {
                      const cnt = reviews.filter((r) => r.rating === s).length;
                      const pct = totalReviews > 0 ? (cnt / totalReviews) * 100 : 0;
                      const barColor =
                        s >= 4 ? "#16A34A" : s === 3 ? "#FBBF24" : s === 2 ? "#F97316" : "#DC2626";
                      return (
                        <div key={s} className="flex items-center gap-2 mb-[5px]">
                          <span className="text-[10px] font-black text-gray-500 w-2 text-right">{s}</span>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="#FBBF24">
                            <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
                          </svg>
                          <div className="flex-1 h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-700"
                              style={{ width: `${pct}%`, background: barColor }}
                            />
                          </div>
                          <span className="text-[10px] text-gray-400 w-4 text-right font-bold">{cnt}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* ── Individual review rows ── */}
                {reviewsLoading ? (
                  <div className="flex justify-center py-8">
                    <span className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin"
                      style={{ borderColor: "#1A56DB", borderTopColor: "transparent" }} />
                  </div>
                ) : reviews.length === 0 ? (
                  <div className="text-center py-6">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
                      style={{ background: "#F3F4F6" }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5">
                        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
                      </svg>
                    </div>
                    <p className="text-xs font-black text-gray-400">No reviews yet</p>
                    <p className="text-[11px] text-gray-300 dark:text-gray-600 mt-0.5">Be the first to review!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reviews.slice(0, 5).map((r: any) => (
                      <div key={r.id} className="pb-4 last:pb-0"
                        style={{ borderBottom: "1px solid #F3F4F6" }}>
                        {/* top row: avatar + name + badge */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0"
                              style={{ background: "#DBEAFE", color: "#1D4ED8" }}>
                              {(r.profiles?.full_name || "U")[0].toUpperCase()}
                            </div>
                            <p className="text-[11px] font-black text-gray-800 dark:text-white">
                              {r.profiles?.full_name || "Anonymous"}
                            </p>
                          </div>
                          <RateBadge r={r.rating} />
                        </div>
                        {/* comment */}
                        {r.comment && (
                          <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium leading-relaxed ml-9">
                            {r.comment}
                          </p>
                        )}
                        {/* date */}
                        <p className="text-[9px] text-gray-300 dark:text-gray-600 mt-1 ml-9">
                          {new Date(r.created_at).toLocaleDateString("en-IN", {
                            day: "numeric", month: "short", year: "numeric",
                          })}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>{/* end reviews section */}

              {/* ⑧  Similar Products — last */}
              <div className="bg-white dark:bg-[#181818] px-5 py-5 lg:rounded-3xl shadow-sm a6">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">
                  You might also like
                </p>
                <SimilarProducts
                  productId={product.id}
                  brand={product.brand}
                  category={product.category}
                  price={product.price}
                  city={product.city ?? ""}
                  state={product.state ?? ""}
                />
              </div>

            </div>{/* end details column */}
          </div>
        </div>

        {/* ════ MOBILE FIXED BOTTOM BAR ════ */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-[#181818] px-4 py-2.5 flex items-center gap-2.5"
          style={{ borderTop: "1px solid #F0F0F0", boxShadow: "0 -6px 24px rgba(0,0,0,0.08)" }}>
          {/* Report */}
          <button className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 text-gray-400"
            style={{ border: "2px solid #F0F0F0" }}>
            {IC.flag}
          </button>
          {/* Wishlist */}
          {!isOwner && (
            <button onClick={toggleFav} disabled={favLoading}
              className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all active:scale-95"
              style={isFav
                ? { background: "#FEF2F2", border: "2px solid #FCA5A5" }
                : { border: "2px solid #F0F0F0" }}>
              {IC.heart(isFav)}
            </button>
          )}
          {/* Chat CTA */}
          <button onClick={startChat} disabled={chatLoading}
            className="flex-1 h-11 rounded-xl text-white text-sm font-black flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            style={{ background: "linear-gradient(135deg,#1A56DB,#1e3a8a)", boxShadow: "0 4px 18px rgba(26,86,219,0.32)" }}>
            {chatLoading
              ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : IC.chat}
            {chatLoading ? "Opening..." : "Chat with Seller"}
          </button>
        </div>

      </div>
    </>
  );
}
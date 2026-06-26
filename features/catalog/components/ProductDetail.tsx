"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { ref, set, get } from "firebase/database";
import { database } from "@/lib/firebase";
import { SellerMiniCard } from "@/features/sellers/components/SellerMiniCard";
import { SimilarProducts } from "./SimilarProducts";
import { motion, AnimatePresence } from "framer-motion";
import { useBuyzzeAuth } from "@/hooks/useBuyzzeAuth";
import { supabase } from "@/lib/supabaseClient";
import { PhoneVerification } from "@/components/PhoneVerification";

import {
  Heart, MessageCircle, Share2, MapPin,
  ShieldCheck, ChevronLeft, ChevronRight,
  Star, CheckCircle, X, ChevronDown, ChevronUp,
  CircleDollarSign, ArrowLeft, BadgeCheck,
} from "lucide-react";

/* ─── Stars ─── */
function Stars({ val, size = 13, interactive = false, onChange }: {
  val: number; size?: number; interactive?: boolean; onChange?: (v: number) => void;
}) {
  const [hov, setHov] = useState(0);
  const show = hov || val;
  return (
    <span className="inline-flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} className={interactive ? "cursor-pointer" : ""}
          onMouseEnter={() => interactive && setHov(i)}
          onMouseLeave={() => interactive && setHov(0)}
          onClick={() => interactive && onChange?.(i)}>
          <Star size={size} className={show >= i ? "text-amber-400 fill-amber-400" : "text-neutral-200 dark:text-neutral-700 fill-neutral-200 dark:fill-neutral-700"} />
        </span>
      ))}
    </span>
  );
}

/* ─── Grade ─── */
function getGradeDetails(cond: string) {
  const v = (cond || "").toLowerCase();
  if (v.includes("superb") || v.includes("excellent"))
    return { pill: "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50", dot: "bg-emerald-500", gradeLabel: "SUPERB" };
  if (v.includes("good"))
    return { pill: "bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800/50", dot: "bg-blue-500", gradeLabel: "GOOD" };
  return { pill: "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/50", dot: "bg-amber-500", gradeLabel: "FAIR" };
}

/* ─── Magnifier Image Component ─── */
function MagnifierImage({ src, alt, onClick }: { src: string; alt: string; onClick: () => void }) {
  const imgRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const ZOOM = 2.5;
  const LENS = 140;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = imgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPos({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
  };

  return (
    <div
      ref={imgRef}
      className="relative w-full h-full cursor-crosshair select-none bg-neutral-50 dark:bg-neutral-900"
      onMouseEnter={() => setZoom(true)}
      onMouseLeave={() => setZoom(false)}
      onMouseMove={handleMouseMove}
      onClick={onClick}
    >
      <img src={src} alt={alt} className="w-full h-full object-contain p-8 mix-blend-multiply dark:mix-blend-normal" draggable={false} />
      {zoom && (
        <div
          className="pointer-events-none absolute rounded-full border-2 border-white dark:border-neutral-700 shadow-2xl overflow-hidden"
          style={{
            width: LENS, height: LENS,
            left: `calc(${pos.x}% - ${LENS / 2}px)`, top: `calc(${pos.y}% - ${LENS / 2}px)`,
            backgroundImage: `url(${src})`, backgroundSize: `${ZOOM * 100}%`,
            backgroundPosition: `${pos.x}% ${pos.y}%`, backgroundRepeat: "no-repeat",
            backgroundColor: "white", zIndex: 20, boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
          }}
        />
      )}
    </div>
  );
}

/* ─── Review Popup ─── */
function ReviewPopup({ productId, onClose, onDone }: { productId: number; onClose: () => void; onDone: () => void; }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);
  const labels = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];

  const submit = async () => {
    if (!rating) { setErr("Please select a rating"); return; }
    setLoading(true); setErr("");
    try {
      const r = await fetch("/api/reviews", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ product_id: productId, rating, comment }) });
      const d = await r.json();
      if (d.success) { setDone(true); localStorage.setItem(`reviewed_${productId}`, "1"); setTimeout(onDone, 1400); }
      else setErr(d.error || "Failed");
    } catch { setErr("Something went wrong"); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-[500] bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center" onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white dark:bg-neutral-900 w-full max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl border border-neutral-200 dark:border-neutral-800">
        <div className="px-5 py-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
          <h3 className="font-bold text-neutral-900 dark:text-white">Rate this Product</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center"><X size={15} className="text-neutral-500" /></button>
        </div>
        <div className="p-5">
          {done ? (
            <div className="text-center py-6">
              <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="font-bold text-neutral-900 dark:text-white">Review Submitted!</p>
              <p className="text-sm text-neutral-500 mt-1">Thank you for your feedback</p>
            </div>
          ) : (
            <>
              <div className="flex flex-col items-center gap-3 mb-5">
                <Stars val={rating} size={38} interactive onChange={setRating} />
                {rating > 0 && <span className="text-sm font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-3 py-1 rounded-full">{labels[rating]}</span>}
              </div>
              <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Share your experience (optional)" rows={3}
                className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm resize-none focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500 text-neutral-900 dark:text-white placeholder:text-neutral-400 mb-4" />
              {err && <p className="text-sm text-red-500 mb-3">{err}</p>}
              <div className="flex gap-3">
                <button onClick={onClose} className="flex-1 py-3 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-semibold rounded-xl text-sm">Skip</button>
                <button onClick={submit} disabled={loading || !rating} className="flex-1 py-3 bg-[#FFC200] hover:bg-[#F2B800] text-black font-bold rounded-xl text-sm disabled:opacity-50">
                  {loading ? "Submitting…" : "Submit Review"}
                </button>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   MAIN ProductDetail
═══════════════════════════════════════════ */
export function ProductDetail({ product, userId: serverUserId }: { product: any; userId: string | null }) {
  const router = useRouter();
  const { user } = useBuyzzeAuth();
  const [localUserId, setLocalUserId] = useState<string | null>(serverUserId || null);
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [isFav, setIsFav] = useState(false);
  const [favLoading, setFavLoading] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);

  const [reviews, setReviews] = useState<any[]>([]);
  const [avgRating, setAvgRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [descOpen, setDescOpen] = useState(false);

  const images = Array.isArray(product?.images) && product.images.length > 0 ? product.images : ["/placeholder.png"];

  useEffect(() => {
    if (user?.id) { setLocalUserId(user.id); }
    else if (typeof window !== "undefined") {
      if (localStorage.getItem("buyzze_logged_in") === "true") {
        let fastId = localStorage.getItem("buyzze_fast_id");
        if (!fastId) { fastId = "fast_user_" + Math.random().toString(36).substr(2, 10); localStorage.setItem("buyzze_fast_id", fastId); }
        setLocalUserId(fastId);
      }
    }
  }, [user, serverUserId]);

  const isOwner = localUserId && product.owner_id ? String(localUserId) === String(product.owner_id) : false;
  const grade = getGradeDetails(product.condition || "");

  const loadReviews = useCallback(() => {
    if (!product?.id) return;
    setReviewsLoading(true);
    fetch(`/api/reviews?product_id=${product.id}`).then(r => r.json()).then(d => {
      if (d.success) { setReviews(d.reviews || []); setAvgRating(d.average || 0); setTotalReviews(d.total || 0); }
    }).catch(() => { }).finally(() => setReviewsLoading(false));
  }, [product?.id]);

  useEffect(() => { loadReviews(); }, [loadReviews]);

  useEffect(() => {
    if (!localUserId || !product?.id) return;
    fetch("/api/favorites").then(r => r.json()).then(d => setIsFav(d.favorites?.some((f: any) => f.product_id === product.id))).catch(() => { });
  }, [localUserId, product?.id]);

  useEffect(() => {
    if (!localUserId || !product?.id || isOwner) return;
    if (localStorage.getItem(`show_review_${product.id}`) === "1" && !localStorage.getItem(`reviewed_${product.id}`)) {
      setShowReview(true);
      localStorage.removeItem(`show_review_${product.id}`);
    }
  }, [localUserId, product?.id, isOwner]);

  const toggleFav = async () => {
    if (!localUserId) { router.push("/login"); return; }
    setFavLoading(true);
    try {
      const r = await fetch("/api/favorites", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ product_id: product.id }) });
      const d = await r.json();
      if (d.success) setIsFav(d.action === "added");
    } catch { } finally { setFavLoading(false); }
  };

  const share = async () => {
    try { await navigator.clipboard.writeText(window.location.href); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { }
  };

  const startChat = async () => {
    if (!localUserId) { router.push("/login"); return; }
    if (isOwner) return;

    setChatLoading(true);
    try {
      const { data: profileData } = await supabase.from("profiles").select("is_phone_verified").eq("id", localUserId).single();
      if (!profileData?.is_phone_verified) {
        setShowVerifyModal(true); setChatLoading(false); return;
      }
      const chatId = `product_${product.id}_${product.owner_id}_${localUserId}`;
      const chatRef = ref(database, `chats/${chatId}`);
      const snap = await get(chatRef);
      if (!snap.exists()) {
        await set(chatRef, { productId: product.id, title: product.title, productTitle: product.title, productPrice: product.price, productImage: images[0] || "", sellerId: product.owner_id, buyerId: localUserId, createdAt: Date.now(), lastMessageText: null, lastMessageAt: null });
      }
      localStorage.setItem(`show_review_${product.id}`, "1");
      router.push(`/chat/${chatId}`);
    } catch (e) { console.error(e); } finally { setChatLoading(false); }
  };

  if (!product) return null;

  const specs = [
    { label: "Storage", value: product.storage },
    { label: "RAM", value: product.ram },
    { label: "Color", value: product.color },
  ].filter(s => s.value);

  const conditions = [
    { label: "Screen", value: product.cond_screen },
    { label: "Body", value: product.cond_body },
    { label: "Camera", value: product.cond_cam },
    { label: "Functions", value: product.cond_func },
    { label: "Warranty", value: product.cond_warr },
    { label: "Age", value: product.cond_age },
  ].filter(c => c.value);

  const ReviewsSection = () => (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-neutral-900 dark:text-white">Customer Reviews</h2>
        {localUserId && !isOwner && (
          <button onClick={() => setShowReview(true)} className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/40 transition">Write a Review</button>
        )}
      </div>
      {totalReviews > 0 && (
        <div className="flex items-start gap-6 mb-5 p-4 bg-neutral-50 dark:bg-neutral-800/40 rounded-xl border border-neutral-100 dark:border-neutral-800/60">
          <div className="text-center">
            <div className="text-4xl font-black text-neutral-900 dark:text-white">{avgRating.toFixed(1)}</div>
            <Stars val={Math.round(avgRating)} size={13} />
            <p className="text-[10px] text-neutral-400 mt-1">{totalReviews} ratings</p>
          </div>
          <div className="flex-1 space-y-1.5">
            {[5, 4, 3, 2, 1].map(star => {
              const count = reviews.filter((r: any) => r.rating === star).length;
              const pct = totalReviews ? (count / totalReviews) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-neutral-500 w-2">{star}</span>
                  <Star size={9} className="text-amber-400 fill-amber-400 shrink-0" />
                  <div className="flex-1 h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-[10px] text-neutral-400 w-4 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {reviewsLoading ? (
        <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-10">
          <CircleDollarSign size={30} className="text-neutral-200 dark:text-neutral-700 mx-auto mb-2" />
          <p className="text-sm text-neutral-400">No reviews yet. Be the first!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.slice(0, 5).map((r: any) => (
            <div key={r.id} className="flex items-start gap-3 pb-4 border-b border-neutral-100 dark:border-neutral-800 last:border-0 last:pb-0">
              <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-sm shrink-0">
                {(r.profiles?.full_name || "U")[0].toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-neutral-900 dark:text-white">{r.profiles?.full_name || "BuYzze User"}</p>
                  <p className="text-[10px] text-neutral-400">{new Date(r.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                </div>
                <Stars val={r.rating} size={11} />
                {r.comment && <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-1 leading-relaxed">{r.comment}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <>
      {showReview && <ReviewPopup productId={product.id} onClose={() => setShowReview(false)} onDone={() => { setShowReview(false); loadReviews(); }} />}

      {/* ── Lightbox ── */}
      <AnimatePresence>
        {lightbox && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[600] bg-black/95 flex items-center justify-center"
            onClick={() => setLightbox(false)}>
            <button className="absolute top-4 right-4 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition" onClick={() => setLightbox(false)}>
              <X size={18} />
            </button>
            {images.length > 1 && (
              <>
                <button className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition"
                  onClick={e => { e.stopPropagation(); setActive(a => (a - 1 + images.length) % images.length); }}>
                  <ChevronLeft size={20} />
                </button>
                <button className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition"
                  onClick={e => { e.stopPropagation(); setActive(a => (a + 1) % images.length); }}>
                  <ChevronRight size={20} />
                </button>
              </>
            )}
            <img src={images[active]} className="max-w-full max-h-[88vh] object-contain px-16" alt={product.title} onClick={e => e.stopPropagation()} />
            <div className="absolute bottom-5 flex gap-2">
              {images.map((_: string, i: number) => (
                <button key={i} onClick={e => { e.stopPropagation(); setActive(i); }}
                  className={`rounded-full transition-all ${i === active ? "w-5 h-2 bg-white" : "w-2 h-2 bg-white/40"}`} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ╔═══════════════════════════════════════════╗
          ║   DESKTOP  (lg+)                          ║
          ╚═══════════════════════════════════════════╝ */}
      <div className="hidden lg:block min-h-screen bg-[#F5F5F5] dark:bg-[#0a0a0a] font-sans transition-colors duration-300">
        <div className="bg-white dark:bg-[#111] border-b border-neutral-100 dark:border-neutral-800/60 transition-colors">
          <div className="max-w-6xl mx-auto px-6 py-2.5 flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
            <span className="cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition" onClick={() => router.push("/")}>Home</span>
            <span className="text-neutral-300 dark:text-neutral-700">&gt;</span>
            <span className="cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition capitalize" onClick={() => router.push(`/category/${product.category}`)}>{product.category}</span>
            <span className="text-neutral-300 dark:text-neutral-700">&gt;</span>
            <span className="cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition">{product.brand}</span>
            <span className="text-neutral-300 dark:text-neutral-700">&gt;</span>
            <span className="text-neutral-700 dark:text-neutral-200 font-medium truncate max-w-xs">{product.title}</span>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-7">
          <div className="flex gap-7 items-start"> {/* items-start added */}

            {/* LEFT: Image + Thumbnails */}
            {/* shrinking disabled with shrink-0 so it never disappears */}
            <div className="w-[42%] shrink-0 space-y-3 sticky top-6 self-start">
              <div className="bg-white dark:bg-[#111] rounded-2xl border border-neutral-200 dark:border-neutral-800/60 overflow-hidden shadow-sm transition-colors">
                
                {/* Changed to aspect-square and added absolute inset-0 to prevent collapsing */}
                <div className="relative w-full aspect-square overflow-hidden bg-neutral-50 dark:bg-[#0a0a0a]">
                  <AnimatePresence mode="wait">
                    <motion.div 
                      key={active} 
                      className="absolute inset-0 w-full h-full"
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }} 
                      exit={{ opacity: 0 }} 
                      transition={{ duration: 0.18 }}
                    >
                      <MagnifierImage src={images[active]} alt={product.title} onClick={() => setLightbox(true)} />
                    </motion.div>
                  </AnimatePresence>
                  
                  {images.length > 1 && (
                    <>
                      <button className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 dark:bg-neutral-800/90 backdrop-blur shadow-md rounded-full flex items-center justify-center z-10 text-neutral-700 dark:text-neutral-200 hover:scale-105 transition"
                        onClick={() => setActive(a => (a - 1 + images.length) % images.length)}>
                        <ChevronLeft size={16} />
                      </button>
                      <button className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 dark:bg-neutral-800/90 backdrop-blur shadow-md rounded-full flex items-center justify-center z-10 text-neutral-700 dark:text-neutral-200 hover:scale-105 transition"
                        onClick={() => setActive(a => (a + 1) % images.length)}>
                        <ChevronRight size={16} />
                      </button>
                    </>
                  )}
                </div>

                {images.length > 1 && (
                  <div className="flex gap-2 px-4 py-3 border-t border-neutral-100 dark:border-neutral-800 overflow-x-auto scrollbar-hide">
                    {images.map((img: string, i: number) => (
                      <button key={i} onClick={() => setActive(i)}
                        className={`flex-shrink-0 w-16 h-16 rounded-xl border-2 bg-neutral-50 dark:bg-neutral-900 overflow-hidden p-1.5 transition ${i === active ? "border-neutral-800 dark:border-neutral-200" : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600"}`}>
                        <img src={img} className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal" alt="" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT: Product Details */}
            {/* Added min-w-0 so it doesn't push the image out of screen */}
            <div className="flex-1 min-w-0 space-y-5">

              {/* Title Card */}
              <div className="bg-white dark:bg-[#111] rounded-2xl border border-neutral-200 dark:border-neutral-800/60 p-6 shadow-sm transition-colors">
                {product.brand && (
                  <p className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1.5">{product.brand} · {product.category}</p>
                )}
                <h1 className="text-2xl font-bold text-neutral-900 dark:text-white leading-snug">{product.title}</h1>
                {totalReviews > 0 && (
                  <div className="flex items-center gap-2 mt-2.5">
                    <Stars val={Math.round(avgRating)} size={14} />
                    <span className="text-sm font-bold text-neutral-800 dark:text-neutral-200">{avgRating.toFixed(1)}</span>
                    <span className="text-sm text-neutral-400">({totalReviews} reviews)</span>
                  </div>
                )}
                <div className="mt-5 pt-5 border-t border-neutral-100 dark:border-neutral-800 flex items-end justify-between">
                  <div>
                    <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mb-1">Asking Price</p>
                    <span className="text-3xl font-black text-neutral-900 dark:text-white leading-none">₹{product.price?.toLocaleString("en-IN")}</span>
                  </div>
                  {product.condition && (
                    <div className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-xs font-bold ${grade.pill}`}>
                      <span className={`w-2 h-2 rounded-full ${grade.dot}`} />
                      GRADE: {grade.gradeLabel}
                    </div>
                  )}
                </div>
                {(product.city || product.state) && (
                  <div className="flex items-center gap-1.5 mt-4 text-[13px] font-medium text-neutral-500 dark:text-neutral-400">
                    <MapPin size={14} /><span>{[product.city, product.state, product.pincode].filter(Boolean).join(", ")}</span>
                  </div>
                )}
              </div>

              {/* Specs Grid */}
              {specs.length > 0 && (
                <div className="bg-white dark:bg-[#111] rounded-2xl border border-neutral-200 dark:border-neutral-800/60 p-6 shadow-sm">
                  <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest mb-4">Device Specifications</p>
                  <div className="grid grid-cols-2 gap-3">
                    {specs.map((s, i) => (
                      <div key={i} className="bg-neutral-50 dark:bg-neutral-800/40 rounded-xl px-4 py-3 border border-neutral-100 dark:border-neutral-800/60">
                        <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mb-0.5">{s.label}</p>
                        <p className="text-sm font-bold text-neutral-900 dark:text-white">{s.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Overall Condition Grid */}
              {conditions.length > 0 && (
                <div className="bg-white dark:bg-[#111] rounded-2xl border border-neutral-200 dark:border-neutral-800/60 p-6 shadow-sm">
                  <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest mb-4">Condition Details</p>
                  <div className="grid grid-cols-2 gap-3">
                    {conditions.map((cond, i) => (
                      <div key={i} className="bg-neutral-50 dark:bg-neutral-800/40 rounded-xl px-4 py-3 border border-neutral-100 dark:border-neutral-800/60">
                        <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mb-0.5">{cond.label}</p>
                        <p className="text-sm font-bold text-neutral-900 dark:text-white">{cond.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Verified Badge */}
              <div className="bg-white dark:bg-[#111] rounded-2xl border border-neutral-200 dark:border-neutral-800/60 p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-800/50">
                    <BadgeCheck size={20} className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-neutral-900 dark:text-white">BuYzze Verified Listing</p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">Seller's phone is listed securely on our platform. Always inspect the device locally before making final payment.</p>
                    <div className="flex items-center gap-1.5 mt-2.5 text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                      <ShieldCheck size={12} /> Secure C2C Marketplace
                    </div>
                  </div>
                </div>
              </div>

              {/* Chat Button */}
              {!isOwner && (
                <button onClick={startChat} disabled={chatLoading}
                  className="w-full py-4 bg-[#FFC200] hover:bg-[#F2B800] text-black font-extrabold rounded-xl flex items-center justify-center gap-2.5 text-sm shadow-lg shadow-yellow-500/20 transition-all active:scale-[0.98] disabled:opacity-70 disabled:scale-100">
                  {chatLoading ? <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : <MessageCircle size={18} strokeWidth={2.5} />}
                  Chat directly with Seller
                </button>
              )}

              {/* Seller */}
              <div className="bg-white dark:bg-[#111] rounded-2xl border border-neutral-200 dark:border-neutral-800/60 p-6 shadow-sm">
                <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest mb-4">Seller Information</p>
                <SellerMiniCard sellerId={product.owner_id} />
                {(product.city || product.state || product.pincode) && (
                  <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-start gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
                    <MapPin size={14} className="shrink-0 mt-0.5" />
                    <span>{[product.city, product.state, product.pincode].filter(Boolean).join(", ")}</span>
                  </div>
                )}
              </div>

              {/* Description */}
              {product.description && (
                <div className="bg-white dark:bg-[#111] rounded-2xl border border-neutral-200 dark:border-neutral-800/60 p-6 shadow-sm">
                  <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest mb-3">Seller's Note</p>
                  <p className={`text-[13px] text-neutral-700 dark:text-neutral-300 leading-relaxed ${!descOpen ? "line-clamp-4" : ""}`}>{product.description}</p>
                  {product.description.length > 200 && (
                    <button onClick={() => setDescOpen(!descOpen)} className="mt-3 flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400">
                      {descOpen ? <><ChevronUp size={14} />Read Less</> : <><ChevronDown size={14} />Read More</>}
                    </button>
                  )}
                </div>
              )}

              {/* Reviews */}
              <div className="bg-white dark:bg-[#111] rounded-2xl border border-neutral-200 dark:border-neutral-800/60 p-6 shadow-sm">
                <ReviewsSection />
              </div>

              {/* Similar */}
              <div className="pt-4">
                <SimilarProducts productId={product.id} brand={product.brand} category={product.category} price={product.price} city={product.city ?? ""} state={product.state ?? ""} pincode={product.pincode ?? ""} />
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* ╚═══ END DESKTOP ═══╝ */}


      {/* ╔═══════════════════════════════════════════╗
          ║   MOBILE  (below lg)                      ║
          ╚═══════════════════════════════════════════╝ */}
      <div className="lg:hidden min-h-screen bg-white dark:bg-[#0a0a0a] font-sans transition-colors">

        {/* Full-width image carousel */}
        <div className="relative bg-neutral-50 dark:bg-neutral-900 w-full aspect-square max-h-[400px]">
          <button onClick={() => router.back()}
            className="absolute top-4 left-4 z-10 w-10 h-10 bg-white/80 dark:bg-neutral-800/80 backdrop-blur rounded-full flex items-center justify-center shadow-sm text-neutral-700 dark:text-neutral-200">
            <ArrowLeft size={18} />
          </button>
          <div className="absolute top-4 right-4 z-10 flex gap-2">
            <button onClick={share} className="w-10 h-10 bg-white/80 dark:bg-neutral-800/80 backdrop-blur rounded-full flex items-center justify-center shadow-sm text-neutral-700 dark:text-neutral-200">
              {copied ? <CheckCircle size={18} className="text-emerald-500" /> : <Share2 size={18} />}
            </button>
            <button onClick={toggleFav} disabled={favLoading} className="w-10 h-10 bg-white/80 dark:bg-neutral-800/80 backdrop-blur rounded-full flex items-center justify-center shadow-sm">
              <Heart size={18} className={isFav ? "fill-red-500 text-red-500" : "text-neutral-700 dark:text-neutral-200"} />
            </button>
          </div>
          <AnimatePresence mode="wait">
            <motion.img 
              key={active} 
              src={images[active]} 
              alt={product.title}
              className="absolute inset-0 w-full h-full object-contain p-4 mix-blend-multiply dark:mix-blend-normal"
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              transition={{ duration: 0.2 }}
              onClick={() => setLightbox(true)} 
            />
          </AnimatePresence>
          {images.length > 1 && (
            <>
              <button className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 dark:bg-neutral-800/90 shadow rounded-full flex items-center justify-center text-neutral-700 dark:text-neutral-200"
                onClick={() => setActive(a => (a - 1 + images.length) % images.length)}>
                <ChevronLeft size={16} />
              </button>
              <button className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 dark:bg-neutral-800/90 shadow rounded-full flex items-center justify-center text-neutral-700 dark:text-neutral-200"
                onClick={() => setActive(a => (a + 1) % images.length)}>
                <ChevronRight size={16} />
              </button>
            </>
          )}
          {images.length > 1 && (
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
              {images.map((_: string, i: number) => (
                <button key={i} onClick={() => setActive(i)}
                  className={`rounded-full transition-all duration-300 ${i === active ? "w-5 h-1.5 bg-neutral-800 dark:bg-neutral-200" : "w-1.5 h-1.5 bg-neutral-300 dark:bg-neutral-600"}`} />
              ))}
            </div>
          )}
        </div>

        {/* Thumbnail strip */}
        {images.length > 1 && (
          <div className="flex gap-2.5 px-4 py-3 bg-white dark:bg-[#111] border-b border-neutral-100 dark:border-neutral-800 overflow-x-auto scrollbar-hide">
            {images.map((img: string, i: number) => (
              <button key={i} onClick={() => setActive(i)}
                className={`flex-shrink-0 w-14 h-14 rounded-xl border-2 bg-neutral-50 dark:bg-neutral-900 p-1 transition ${i === active ? "border-neutral-800 dark:border-neutral-200" : "border-transparent"}`}>
                <img src={img} className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal" alt="" />
              </button>
            ))}
          </div>
        )}

        <div className="px-5 pt-5 pb-32 space-y-0">

          {/* Title & Price */}
          <div className="pb-5 border-b border-neutral-100 dark:border-neutral-800/60">
            {product.brand && <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">{product.brand}</span>}
            <h1 className="text-xl font-bold text-neutral-900 dark:text-white leading-snug mt-1">{product.title}</h1>
            {totalReviews > 0 && (
              <div className="flex items-center gap-1.5 mt-2">
                <Stars val={Math.round(avgRating)} size={13} />
                <span className="text-sm font-bold text-neutral-800 dark:text-neutral-200">{avgRating.toFixed(1)}</span>
                <span className="text-xs text-neutral-400">({totalReviews} reviews)</span>
              </div>
            )}
            <div className="flex items-end justify-between mt-4">
              <div>
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-0.5">Asking Price</p>
                <span className="text-3xl font-black text-neutral-900 dark:text-white leading-none">₹{product.price?.toLocaleString("en-IN")}</span>
              </div>
              {product.condition && (
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] font-bold ${grade.pill}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${grade.dot}`} />
                  GRADE: {grade.gradeLabel}
                </div>
              )}
            </div>
            {(product.city || product.state) && (
              <div className="flex items-center gap-1.5 mt-3 text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                <MapPin size={13} /><span>{[product.city, product.state].filter(Boolean).join(", ")}</span>
              </div>
            )}
          </div>

          {/* Specs Grid */}
          {specs.length > 0 && (
            <div className="py-5 border-b border-neutral-100 dark:border-neutral-800/60">
              <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest mb-3">Specifications</p>
              <div className="grid grid-cols-2 gap-2.5">
                {specs.map((s, i) => (
                  <div key={i} className="bg-neutral-50 dark:bg-neutral-800/40 rounded-xl px-4 py-3 border border-neutral-100 dark:border-neutral-800/60">
                    <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mb-0.5">{s.label}</p>
                    <p className="text-sm font-bold text-neutral-900 dark:text-white">{s.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Conditions Grid */}
          {conditions.length > 0 && (
            <div className="py-5 border-b border-neutral-100 dark:border-neutral-800/60">
              <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest mb-3">Condition</p>
              <div className="grid grid-cols-2 gap-2.5">
                {conditions.map((cond, i) => (
                  <div key={i} className="bg-neutral-50 dark:bg-neutral-800/40 rounded-xl px-4 py-3 border border-neutral-100 dark:border-neutral-800/60">
                    <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mb-0.5">{cond.label}</p>
                    <p className="text-[13px] font-bold text-neutral-900 dark:text-white">{cond.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Verification */}
          <div className="py-5 border-b border-neutral-100 dark:border-neutral-800/60">
            <div className="flex items-start gap-3 bg-blue-50 dark:bg-blue-900/10 rounded-xl px-4 py-4 border border-blue-100 dark:border-blue-900/30">
              <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center shrink-0 border border-blue-200 dark:border-blue-800/50">
                <BadgeCheck size={18} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-neutral-900 dark:text-white">BuYzze Verified Listing</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">Secure C2C Platform. Inspect device locally before any payment.</p>
              </div>
            </div>
          </div>

          {/* Seller */}
          <div className="py-5 border-b border-neutral-100 dark:border-neutral-800/60">
            <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest mb-3">Seller</p>
            <div className="bg-neutral-50 dark:bg-neutral-800/30 rounded-xl px-4 py-4 border border-neutral-100 dark:border-neutral-800/50">
              <SellerMiniCard sellerId={product.owner_id} />
              {(product.city || product.state || product.pincode) && (
                <div className="mt-3.5 pt-3.5 border-t border-neutral-200 dark:border-neutral-700/50 flex items-start gap-1.5 text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                  <MapPin size={14} className="shrink-0 mt-0.5" />
                  <span>{[product.city, product.state, product.pincode].filter(Boolean).join(", ")}</span>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          {product.description && (
            <div className="py-5 border-b border-neutral-100 dark:border-neutral-800/60">
              <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest mb-2.5">Description</p>
              <p className={`text-[13px] text-neutral-700 dark:text-neutral-300 leading-relaxed ${!descOpen ? "line-clamp-4" : ""}`}>{product.description}</p>
              {product.description.length > 200 && (
                <button onClick={() => setDescOpen(!descOpen)} className="mt-2.5 flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400">
                  {descOpen ? <><ChevronUp size={14} />Read Less</> : <><ChevronDown size={14} />Read More</>}
                </button>
              )}
            </div>
          )}

          {/* Reviews */}
          <div className="py-5 border-b border-neutral-100 dark:border-neutral-800/60">
            <ReviewsSection />
          </div>

          {/* Similar Products Lists */}
          <div className="pt-6">
            <SimilarProducts productId={product.id} brand={product.brand} category={product.category} price={product.price} city={product.city ?? ""} state={product.state ?? ""} pincode={product.pincode ?? ""} />
          </div>
        </div>

        {/* Sticky Bottom CTA */}
        {!isOwner && (
          <div className="fixed bottom-0 inset-x-0 z-50 bg-white/90 dark:bg-[#111]/90 backdrop-blur-md border-t border-neutral-100 dark:border-neutral-800 px-4 pt-3 pb-safe shadow-[0_-4px_24px_rgba(0,0,0,0.04)] dark:shadow-[0_-4px_24px_rgba(0,0,0,0.4)]">
            <div className="flex gap-3 items-center">
              <button onClick={toggleFav} disabled={favLoading}
                className="w-14 h-14 shrink-0 rounded-xl border-2 border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 flex items-center justify-center active:scale-95 transition-transform">
                <Heart size={20} className={isFav ? "fill-red-500 text-red-500" : "text-neutral-400 dark:text-neutral-300"} />
              </button>
              <button onClick={startChat} disabled={chatLoading}
                className="flex-1 h-14 bg-[#FFC200] hover:bg-[#F2B800] text-black font-extrabold rounded-xl flex items-center justify-center gap-2.5 text-[15px] disabled:opacity-70 active:scale-[0.98] transition-transform shadow-lg shadow-yellow-500/20">
                {chatLoading ? <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : <MessageCircle size={20} strokeWidth={2.5} />}
                Chat directly
              </button>
            </div>
          </div>
        )}
      </div>

      {showVerifyModal && (
        <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-md animate-in fade-in zoom-in duration-200">
            <PhoneVerification onVerified={() => setShowVerifyModal(false)} />
          </div>
        </div>
      )}

      <style jsx global>{`
        .line-clamp-4 { display:-webkit-box;-webkit-line-clamp:4;-webkit-box-orient:vertical;overflow:hidden; }
        .scrollbar-hide::-webkit-scrollbar { display:none; }
        .scrollbar-hide { -ms-overflow-style:none;scrollbar-width:none; }
        .pb-safe { padding-bottom:max(16px,env(safe-area-inset-bottom)); }
      `}</style>
    </>
  );
}
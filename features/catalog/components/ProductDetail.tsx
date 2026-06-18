"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { ref, set, get } from "firebase/database";
import { database } from "@/lib/firebase";
import { SellerMiniCard } from "@/features/sellers/components/SellerMiniCard";
import { SimilarProducts } from "./SimilarProducts";
import { motion, AnimatePresence } from "framer-motion";
import { useBuyzzeAuth } from "@/hooks/useBuyzzeAuth";
// ✅ 1. Supabase aur PhoneVerification Import kiya
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
      {[1,2,3,4,5].map(i => (
        <span key={i} className={interactive ? "cursor-pointer" : ""}
          onMouseEnter={() => interactive && setHov(i)}
          onMouseLeave={() => interactive && setHov(0)}
          onClick={() => interactive && onChange?.(i)}>
          <Star size={size} className={show >= i ? "text-amber-400 fill-amber-400" : "text-gray-200 fill-gray-200"} />
        </span>
      ))}
    </span>
  );
}

/* ─── Grade ─── */
function getGradeDetails(cond: string) {
  const v = (cond || "").toLowerCase();
  if (v.includes("superb") || v.includes("excellent"))
    return { pill: "bg-green-100 text-green-700 border-green-200", dot: "bg-green-500", gradeLabel: "SUPERB" };
  if (v.includes("good"))
    return { pill: "bg-blue-100 text-blue-700 border-blue-200", dot: "bg-blue-500", gradeLabel: "GOOD" };
  return { pill: "bg-amber-100 text-amber-700 border-amber-200", dot: "bg-amber-500", gradeLabel: "FAIR" };
}

/* ─── Magnifier Image Component ─── */
function MagnifierImage({ src, alt, onClick }: { src: string; alt: string; onClick: () => void }) {
  const imgRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const ZOOM = 2.5;
  const LENS = 140; // lens diameter px

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
      className="relative w-full h-full cursor-crosshair select-none"
      onMouseEnter={() => setZoom(true)}
      onMouseLeave={() => setZoom(false)}
      onMouseMove={handleMouseMove}
      onClick={onClick}
    >
      <img src={src} alt={alt} className="w-full h-full object-contain p-8" draggable={false} />

      {/* Magnifier lens */}
      {zoom && (
        <div
          className="pointer-events-none absolute rounded-full border-2 border-white shadow-2xl overflow-hidden"
          style={{
            width: LENS,
            height: LENS,
            left: `calc(${pos.x}% - ${LENS / 2}px)`,
            top: `calc(${pos.y}% - ${LENS / 2}px)`,
            backgroundImage: `url(${src})`,
            backgroundSize: `${ZOOM * 100}%`,
            backgroundPosition: `${pos.x}% ${pos.y}%`,
            backgroundRepeat: "no-repeat",
            zIndex: 20,
            boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
          }}
        />
      )}
    </div>
  );
}

/* ─── Review Popup ─── */
function ReviewPopup({ productId, onClose, onDone }: {
  productId: number; onClose: () => void; onDone: () => void;
}) {
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
    <div className="fixed inset-0 z-[500] bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-900">Rate this Product</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"><X size={15} className="text-gray-500" /></button>
        </div>
        <div className="p-5">
          {done ? (
            <div className="text-center py-6">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-7 h-7 text-green-600" />
              </div>
              <p className="font-bold text-gray-900">Review Submitted!</p>
              <p className="text-sm text-gray-500 mt-1">Thank you for your feedback</p>
            </div>
          ) : (
            <>
              <div className="flex flex-col items-center gap-3 mb-5">
                <Stars val={rating} size={38} interactive onChange={setRating} />
                {rating > 0 && <span className="text-sm font-semibold text-amber-600 bg-amber-50 px-3 py-1 rounded-full">{labels[rating]}</span>}
              </div>
              <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Share your experience (optional)" rows={3}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4" />
              {err && <p className="text-sm text-red-500 mb-3">{err}</p>}
              <div className="flex gap-3">
                <button onClick={onClose} className="flex-1 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl text-sm">Skip</button>
                <button onClick={submit} disabled={loading || !rating} className="flex-1 py-3 bg-[#FFC200] text-gray-900 font-bold rounded-xl text-sm disabled:opacity-50">
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
  // ✅ 2. Verification modal trigger karne ka state
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
    }).catch(() => {}).finally(() => setReviewsLoading(false));
  }, [product?.id]);

  useEffect(() => { loadReviews(); }, [loadReviews]);

  useEffect(() => {
    if (!localUserId || !product?.id) return;
    fetch("/api/favorites").then(r => r.json()).then(d => setIsFav(d.favorites?.some((f: any) => f.product_id === product.id))).catch(() => {});
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
    } catch {} finally { setFavLoading(false); }
  };

  const share = async () => {
    try { await navigator.clipboard.writeText(window.location.href); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch {}
  };

  // ✅ 3. Chat shuru karne se pehle Verification check karna
  const startChat = async () => {
    if (!localUserId) { router.push("/login"); return; }
    if (isOwner) return;
    
    setChatLoading(true);
    try {
      // Pehle verify check karo ki user ka number verified hai ya nahi
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("is_phone_verified")
        .eq("id", localUserId)
        .single();

      if (!profileData?.is_phone_verified) {
        // Verified nahi hai toh modal open karo aur return ho jao
        setShowVerifyModal(true);
        setChatLoading(false);
        return;
      }

      // Agar verified hai toh normal chat process aage badhao
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

  /* ═══ Shared Reviews Section ═══ */
  const ReviewsSection = () => (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-gray-800">Customer Reviews</h2>
        {localUserId && !isOwner && (
          <button onClick={() => setShowReview(true)} className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full hover:bg-blue-100 transition">Write a Review</button>
        )}
      </div>
      {totalReviews > 0 && (
        <div className="flex items-start gap-6 mb-5 p-4 bg-gray-50 rounded-xl border border-gray-100">
          <div className="text-center">
            <div className="text-4xl font-black text-gray-900">{avgRating.toFixed(1)}</div>
            <Stars val={Math.round(avgRating)} size={13} />
            <p className="text-[10px] text-gray-400 mt-1">{totalReviews} ratings</p>
          </div>
          <div className="flex-1 space-y-1.5">
            {[5,4,3,2,1].map(star => {
              const count = reviews.filter((r: any) => r.rating === star).length;
              const pct = totalReviews ? (count / totalReviews) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-gray-500 w-2">{star}</span>
                  <Star size={9} className="text-amber-400 fill-amber-400 shrink-0" />
                  <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-[10px] text-gray-400 w-4 text-right">{count}</span>
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
          <CircleDollarSign size={30} className="text-gray-200 mx-auto mb-2" />
          <p className="text-sm text-gray-400">No reviews yet. Be the first!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.slice(0, 5).map((r: any) => (
            <div key={r.id} className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
              <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm shrink-0">
                {(r.profiles?.full_name || "U")[0].toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-900">{r.profiles?.full_name || "BuYzze User"}</p>
                  <p className="text-[10px] text-gray-400">{new Date(r.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                </div>
                <Stars val={r.rating} size={11} />
                {r.comment && <p className="text-xs text-gray-600 mt-1 leading-relaxed">{r.comment}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  /* ═══════════════════════════════════════════════════════════
     RENDER
  ═══════════════════════════════════════════════════════════ */
  return (
    <>
      {showReview && <ReviewPopup productId={product.id} onClose={() => setShowReview(false)} onDone={() => { setShowReview(false); loadReviews(); }} />}

      {/* ── Lightbox ── */}
      <AnimatePresence>
        {lightbox && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[600] bg-black/95 flex items-center justify-center"
            onClick={() => setLightbox(false)}>
            <button className="absolute top-4 right-4 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white" onClick={() => setLightbox(false)}>
              <X size={18} />
            </button>
            {images.length > 1 && (
              <>
                <button className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white"
                  onClick={e => { e.stopPropagation(); setActive(a => (a - 1 + images.length) % images.length); }}>
                  <ChevronLeft size={20} />
                </button>
                <button className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white"
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
          ║   DESKTOP  (lg+) — NO artificial header   ║
          ╚═══════════════════════════════════════════╝ */}
      <div className="hidden lg:block min-h-screen bg-[#F5F5F5] font-sans">

        {/* ── Breadcrumb only ── */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-6 py-2 flex items-center gap-1.5 text-xs text-gray-500">
            <span className="cursor-pointer hover:text-blue-600 transition" onClick={() => router.push("/")}>Home</span>
            <span className="text-gray-300">&gt;</span>
            <span className="cursor-pointer hover:text-blue-600 transition capitalize" onClick={() => router.push(`/category/${product.category}`)}>{product.category}</span>
            <span className="text-gray-300">&gt;</span>
            <span className="cursor-pointer hover:text-blue-600 transition">{product.brand}</span>
            <span className="text-gray-300">&gt;</span>
            <span className="text-gray-700 font-medium truncate max-w-xs">{product.title}</span>
          </div>
        </div>

        {/* ── 2-column layout ── */}
        <div className="max-w-6xl mx-auto px-6 py-7">
          <div className="flex gap-7">

            {/* LEFT: Image + Thumbnails */}
            <div className="w-[42%] space-y-3 sticky top-4 self-start">
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {/* ── Magnifier Image ── */}
                <div className="relative bg-[#F8F8F8] overflow-hidden" style={{ aspectRatio: "1/1" }}>
                  <AnimatePresence mode="wait">
                    <motion.div key={active} className="w-full h-full"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
                      <MagnifierImage src={images[active]} alt={product.title} onClick={() => setLightbox(true)} />
                    </motion.div>
                  </AnimatePresence>
                  {images.length > 1 && (
                    <>
                      <button className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-white shadow rounded-full flex items-center justify-center z-10"
                        onClick={() => setActive(a => (a - 1 + images.length) % images.length)}>
                        <ChevronLeft size={13} className="text-gray-600" />
                      </button>
                      <button className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-white shadow rounded-full flex items-center justify-center z-10"
                        onClick={() => setActive(a => (a + 1) % images.length)}>
                        <ChevronRight size={13} className="text-gray-600" />
                      </button>
                    </>
                  )}
                </div>
                {/* Thumbnails */}
                {images.length > 1 && (
                  <div className="flex gap-2 px-4 py-3 border-t border-gray-100 overflow-x-auto scrollbar-hide">
                    {images.map((img: string, i: number) => (
                      <button key={i} onClick={() => setActive(i)}
                        className={`flex-shrink-0 w-14 h-14 rounded-lg border-2 bg-[#F8F8F8] overflow-hidden p-1 transition ${i === active ? "border-gray-800" : "border-gray-200 hover:border-gray-400"}`}>
                        <img src={img} className="w-full h-full object-contain" alt="" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT: Product Details */}
            <div className="flex-1 space-y-4">

              {/* Title Card */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                {product.brand && (
                  <p className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider mb-1">{product.brand} · {product.category}</p>
                )}
                <h1 className="text-[1.5rem] font-bold text-gray-900 leading-snug">{product.title}</h1>
                {totalReviews > 0 && (
                  <div className="flex items-center gap-2 mt-2">
                    <Stars val={Math.round(avgRating)} size={14} />
                    <span className="text-sm font-bold text-gray-800">{avgRating.toFixed(1)}</span>
                    <span className="text-sm text-gray-400">({totalReviews} reviews)</span>
                  </div>
                )}
                <div className="mt-4 pt-4 border-t border-gray-100 flex items-end justify-between">
                  <div>
                    <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Selling Price</p>
                    <span className="text-[2rem] font-black text-gray-900 leading-none">₹{product.price?.toLocaleString("en-IN")}</span>
                  </div>
                  {product.condition && (
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold ${grade.pill}`}>
                      <span className={`w-2 h-2 rounded-full ${grade.dot}`} />
                      GRADE: {grade.gradeLabel}
                    </div>
                  )}
                </div>
                {(product.city || product.state) && (
                  <div className="flex items-center gap-1 mt-3 text-xs text-gray-400">
                    <MapPin size={12} /><span>{[product.city, product.state, product.pincode].filter(Boolean).join(", ")}</span>
                  </div>
                )}
              </div>

              {/* Specs */}
              {specs.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Specifications</p>
                  <div className="space-y-2">
                    {specs.map((s, i) => (
                      <div key={i} className="flex items-center text-sm">
                        <span className="text-gray-500 w-28 shrink-0">{s.label}</span>
                        <span className="font-semibold text-gray-900">{s.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Overall Condition (Desktop) - Premium Flipkart/Cashify Style */}
              {(product.cond_screen || product.cond_body || product.cond_cam || product.cond_func || product.cond_warr || product.cond_age) ? (
                <div className="bg-[#FCFAF5] rounded-xl border border-[#F0EBE1] p-5">
                  <p className="text-[11px] font-bold text-[#8B7E66] uppercase tracking-widest mb-4">Overall Condition</p>
                  <ul className="space-y-2.5">
                    {[
                      { label: "Screen Condition", value: product.cond_screen },
                      { label: "Body/Back Panel", value: product.cond_body },
                      { label: "Camera Setup", value: product.cond_cam },
                      { label: "Functional Status", value: product.cond_func },
                      { label: "Warranty Status", value: product.cond_warr },
                      { label: "Device Age", value: product.cond_age },
                    ].filter(c => c.value).map((cond, i) => (
                      <li key={i} className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-600">{cond.label}</span>
                        <span className="text-sm font-bold text-gray-900">{cond.value}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {/* BuYzze Verified */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                    <BadgeCheck size={18} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">BuYzze Verified Inspection</p>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">Seller's listing is verified on our platform. Inspect the device locally before final payment.</p>
                    <div className="flex items-center gap-1 mt-2 text-[10px] font-semibold text-blue-600">
                      <ShieldCheck size={11} />Secure C2C Marketplace
                    </div>
                  </div>
                </div>
              </div>

              {/* Chat Button - Premium Yellow */}
              {!isOwner && (
                <button onClick={startChat} disabled={chatLoading}
                  className="w-full py-3.5 bg-[#FFC200] hover:bg-[#F2B800] text-gray-900 font-bold rounded-xl flex items-center justify-center gap-2.5 text-sm shadow-md shadow-yellow-500/20 transition disabled:opacity-60">
                  {chatLoading ? <div className="w-4 h-4 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" /> : <MessageCircle size={18} />}
                  Chat with Seller
                </button>
              )}

              {/* Seller */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Seller Information</p>
                <SellerMiniCard sellerId={product.owner_id} />
                {(product.city || product.state || product.pincode) && (
                  <div className="mt-3 pt-3 border-t border-gray-100 flex items-start gap-1.5 text-xs text-gray-500">
                    <MapPin size={12} className="shrink-0 mt-0.5 text-gray-400" />
                    <span>{[product.city, product.state, product.pincode].filter(Boolean).join(", ")}</span>
                  </div>
                )}
              </div>

              {/* Description */}
              {product.description && (
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Description</p>
                  <p className={`text-sm text-gray-700 leading-relaxed ${!descOpen ? "line-clamp-4" : ""}`}>{product.description}</p>
                  {product.description.length > 200 && (
                    <button onClick={() => setDescOpen(!descOpen)} className="mt-2 flex items-center gap-1 text-sm font-semibold text-blue-600">
                      {descOpen ? <><ChevronUp size={14} />Read Less</> : <><ChevronDown size={14} />Read More</>}
                    </button>
                  )}
                </div>
              )}

              {/* Reviews */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <ReviewsSection />
              </div>

              {/* Similar */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">You Might Also Like</p>
                  <button onClick={() => router.push(`/category/${product.category}`)} className="text-xs font-semibold text-blue-600">View All →</button>
                </div>
                <SimilarProducts productId={product.id} brand={product.brand} category={product.category} price={product.price} city={product.city ?? ""} state={product.state ?? ""} />
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* ╚═══ END DESKTOP ═══╝ */}


      {/* ╔═══════════════════════════════════════════╗
          ║   MOBILE  (below lg)                      ║
          ╚═══════════════════════════════════════════╝ */}
      <div className="lg:hidden min-h-screen bg-white font-sans">

        {/* Full-width image carousel */}
        <div className="relative bg-[#F7F7F7] w-full" style={{ aspectRatio: "1/1", maxHeight: "400px" }}>
          <button onClick={() => router.back()}
            className="absolute top-4 left-4 z-10 w-9 h-9 bg-white/80 backdrop-blur rounded-full flex items-center justify-center shadow-sm">
            <ArrowLeft size={17} className="text-gray-700" />
          </button>
          <div className="absolute top-4 right-4 z-10 flex gap-2">
            <button onClick={share} className="w-9 h-9 bg-white/80 backdrop-blur rounded-full flex items-center justify-center shadow-sm">
              {copied ? <CheckCircle size={16} className="text-green-500" /> : <Share2 size={16} className="text-gray-600" />}
            </button>
            <button onClick={toggleFav} disabled={favLoading} className="w-9 h-9 bg-white/80 backdrop-blur rounded-full flex items-center justify-center shadow-sm">
              <Heart size={16} className={isFav ? "fill-red-500 text-red-500" : "text-gray-600"} />
            </button>
          </div>
          <AnimatePresence mode="wait">
            <motion.img key={active} src={images[active]} alt={product.title}
              className="w-full h-full object-contain cursor-zoom-in"
              style={{ maxHeight: "400px" }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
              onClick={() => setLightbox(true)} />
          </AnimatePresence>
          {images.length > 1 && (
            <>
              <button className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white shadow rounded-full flex items-center justify-center"
                onClick={() => setActive(a => (a - 1 + images.length) % images.length)}>
                <ChevronLeft size={14} className="text-gray-600" />
              </button>
              <button className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white shadow rounded-full flex items-center justify-center"
                onClick={() => setActive(a => (a + 1) % images.length)}>
                <ChevronRight size={14} className="text-gray-600" />
              </button>
            </>
          )}
          {images.length > 1 && (
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
              {images.map((_: string, i: number) => (
                <button key={i} onClick={() => setActive(i)}
                  className={`rounded-full transition-all duration-300 ${i === active ? "w-4 h-1.5 bg-gray-800" : "w-1.5 h-1.5 bg-gray-300"}`} />
              ))}
            </div>
          )}
        </div>

        {/* Thumbnail strip */}
        {images.length > 1 && (
          <div className="flex gap-2 px-4 py-2.5 bg-white border-b border-gray-100 overflow-x-auto scrollbar-hide">
            {images.map((img: string, i: number) => (
              <button key={i} onClick={() => setActive(i)}
                className={`flex-shrink-0 w-12 h-12 rounded-lg border-2 bg-[#F7F7F7] p-1 transition ${i === active ? "border-gray-800" : "border-transparent"}`}>
                <img src={img} className="w-full h-full object-contain" alt="" />
              </button>
            ))}
          </div>
        )}

        {/* Mobile content */}
        <div className="px-4 pt-4 pb-32 space-y-0">

          {/* Title + Price + Grade */}
          <div className="pb-4 border-b border-gray-100">
            {product.brand && <span className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider">{product.brand}</span>}
            <h1 className="text-[1.15rem] font-bold text-gray-900 leading-snug mt-0.5">{product.title}</h1>
            {totalReviews > 0 && (
              <div className="flex items-center gap-1.5 mt-1.5">
                <Stars val={Math.round(avgRating)} size={13} />
                <span className="text-sm font-semibold text-gray-800">{avgRating.toFixed(1)}</span>
                <span className="text-xs text-gray-400">({totalReviews} reviews)</span>
              </div>
            )}
            <div className="flex items-center justify-between mt-3">
              <div>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Selling Price</p>
                <span className="text-3xl font-black text-gray-900">₹{product.price?.toLocaleString("en-IN")}</span>
              </div>
              {product.condition && (
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold ${grade.pill}`}>
                  <span className={`w-2 h-2 rounded-full ${grade.dot}`} />
                  GRADE: {grade.gradeLabel}
                </div>
              )}
            </div>
            {(product.city || product.state) && (
              <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
                <MapPin size={12} /><span>{[product.city, product.state].filter(Boolean).join(", ")}</span>
              </div>
            )}
          </div>

          {/* Specs */}
          {specs.length > 0 && (
            <div className="py-4 border-b border-gray-100">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Specifications</p>
              <div className="grid grid-cols-2 gap-2.5">
                {specs.map((s, i) => (
                  <div key={i} className="bg-[#F8F8F8] rounded-xl px-4 py-3 border border-gray-100">
                    <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest mb-0.5">{s.label}</p>
                    <p className="text-sm font-bold text-gray-900">{s.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Overall Condition (Mobile) - Premium Flipkart/Cashify Style */}
          {(product.cond_screen || product.cond_body || product.cond_cam || product.cond_func || product.cond_warr || product.cond_age) ? (
            <div className="py-4 border-b border-gray-100">
              <p className="text-xs font-bold text-[#8B7E66] uppercase tracking-widest mb-3">Overall Condition</p>
              <ul className="space-y-2.5 bg-[#FCFAF5] rounded-xl px-4 py-4 border border-[#F0EBE1]">
                {[
                  { label: "Screen", value: product.cond_screen },
                  { label: "Body", value: product.cond_body },
                  { label: "Camera", value: product.cond_cam },
                  { label: "Functions", value: product.cond_func },
                  { label: "Warranty", value: product.cond_warr },
                  { label: "Age", value: product.cond_age },
                ].filter(c => c.value).map((cond, i) => (
                  <li key={i} className="flex justify-between items-center">
                    <span className="text-[13px] font-medium text-gray-600">{cond.label}</span>
                    <span className="text-[13px] font-bold text-gray-900">{cond.value}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {/* Verification */}
          <div className="py-4 border-b border-gray-100">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Verification</p>
            <div className="flex items-start gap-3 bg-blue-50 rounded-xl px-4 py-3.5 border border-blue-100">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                <BadgeCheck size={16} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">BuYzze Verified Listing</p>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">Verified on our platform. Inspect device locally before payment.</p>
                <div className="flex items-center gap-1 mt-2 text-[10px] font-semibold text-blue-600">
                  <ShieldCheck size={11} />Secure C2C Marketplace
                </div>
              </div>
            </div>
          </div>

          {/* Seller */}
          <div className="py-4 border-b border-gray-100">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Seller</p>
            <div className="bg-[#F8F8F8] rounded-xl px-4 py-3.5 border border-gray-100">
              <SellerMiniCard sellerId={product.owner_id} />
              {(product.city || product.state || product.pincode) && (
                <div className="mt-3 pt-3 border-t border-gray-200 flex items-start gap-1.5 text-xs text-gray-500">
                  <MapPin size={12} className="shrink-0 mt-0.5 text-gray-400" />
                  <span>{[product.city, product.state, product.pincode].filter(Boolean).join(", ")}</span>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          {product.description && (
            <div className="py-4 border-b border-gray-100">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Description</p>
              <p className={`text-sm text-gray-700 leading-relaxed ${!descOpen ? "line-clamp-4" : ""}`}>{product.description}</p>
              {product.description.length > 200 && (
                <button onClick={() => setDescOpen(!descOpen)} className="mt-2 flex items-center gap-1 text-sm font-semibold text-blue-600">
                  {descOpen ? <><ChevronUp size={14} />Read Less</> : <><ChevronDown size={14} />Read More</>}
                </button>
              )}
            </div>
          )}

          {/* Reviews */}
          <div className="py-4 border-b border-gray-100">
            <ReviewsSection />
          </div>

          {/* Similar */}
          <div className="pt-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">You Might Also Like</p>
              <button onClick={() => router.push(`/category/${product.category}`)} className="text-xs font-semibold text-blue-600">View All →</button>
            </div>
            <SimilarProducts productId={product.id} brand={product.brand} category={product.category} price={product.price} city={product.city ?? ""} state={product.state ?? ""} />
          </div>
        </div>

        {/* Sticky Bottom CTA - Premium Yellow Button */}
        {!isOwner && (
          <div className="fixed bottom-0 inset-x-0 z-50 bg-white border-t border-gray-100 px-4 pt-3 pb-safe">
            <div className="flex gap-3 items-center">
              <button onClick={toggleFav} disabled={favLoading}
                className="w-12 h-12 shrink-0 rounded-xl border border-gray-200 flex items-center justify-center">
                <Heart size={18} className={isFav ? "fill-red-500 text-red-500" : "text-gray-400"} />
              </button>
              <button onClick={startChat} disabled={chatLoading}
                className="flex-1 py-3.5 bg-[#FFC200] hover:bg-[#F2B800] text-gray-900 font-bold rounded-xl flex items-center justify-center gap-2 text-sm disabled:opacity-60 transition shadow-md shadow-yellow-500/20">
                {chatLoading ? <div className="w-4 h-4 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" /> : <MessageCircle size={17} />}
                Chat with Seller
              </button>
            </div>
          </div>
        )}
      </div>
      {/* ╚═══ END MOBILE ═══╝ */}

      {/* ✅ 4. TRUECALLER VERIFICATION MODAL RENDER KARNA */}
      {showVerifyModal && (
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-md animate-in fade-in zoom-in duration-200">
            <PhoneVerification onVerified={() => setShowVerifyModal(false)} />
          </div>
        </div>
      )}

      <style jsx global>{`
        .line-clamp-4 { display:-webkit-box;-webkit-line-clamp:4;-webkit-box-orient:vertical;overflow:hidden; }
        .scrollbar-hide::-webkit-scrollbar { display:none; }
        .scrollbar-hide { -ms-overflow-style:none;scrollbar-width:none; }
        .pb-safe { padding-bottom:max(12px,env(safe-area-inset-bottom)); }
      `}</style>
    </>
  );
}
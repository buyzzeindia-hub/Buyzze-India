"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import {
  ChevronRight, ArrowLeft, Search, MapPin, Check, Camera,
  Star, Shield, Zap, X, Plus, ImageIcon, ChevronDown,
} from "lucide-react";

/* ─────────────────────────────────────────────────────────────
   ✅ TYPES (Saved with granular conditions)
───────────────────────────────────────────────────────────── */
type ProductFormData = {
  title: string; description: string; price: string;
  brand: string; model: string; ram: string;
  storage: string; color: string; condition: string;
  category: string; state: string; city: string;
  pincode: string; address: string; landmark: string; images: string[];

  // Granular Conditions Columns (Must exist in Supabase 'products' table)
  cond_screen: string;
  cond_body: string;
  cond_cam: string;
  cond_func: string;
  cond_warr: string;
  cond_age: string;
};

const EMPTY_FORM: ProductFormData = {
  title: "", description: "", price: "", brand: "", model: "",
  ram: "", storage: "", color: "", condition: "", category: "Mobile",
  state: "", city: "", pincode: "", address: "", landmark: "", images: [],
  cond_screen: "", cond_body: "", cond_cam: "", cond_func: "", cond_warr: "", cond_age: "",
};

const BRANDS = [
  { id: "Apple",    name: "Apple",    logo: "/logos/apple.svg",               invertInDark: true  },
  { id: "Samsung",  name: "Samsung",  logo: "/logos/samsung.svg",             invertInDark: false },
  { id: "Google",   name: "Google",   logo: "/logos/google.svg",              invertInDark: false },
  { id: "OnePlus",  name: "OnePlus",  logo: "/logos/OnePlus-Logo.wine.svg",   invertInDark: false },
  { id: "Vivo",     name: "Vivo",     logo: "/logos/vivo.svg",                invertInDark: false },
  { id: "Xiaomi",   name: "Xiaomi",   logo: "/logos/xiaomi.svg",              invertInDark: true  },
  { id: "Oppo",     name: "Oppo",     logo: "/logos/Oppo-Logo.wine.svg",      invertInDark: true  },
  { id: "Motorola", name: "Motorola", logo: "/logos/motorola.svg",            invertInDark: true  },
];

/* ─────────────────────────────────────────────────────────────
   IMAGE COMPRESSION — Ultra-high compression, target < 10 KB
   Uses progressive quality reduction until size is under limit
───────────────────────────────────────────────────────────── */
const MAX_IMAGE_SIZE_BYTES = 10 * 1024; // 10 KB hard limit
const MAX_IMAGES = 5;

async function compressImage(file: File): Promise<File> {
  return new Promise((resolve) => {
    const img = new window.Image();
    const url = URL.createObjectURL(file);
    img.src = url;

    img.onload = () => {
      URL.revokeObjectURL(url);

      // Start with a limited resolution — 480px max side for aggressive size reduction
      let maxDim = 480;
      let quality = 0.55;

      const tryCompress = (dim: number, q: number, attempt: number) => {
        const canvas = document.createElement("canvas");
        const ratio = Math.min(dim / img.naturalWidth, dim / img.naturalHeight, 1);
        canvas.width  = Math.round(img.naturalWidth  * ratio);
        canvas.height = Math.round(img.naturalHeight * ratio);

        const ctx = canvas.getContext("2d");
        if (!ctx) { resolve(file); return; }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        canvas.toBlob((blob) => {
          if (!blob) { resolve(file); return; }

          if (blob.size <= MAX_IMAGE_SIZE_BYTES || attempt >= 8) {
            // Done — wrap in File
            resolve(new File([blob], file.name.replace(/\.[^.]+$/, ".webp"), { type: "image/webp" }));
          } else {
            // Still too large — reduce quality by 0.08 per step, shrink dim by 60px after step 3
            const nextQ   = Math.max(0.10, q - 0.08);
            const nextDim = attempt >= 3 ? Math.max(180, dim - 60) : dim;
            tryCompress(nextDim, nextQ, attempt + 1);
          }
        }, "image/webp", q);
      };

      tryCompress(maxDim, quality, 0);
    };

    img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
  });
}

async function addWatermark(file: File): Promise<File> {
  return new Promise((resolve) => {
    const img = new window.Image();
    const url = URL.createObjectURL(file);
    img.src = url;

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) { URL.revokeObjectURL(url); resolve(file); return; }

      ctx.drawImage(img, 0, 0);
      const W = img.naturalWidth; const H = img.naturalHeight;
      const fontSize = Math.max(Math.round(W * 0.038), 14);
      const text = "BuYzze"; const pad = Math.round(W * 0.025);

      ctx.font = `900 ${fontSize}px 'Arial Black', Arial, sans-serif`;
      ctx.textBaseline = "middle";

      const textW = ctx.measureText(text).width;
      const pillW = textW + pad * 2.2; const pillH = fontSize * 1.55;
      const pillX = W - pillW - pad; const pillY = H - pillH - pad;
      const radius = pillH * 0.38;

      ctx.fillStyle = "rgba(10, 10, 20, 0.62)";
      ctx.beginPath();
      ctx.moveTo(pillX + radius, pillY);
      ctx.lineTo(pillX + pillW - radius, pillY);
      ctx.quadraticCurveTo(pillX + pillW, pillY, pillX + pillW, pillY + radius);
      ctx.lineTo(pillX + pillW, pillY + pillH - radius);
      ctx.quadraticCurveTo(pillX + pillW, pillY + pillH, pillX + pillW - radius, pillY + pillH);
      ctx.lineTo(pillX + radius, pillY + pillH);
      ctx.quadraticCurveTo(pillX, pillY + pillH, pillX, pillY + pillH - radius);
      ctx.lineTo(pillX, pillY + radius);
      ctx.quadraticCurveTo(pillX, pillY, pillX + radius, pillY);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = "rgba(255,255,255,0.18)";
      ctx.lineWidth = Math.max(1, fontSize * 0.06);
      ctx.stroke();

      ctx.fillStyle = "rgba(255, 255, 255, 0.92)";
      ctx.fillText(text, pillX + pad * 1.1, pillY + pillH / 2);

      URL.revokeObjectURL(url);
      canvas.toBlob((blob) => {
        if (!blob) { resolve(file); return; }
        resolve(new File([blob], file.name.replace(/\.[^.]+$/, ".webp"), { type: "image/webp" }));
      }, "image/webp", 0.80);
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
  });
}

type UploadPhase = "idle" | "compressing" | "watermarking" | "uploading" | "done";

/* ─────────────────────────────────────────────────────────────
   GRADE CONFIG
───────────────────────────────────────────────────────────── */
const GRADE_CONFIG: Record<string, {
  label: string; sub: string; icon: string;
  pill: string; badge: string; bar: string;
}> = {
  "Used-Superb": {
    label: "Excellent",
    sub: "Well-maintained — buyers love this grade!",
    icon: "⭐",
    pill: "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-400",
    badge: "bg-emerald-500",
    bar: "bg-emerald-400 w-full",
  },
  "Used-Good": {
    label: "Good",
    sub: "Normal wear — still a great deal for buyers.",
    icon: "👍",
    pill: "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-950/40 dark:border-blue-800 dark:text-blue-400",
    badge: "bg-blue-500",
    bar: "bg-blue-400 w-2/3",
  },
  "Used-Fair": {
    label: "Fair",
    sub: "Has some issues — be upfront in your listing.",
    icon: "⚠️",
    pill: "bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-400",
    badge: "bg-amber-500",
    bar: "bg-amber-400 w-1/3",
  },
};

/* ─────────────────────────────────────────────────────────────
   STEP PROGRESS INDICATOR
───────────────────────────────────────────────────────────── */
const STEPS = [
  { num: 1, title: "Device",    label: "Brand & Model"    },
  { num: 2, title: "Condition", label: "Phone Condition"  },
  { num: 3, title: "Details",   label: "Price & Photos"   },
];

/* ─────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────── */
export default function ProductForm({
  initialValues,
  onSubmit,
  onComplete,
}: {
  initialValues?: Partial<ProductFormData>;
  onSubmit: (data: ProductFormData) => Promise<void>;
  onComplete: () => void;
}) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<ProductFormData>(EMPTY_FORM);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [uploadPhase, setUploadPhase] = useState<UploadPhase>("idle");
  const [imagePreviews, setImagePreviews] = useState<{ url: string; remote: string }[]>([]);

  useEffect(() => {
    if (initialValues) setForm((p) => ({ ...p, ...initialValues }));
  }, [initialValues]);

  const update = (key: keyof ProductFormData, value: string) =>
    setForm((p) => ({ ...p, [key]: value }));

  /* ── AUTO CONDITION ENGINE ── */
  useEffect(() => {
    const { cond_screen, cond_body, cond_cam, cond_func, cond_warr, cond_age } = form;
    if (!cond_screen) return;

    let finalCondition = "Used-Superb";

    if (
      cond_screen === "Screen Cracked" ||
      cond_body   === "Damaged"        ||
      cond_cam    === "Not Working"    ||
      cond_func   === "Some Issues"
    ) {
      finalCondition = "Used-Fair";
    } else if (
      cond_screen === "Has Scratches"  ||
      cond_body   === "Minor Dents"    ||
      cond_warr   === "No Warranty"    ||
      cond_age    === "2+ years"
    ) {
      finalCondition = "Used-Good";
    }

    update("condition", finalCondition);
  }, [form.cond_screen, form.cond_body, form.cond_cam, form.cond_func, form.cond_warr, form.cond_age]);

  /* ── PINCODE AUTO-FILL ── */
  const handlePincode = async (val: string) => {
    const pin = val.replace(/[^0-9]/g, "").slice(0, 6);
    update("pincode", pin);
    if (pin.length === 6) {
      try {
        const res  = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
        const data = await res.json();
        if (data[0].Status === "Success") {
          update("city",  data[0].PostOffice[0].District);
          update("state", data[0].PostOffice[0].State);
        }
      } catch { console.error("Pincode API Error"); }
    }
  };

  /* ── IMAGE UPLOAD (max 5, each < 10 KB after compression) ── */
  const uploadImages = async (files: FileList) => {
    const remaining = MAX_IMAGES - form.images.length;
    if (remaining <= 0) return;

    const fileArr = Array.from(files).slice(0, remaining);
    setUploading(true);

    try {
      const urls: string[] = [];
      const previews: { url: string; remote: string }[] = [];

      for (let i = 0; i < fileArr.length; i++) {
        const file = fileArr[i];

        setUploadPhase("compressing");
        const compressed  = await compressImage(file);

        setUploadPhase("watermarking");
        const watermarked = await addWatermark(compressed);

        setUploadPhase("uploading");

        const name = `${Date.now()}-${Math.random().toString(36).slice(2)}.webp`;
        const { error } = await supabase.storage
          .from("products-images")
          .upload(name, watermarked, { contentType: "image/webp", cacheControl: "3600" });

        if (error) throw error;

        const { data } = supabase.storage.from("products-images").getPublicUrl(name);
        urls.push(data.publicUrl);

        // Local blob preview
        previews.push({ url: URL.createObjectURL(watermarked), remote: data.publicUrl });
      }

      setUploadPhase("done");
      setImagePreviews((p) => [...p, ...previews]);
      setForm((p) => ({ ...p, images: [...p.images, ...urls] }));
      setTimeout(() => setUploadPhase("idle"), 1200);
    } catch (e: any) {
      alert("Upload failed: " + e.message);
      setUploadPhase("idle");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (remoteUrl: string) => {
    setImagePreviews((p) => p.filter((x) => x.remote !== remoteUrl));
    setForm((p) => ({ ...p, images: p.images.filter((i) => i !== remoteUrl) }));
  };

  /* ── SUBMIT ── */
  const handleSubmit = async () => {
    if (!form.title) form.title = `${form.brand} ${form.model} - ${form.condition}`;
    setSaving(true);
    try {
      await onSubmit(form);
      setShowSuccess(true);
      setTimeout(onComplete, 2500);
    } catch (e: any) { alert(e.message); }
    finally { setSaving(false); }
  };

  /* ── SUCCESS SCREEN ── */
  if (showSuccess) {
    return (
      <div className="fixed inset-0 z-50 bg-white dark:bg-[#080808] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-72 h-72 opacity-90">
          <DotLottieReact src="/success-list.lottie" autoplay />
        </div>
        <div className="mt-6 space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-xs font-semibold tracking-widest uppercase mb-4">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live on BuYzze
          </div>
          <h2 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-white">Ad Published!</h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 tracking-wide">Your phone is now visible to buyers near you.</p>
        </div>
      </div>
    );
  }

  /* ── CONDITION BLOCK COMPONENT ── */
  const ConditionBlock = ({
    label,
    propKey,
    options,
    hint,
    emoji,
  }: {
    label: string;
    propKey: keyof ProductFormData;
    options: string[];
    hint?: string;
    emoji?: string;
  }) => (
    <div className="pb-7 mb-7 border-b border-neutral-100 dark:border-neutral-800/60 last:border-0 last:pb-0 last:mb-0">
      <div className="flex items-start gap-3 mb-4">
        {emoji && <span className="text-xl mt-0.5 leading-none">{emoji}</span>}
        <div>
          <h4 className="text-[13px] font-semibold tracking-wide text-neutral-800 dark:text-neutral-200">{label}</h4>
          {hint && <p className="text-xs text-neutral-400 mt-0.5 leading-relaxed">{hint}</p>}
        </div>
      </div>
      <div className="flex flex-wrap gap-2.5">
        {options.map((opt) => {
          const isSelected = form[propKey] === opt;
          return (
            <button
              key={opt}
              onClick={() => update(propKey, opt)}
              className={`px-5 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 border-2 ${
                isSelected
                  ? "bg-neutral-900 border-neutral-900 text-white dark:bg-white dark:border-white dark:text-neutral-900 shadow-lg scale-[1.03]"
                  : "bg-white dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-700/60 text-neutral-600 dark:text-neutral-400 hover:border-neutral-400 dark:hover:border-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
              }`}
            >
              {isSelected && <Check size={11} className="inline mr-1.5 mb-0.5" strokeWidth={3} />}
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );

  const activeBrandData = BRANDS.find((b) => b.id === form.brand);
  const currentGrade    = GRADE_CONFIG[form.condition] ?? null;
  const imagesLeft      = MAX_IMAGES - form.images.length;

  /* ─────────────────────────────────────────────────────────────
     RENDER
  ───────────────────────────────────────────────────────────── */
  return (
    <div className="w-full max-w-[90rem] mx-auto flex flex-col md:flex-row bg-white dark:bg-[#080808] md:rounded-3xl md:border dark:border-neutral-800/50 shadow-[0_0_0_1px_rgb(0,0,0,0.04),0_16px_64px_rgb(0,0,0,0.06)] dark:shadow-none overflow-hidden min-h-screen md:min-h-[80vh] md:m-4">

      {/* ════════════════════════════════════
          🖥️  DESKTOP SIDEBAR
      ════════════════════════════════════ */}
      <div className="hidden md:flex md:w-[34%] lg:w-[30%] flex-col justify-between bg-neutral-950 dark:bg-neutral-900 p-10 lg:p-12 relative overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/[0.02] rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

        <div className="relative z-10">
          {/* Wordmark */}
          <div className="mb-12">
            <span className="text-white font-bold text-xl tracking-tight">BuYzze</span>
            <span className="ml-2 text-[10px] font-semibold tracking-[0.2em] uppercase text-neutral-500 align-middle">Sell</span>
          </div>

          <h2 className="text-3xl lg:text-4xl font-semibold tracking-tight text-white leading-[1.15] mb-3">
            List your<br />phone instantly.
          </h2>
          <p className="text-sm text-neutral-500 leading-relaxed max-w-[22ch]">
            Premium verified listing. Reach thousands of buyers near you.
          </p>

          {/* Trust badges */}
          <div className="mt-10 flex flex-col gap-3">
            {[
              { icon: <Zap size={14} />,    label: "Live in under 3 minutes"       },
              { icon: <Shield size={14} />, label: "Buyer-verified safe listing"   },
              { icon: <Star size={14} />,   label: "Premium seller badge included" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3 text-[13px] text-neutral-400">
                <div className="w-7 h-7 rounded-lg bg-white/[0.07] border border-white/[0.06] flex items-center justify-center text-neutral-400 flex-shrink-0">
                  {item.icon}
                </div>
                {item.label}
              </div>
            ))}
          </div>

          {/* Step Progress */}
          <div className="mt-14 space-y-1">
            {STEPS.map((s, idx) => {
              const isDone   = step > s.num;
              const isActive = step === s.num;
              return (
                <div key={s.num}>
                  <div className={`flex items-center gap-4 py-3 px-3 rounded-xl transition-all ${isActive ? "bg-white/[0.07]" : ""}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold border flex-shrink-0 transition-all ${
                      isDone
                        ? "bg-emerald-500 border-emerald-500 text-white"
                        : isActive
                          ? "bg-white border-white text-neutral-900"
                          : "border-neutral-700 text-neutral-600"
                    }`}>
                      {isDone ? <Check size={13} strokeWidth={3} /> : s.num}
                    </div>
                    <div>
                      <p className={`text-[13px] font-semibold tracking-wide ${isActive ? "text-white" : isDone ? "text-neutral-400" : "text-neutral-600"}`}>
                        {s.title}
                      </p>
                      <p className={`text-[11px] mt-0.5 ${isActive ? "text-neutral-400" : "text-neutral-700"}`}>
                        {s.label}
                      </p>
                    </div>
                  </div>
                  {idx < STEPS.length - 1 && (
                    <div className={`ml-7 w-px h-4 ${step > s.num ? "bg-emerald-700" : "bg-neutral-800"}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="relative z-10 text-[11px] text-neutral-700 font-medium tracking-widest uppercase border-t border-neutral-800 pt-6">
          Secured by BuYzze Enterprise Index
        </div>
      </div>

      {/* ════════════════════════════════════
          📱  MOBILE TOP BAR
      ════════════════════════════════════ */}
      <div className="md:hidden sticky top-0 z-30 bg-white/90 dark:bg-[#080808]/90 backdrop-blur-xl border-b border-neutral-100 dark:border-neutral-800/60">
        <div className="px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {step > 1 ? (
              <button
                onClick={() => setStep(step - 1)}
                className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-600 dark:text-neutral-400 active:scale-95 transition-transform"
              >
                <ArrowLeft size={16} strokeWidth={2} />
              </button>
            ) : (
              <div className="w-8 h-8 rounded-full bg-neutral-950 dark:bg-white flex items-center justify-center">
                <span className="text-white dark:text-neutral-900 font-bold text-xs">B</span>
              </div>
            )}
            <div>
              <p className="text-[13px] font-semibold text-neutral-900 dark:text-white leading-tight">
                {STEPS[step - 1].title}
              </p>
              <p className="text-[10px] text-neutral-400 leading-tight">{STEPS[step - 1].label}</p>
            </div>
          </div>
          {/* Mobile step pills */}
          <div className="flex items-center gap-1.5">
            {STEPS.map((s) => (
              <div
                key={s.num}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  step === s.num ? "w-6 bg-neutral-900 dark:bg-white" :
                  step > s.num  ? "w-3 bg-emerald-500" :
                  "w-3 bg-neutral-200 dark:bg-neutral-700"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════
          🚀  MAIN CONTENT
      ════════════════════════════════════ */}
      <div className="flex-1 overflow-y-auto bg-[#fafafa] dark:bg-[#0c0c0c]">

        {/* ══════════════════════════════════════
            STEP 1 — BRAND & MODEL
        ══════════════════════════════════════ */}
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-bottom-6 duration-500 p-5 md:p-10 lg:p-14">
            {!form.brand ? (
              <>
                {/* Desktop heading */}
                <div className="hidden md:block mb-10">
                  <h3 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-white mb-1.5">Choose your brand</h3>
                  <p className="text-sm text-neutral-500">Select the manufacturer of the phone you're selling.</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                  {BRANDS.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => update("brand", b.id)}
                      className="group relative aspect-[4/3] bg-white dark:bg-neutral-900 border-2 border-neutral-100 dark:border-neutral-800 rounded-2xl p-5 md:p-7 flex flex-col items-center justify-center gap-3 hover:border-neutral-900 dark:hover:border-white hover:shadow-[0_4px_24px_rgb(0,0,0,0.10)] dark:hover:shadow-none transition-all duration-200 active:scale-[0.97]"
                    >
                      <img
                        src={b.logo}
                        alt={b.name}
                        className={`h-10 md:h-12 object-contain opacity-70 group-hover:opacity-100 transition-opacity duration-200 ${b.invertInDark ? "dark:invert" : ""}`}
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                          e.currentTarget.parentElement!.innerHTML = `<span class="text-2xl font-bold text-neutral-400">${b.name}</span>`;
                        }}
                      />
                      <span className="text-[11px] font-semibold tracking-wide text-neutral-500 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors">
                        {b.name}
                      </span>
                    </button>
                  ))}

                  <button
                    onClick={() => { const b = prompt("Enter Brand Name"); if (b) update("brand", b); }}
                    className="aspect-[4/3] bg-white dark:bg-neutral-900 border-2 border-dashed border-neutral-200 dark:border-neutral-700 rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-neutral-400 dark:hover:border-neutral-500 transition-all text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                  >
                    <Plus size={20} strokeWidth={1.5} />
                    <span className="text-[11px] font-semibold tracking-wide">Other Brand</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="max-w-xl mx-auto animate-in fade-in duration-400">

                {/* Brand strip */}
                <div className="flex items-center justify-between mb-8 pb-6 border-b border-neutral-200 dark:border-neutral-800">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-white dark:bg-neutral-900 border-2 border-neutral-100 dark:border-neutral-800 rounded-2xl flex items-center justify-center shadow-sm">
                      {activeBrandData?.logo ? (
                        <img
                          src={activeBrandData.logo}
                          className={`h-8 object-contain ${activeBrandData.invertInDark ? "dark:invert" : ""}`}
                          alt={form.brand}
                        />
                      ) : (
                        <span className="text-xl font-bold text-neutral-600">{form.brand[0]}</span>
                      )}
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-neutral-400 mb-0.5">Selected Brand</p>
                      <p className="text-xl font-semibold text-neutral-900 dark:text-white">{form.brand}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => update("brand", "")}
                    className="px-4 py-2 rounded-xl text-[12px] font-semibold text-neutral-500 hover:text-neutral-900 dark:hover:text-white border border-neutral-200 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-500 transition-all"
                  >
                    Change
                  </button>
                </div>

                {/* Model */}
                <div className="mb-7">
                  <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-neutral-400 mb-3">Model Name</label>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={18} strokeWidth={2} />
                    <input
                      type="text"
                      value={form.model}
                      onChange={(e) => update("model", e.target.value)}
                      placeholder="e.g. iPhone 15 Pro Max, Galaxy S24 Ultra"
                      className="w-full bg-white dark:bg-neutral-900 border-2 border-neutral-200 dark:border-neutral-700 focus:border-neutral-900 dark:focus:border-white rounded-2xl py-4 pl-11 pr-4 text-base font-medium text-neutral-900 dark:text-white outline-none transition-all placeholder:text-neutral-300 dark:placeholder:text-neutral-600 shadow-sm"
                    />
                  </div>
                </div>

                {/* RAM + Storage */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  {[
                    { key: "ram" as const,     label: "RAM",     opts: ["4GB","6GB","8GB","12GB","16GB"],        placeholder: "Select RAM"      },
                    { key: "storage" as const, label: "Storage", opts: ["64GB","128GB","256GB","512GB","1TB"],   placeholder: "Select Capacity" },
                  ].map((field) => (
                    <div key={field.key}>
                      <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-neutral-400 mb-3">{field.label}</label>
                      <div className="relative">
                        <select
                          value={form[field.key]}
                          onChange={(e) => update(field.key, e.target.value)}
                          className="w-full appearance-none bg-white dark:bg-neutral-900 border-2 border-neutral-200 dark:border-neutral-700 focus:border-neutral-900 dark:focus:border-white rounded-2xl p-4 text-sm font-medium outline-none dark:text-white cursor-pointer transition-all shadow-sm"
                        >
                          <option value="">{field.placeholder}</option>
                          {field.opts.map((o) => <option key={o} value={o}>{o}</option>)}
                        </select>
                        <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  disabled={!form.model || !form.storage}
                  onClick={() => setStep(2)}
                  className="w-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-semibold tracking-wide py-4 rounded-2xl disabled:opacity-30 active:scale-[0.99] transition-all flex items-center justify-center gap-2.5 shadow-lg hover:shadow-xl disabled:shadow-none text-[15px]"
                >
                  Continue to Condition <ChevronRight size={16} strokeWidth={2.5} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════
            STEP 2 — CONDITION
        ══════════════════════════════════════ */}
        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-bottom-6 duration-500 p-5 md:p-10 lg:p-14">
            <div className="max-w-xl mx-auto">
              {/* Heading */}
              <div className="hidden md:block mb-8">
                <h3 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-white mb-1.5">Phone condition</h3>
                <p className="text-sm text-neutral-500">Honest answers build buyer trust and get you better offers.</p>
              </div>

              {/* Condition card */}
              <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-5 md:p-7 shadow-[0_2px_16px_rgb(0,0,0,0.06)] dark:shadow-none mb-6">
                <ConditionBlock label="Screen"          propKey="cond_screen" emoji="📱" options={["Like New","Has Scratches","Screen Cracked"]} hint="How does the display look right now?" />
                <ConditionBlock label="Body & Frame"    propKey="cond_body"   emoji="🔲" options={["Like New","Minor Dents","Damaged"]}          hint="Any dents or cracks on the back or sides?" />
                <ConditionBlock label="Camera"          propKey="cond_cam"    emoji="📷" options={["Works Perfectly","Not Working"]}             hint="Does the camera take clear photos?" />
                <ConditionBlock label="Everything working?" propKey="cond_func" emoji="⚙️" options={["All Working","Some Issues"]}             hint="Buttons, speaker, Face ID, charging port…" />
                <ConditionBlock label="Warranty"        propKey="cond_warr"   emoji="📋" options={["Under Warranty","No Warranty"]} />
                <ConditionBlock label="Age of phone"    propKey="cond_age"    emoji="🗓️" options={["0-6 months","6-12 months","1-2 years","2+ years"]} />
              </div>

              {/* Calculated Grade */}
              {form.cond_screen && form.cond_body && form.cond_cam && form.cond_func && currentGrade && (
                <div className={`mb-6 p-5 rounded-2xl border-2 ${currentGrade.pill} transition-all duration-500 animate-in fade-in`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] opacity-60 mb-1">Auto-detected grade</p>
                      <div className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${currentGrade.badge} shadow-sm`} />
                        <p className="text-lg font-bold">{currentGrade.label}</p>
                        <span className="text-base">{currentGrade.icon}</span>
                      </div>
                      <p className="text-[12px] mt-1 opacity-70 font-medium">{currentGrade.sub}</p>
                    </div>
                    {/* Quality bar */}
                    <div className="w-16 h-1.5 bg-current/10 rounded-full overflow-hidden flex-shrink-0">
                      <div className={`h-full rounded-full ${currentGrade.bar} transition-all`} />
                    </div>
                  </div>
                </div>
              )}

              <button
                disabled={!form.cond_screen || !form.cond_body || !form.cond_cam || !form.cond_func || !form.cond_warr || !form.cond_age}
                onClick={() => setStep(3)}
                className="w-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-semibold tracking-wide py-4 rounded-2xl disabled:opacity-30 active:scale-[0.99] transition-all flex items-center justify-center gap-2.5 shadow-lg hover:shadow-xl disabled:shadow-none text-[15px]"
              >
                Continue to Price & Photos <ChevronRight size={16} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════
            STEP 3 — PRICE, PHOTOS & LOCATION
        ══════════════════════════════════════ */}
        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-bottom-6 duration-500 p-5 md:p-10 lg:p-14">
            <div className="max-w-xl mx-auto space-y-5">

              {/* Desktop heading */}
              <div className="hidden md:block mb-2">
                <h3 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-white mb-1.5">Price & Photos</h3>
                <p className="text-sm text-neutral-500">Set your price, upload photos, and confirm pickup location.</p>
              </div>

              {/* ── PRICE CARD ── */}
              <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-[0_2px_16px_rgb(0,0,0,0.06)] dark:shadow-none">
                <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-neutral-400 mb-4">Your Asking Price</label>
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-light text-neutral-300 dark:text-neutral-600 leading-none">₹</span>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => update("price", e.target.value)}
                    placeholder="0"
                    className="flex-1 bg-transparent text-4xl font-bold text-neutral-900 dark:text-white outline-none placeholder:text-neutral-200 dark:placeholder:text-neutral-700 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
                {form.price && (
                  <p className="text-xs text-neutral-400 mt-3 font-medium">
                    ≈ {Number(form.price).toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 })} · buyers see this price
                  </p>
                )}
              </div>

              {/* ── COLOR CARD ── */}
              <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-[0_2px_16px_rgb(0,0,0,0.06)] dark:shadow-none">
                <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-neutral-400 mb-4">Phone Colour</label>
                <input
                  type="text"
                  value={form.color}
                  onChange={(e) => update("color", e.target.value)}
                  placeholder="e.g. Midnight Black, Starlight White, Ocean Blue"
                  className="w-full bg-neutral-50 dark:bg-neutral-800/50 border-2 border-neutral-100 dark:border-neutral-700/60 focus:border-neutral-900 dark:focus:border-white rounded-2xl px-4 py-3.5 text-sm font-medium text-neutral-900 dark:text-white outline-none transition-all placeholder:text-neutral-300 dark:placeholder:text-neutral-600"
                />
              </div>

              {/* ── PHOTOS CARD ── */}
              <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-[0_2px_16px_rgb(0,0,0,0.06)] dark:shadow-none">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-neutral-400 mb-0.5">Phone Photos</label>
                    <p className="text-[11px] text-neutral-400">
                      {form.images.length}/{MAX_IMAGES} uploaded
                      {imagesLeft > 0 && ` · ${imagesLeft} slot${imagesLeft > 1 ? "s" : ""} left`}
                    </p>
                  </div>
                  {uploadPhase !== "idle" && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800">
                      <div className="w-1.5 h-1.5 rounded-full bg-neutral-900 dark:bg-white animate-pulse" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-600 dark:text-neutral-300">
                        {uploadPhase === "compressing"  ? "Compressing…"  :
                         uploadPhase === "watermarking" ? "Watermarking…" :
                         uploadPhase === "uploading"    ? "Uploading…"    : "Done ✓"}
                      </span>
                    </div>
                  )}
                </div>

                {/* Image grid */}
                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5 mb-4">
                    {imagePreviews.map((img, idx) => (
                      <div key={img.remote} className="relative group aspect-square rounded-2xl overflow-hidden border-2 border-neutral-100 dark:border-neutral-700 shadow-sm">
                        <img src={img.url} className="w-full h-full object-cover" alt={`Photo ${idx + 1}`} />
                        {idx === 0 && (
                          <div className="absolute bottom-1.5 left-1.5 bg-neutral-900/80 text-white text-[9px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded-md backdrop-blur-sm">
                            Cover
                          </div>
                        )}
                        <button
                          onClick={() => removeImage(img.remote)}
                          className="absolute top-1.5 right-1.5 w-6 h-6 bg-neutral-900/70 backdrop-blur-sm text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity active:scale-90 shadow"
                        >
                          <X size={11} strokeWidth={3} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload zone */}
                {imagesLeft > 0 ? (
                  <label className={`relative flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-2xl p-8 cursor-pointer transition-all group
                    ${uploading
                      ? "border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/30 cursor-not-allowed"
                      : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-900 dark:hover:border-white hover:bg-neutral-50 dark:hover:bg-neutral-800/30"
                    }`}
                  >
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      disabled={uploading}
                      className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
                      onChange={(e) => e.target.files && uploadImages(e.target.files)}
                    />
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                      uploading ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-400" : "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 group-hover:scale-105"
                    }`}>
                      {uploading ? <Camera size={20} strokeWidth={1.5} className="animate-pulse" /> : <Camera size={20} strokeWidth={1.5} />}
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                        {uploading ? "Processing your photos…" : `Add ${imagePreviews.length === 0 ? "" : "more "}photos`}
                      </p>
                      <p className="text-[12px] text-neutral-400 mt-0.5 leading-relaxed">
                        {uploading ? "Please wait, this takes a moment" : `Up to ${imagesLeft} more · Auto-compressed & watermarked`}
                      </p>
                    </div>
                  </label>
                ) : (
                  <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center flex-shrink-0">
                      <Check size={14} strokeWidth={3} className="text-white" />
                    </div>
                    <p className="text-[13px] font-semibold text-emerald-700 dark:text-emerald-400">
                      All {MAX_IMAGES} photos uploaded — great listing!
                    </p>
                  </div>
                )}

                {imagePreviews.length === 0 && !uploading && (
                  <p className="text-center text-[11px] text-neutral-400 mt-3 font-medium">
                    <ImageIcon size={11} className="inline mr-1 mb-0.5" />
                    Real photos get 3× more buyer interest
                  </p>
                )}
              </div>

              {/* ── LOCATION CARD ── */}
              <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-[0_2px_16px_rgb(0,0,0,0.06)] dark:shadow-none">
                <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-neutral-400 mb-5">
                  <MapPin size={12} strokeWidth={2.5} /> Pickup Location
                </label>

                {/* Pincode row */}
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <input
                    type="text"
                    value={form.pincode}
                    onChange={(e) => handlePincode(e.target.value)}
                    maxLength={6}
                    placeholder="Pincode"
                    className="w-full bg-neutral-50 dark:bg-neutral-800/50 border-2 border-neutral-100 dark:border-neutral-700/60 focus:border-neutral-900 dark:focus:border-white rounded-2xl px-3 py-3 text-sm font-semibold text-center text-neutral-900 dark:text-white outline-none transition-all placeholder:text-neutral-300 dark:placeholder:text-neutral-600"
                  />
                  <input
                    type="text"
                    value={form.city}
                    readOnly
                    placeholder="City"
                    className="w-full bg-neutral-50/50 dark:bg-neutral-800/20 border border-dashed border-neutral-200 dark:border-neutral-700/40 rounded-2xl px-3 py-3 text-sm font-medium text-center text-neutral-400 outline-none"
                  />
                  <input
                    type="text"
                    value={form.state}
                    readOnly
                    placeholder="State"
                    className="w-full bg-neutral-50/50 dark:bg-neutral-800/20 border border-dashed border-neutral-200 dark:border-neutral-700/40 rounded-2xl px-3 py-3 text-sm font-medium text-center text-neutral-400 outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={form.address}
                    onChange={(e) => update("address", e.target.value)}
                    placeholder="House / Flat No., Street, Area"
                    className="w-full bg-neutral-50 dark:bg-neutral-800/50 border-2 border-neutral-100 dark:border-neutral-700/60 focus:border-neutral-900 dark:focus:border-white rounded-2xl px-4 py-3.5 text-sm font-medium text-neutral-900 dark:text-white outline-none transition-all placeholder:text-neutral-300 dark:placeholder:text-neutral-600"
                  />
                  <input
                    type="text"
                    value={form.landmark}
                    onChange={(e) => update("landmark", e.target.value)}
                    placeholder="Landmark (e.g. Near City Mall)"
                    className="w-full bg-neutral-50 dark:bg-neutral-800/50 border-2 border-neutral-100 dark:border-neutral-700/60 focus:border-neutral-900 dark:focus:border-white rounded-2xl px-4 py-3.5 text-sm font-medium text-neutral-900 dark:text-white outline-none transition-all placeholder:text-neutral-300 dark:placeholder:text-neutral-600"
                  />
                </div>
              </div>

              {/* ── EXTRA DETAILS CARD ── */}
              <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-[0_2px_16px_rgb(0,0,0,0.06)] dark:shadow-none">
                <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-neutral-400 mb-4">
                  Extra Details <span className="font-normal opacity-60">(Optional)</span>
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => update("description", e.target.value)}
                  placeholder="e.g. Battery health 91%, box included, original charger, any faults, etc."
                  className="w-full bg-neutral-50 dark:bg-neutral-800/50 border-2 border-neutral-100 dark:border-neutral-700/60 focus:border-neutral-900 dark:focus:border-white rounded-2xl px-4 py-4 text-sm font-medium text-neutral-900 dark:text-white outline-none transition-all placeholder:text-neutral-300 dark:placeholder:text-neutral-600 resize-none min-h-[110px] leading-relaxed"
                />
              </div>

              {/* ── LISTING SUMMARY STRIP ── */}
              {form.price && form.condition && (
                <div className="flex items-center gap-3 p-4 bg-neutral-950 dark:bg-neutral-800 rounded-2xl animate-in fade-in">
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-neutral-500 mb-0.5">Your Listing Preview</p>
                    <p className="text-white font-semibold text-sm truncate">{form.brand} {form.model} — {GRADE_CONFIG[form.condition]?.label ?? form.condition}</p>
                  </div>
                  <p className="text-white font-bold text-lg flex-shrink-0">₹{Number(form.price).toLocaleString("en-IN")}</p>
                </div>
              )}

              {/* ── SUBMIT ── */}
              <button
                disabled={saving || uploading || !form.price || !form.pincode}
                onClick={handleSubmit}
                className="w-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold tracking-wide py-4 rounded-2xl disabled:opacity-30 active:scale-[0.99] transition-all text-[15px] shadow-[0_4px_24px_rgb(0,0,0,0.18)] hover:shadow-[0_8px_32px_rgb(0,0,0,0.22)] disabled:shadow-none"
              >
                {saving ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 dark:border-neutral-900/30 border-t-white dark:border-t-neutral-900 rounded-full animate-spin" />
                    Publishing your ad…
                  </span>
                ) : "Publish Listing →"}
              </button>
              <p className="text-center text-[11px] text-neutral-400 font-medium -mt-1 pb-4">
                By posting, you agree to BuYzze's seller terms.
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
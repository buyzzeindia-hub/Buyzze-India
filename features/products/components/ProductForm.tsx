"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { PHONE_CATALOG } from "../constants/catalog";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

/* ─────────────────────────────────────────────────────────────
   TYPES  (unchanged)
───────────────────────────────────────────────────────────── */
type ProductFormData = {
  title: string; description: string; price: string;
  brand: string; model: string; ram: string;
  storage: string; color: string; condition: string;
  category: string; state: string; city: string;
  pincode: string; address: string; images: string[];
};

const EMPTY_FORM: ProductFormData = {
  title: "", description: "", price: "", brand: "", model: "",
  ram: "", storage: "", color: "", condition: "", category: "Mobile",
  state: "", city: "", pincode: "", address: "", images: [],
};

/* ─────────────────────────────────────────────────────────────
   STEP 1 — IMAGE COMPRESSION
   Uses browser-image-compression (npm install browser-image-compression)
   Falls back gracefully if library fails — original file still uploads
───────────────────────────────────────────────────────────── */
async function compressImage(file: File): Promise<File> {
  try {
    // Dynamic import — only loads when user actually selects images
    const imageCompression = (await import("browser-image-compression")).default;

    const compressed = await imageCompression(file, {
      maxSizeMB:        0.3,      // target ≤ 300 KB (hard limit)
      maxWidthOrHeight: 1080,     // resize to max 1080px — still sharp on mobile
      useWebWorker:     true,     // non-blocking — UI stays responsive
      fileType:         "image/webp", // convert to webp → smallest format
      initialQuality:   0.78,     // start lower so 300KB target is hit reliably
    });

    // imageCompression returns Blob — wrap back into File
    return new File([compressed], file.name.replace(/\.[^.]+$/, ".webp"), {
      type: "image/webp",
    });
  } catch (err) {
    console.warn("⚠️ Compression failed, using original file:", err);
    return file; // safe fallback
  }
}

/* ─────────────────────────────────────────────────────────────
   STEP 2 — WATERMARK
   Pure Canvas API — no extra library needed
   Adds "BuYzze" text bottom-right corner, OLX-style pill badge
───────────────────────────────────────────────────────────── */
async function addWatermark(file: File): Promise<File> {
  return new Promise((resolve) => {
    const img = new window.Image();
    const url = URL.createObjectURL(file);
    img.src   = url;

    img.onload = () => {
      const canvas  = document.createElement("canvas");
      canvas.width  = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx     = canvas.getContext("2d");

      if (!ctx) {
        URL.revokeObjectURL(url);
        resolve(file); // fallback — no watermark but still uploads
        return;
      }

      // Draw original image
      ctx.drawImage(img, 0, 0);

      /* ── Watermark config ── */
      const W        = img.naturalWidth;
      const H        = img.naturalHeight;
      const fontSize = Math.max(Math.round(W * 0.038), 14); // responsive size
      const text     = "BuYzze";
      const pad      = Math.round(W * 0.025);               // padding from edge

      ctx.font = `900 ${fontSize}px 'Arial Black', Arial, sans-serif`;
      ctx.textBaseline = "middle";

      const textW  = ctx.measureText(text).width;
      const pillW  = textW + pad * 2.2;
      const pillH  = fontSize * 1.55;
      const pillX  = W - pillW - pad;
      const pillY  = H - pillH - pad;
      const radius = pillH * 0.38;

      // Dark semi-transparent background pill
      ctx.fillStyle = "rgba(10, 10, 20, 0.62)";
      ctx.beginPath();
      // Manual rounded rect (works in all browsers, no need for roundRect)
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

      // Subtle white border on pill
      ctx.strokeStyle = "rgba(255,255,255,0.18)";
      ctx.lineWidth   = Math.max(1, fontSize * 0.06);
      ctx.stroke();

      // "BuYzze" text — white with slight blue tint
      ctx.fillStyle = "rgba(255, 255, 255, 0.92)";
      ctx.fillText(text, pillX + pad * 1.1, pillY + pillH / 2);

      URL.revokeObjectURL(url);

      canvas.toBlob(
        (blob) => {
          if (!blob) { resolve(file); return; }
          resolve(new File([blob], file.name.replace(/\.[^.]+$/, ".webp"), {
            type: "image/webp",
          }));
        },
        "image/webp",
        0.80, // keep final file ≤ 300 KB after watermark draw
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file); // safe fallback
    };
  });
}

/* ─────────────────────────────────────────────────────────────
   STEP 3 — FULL PIPELINE
   compress → watermark → return processed File
───────────────────────────────────────────────────────────── */
async function processImage(file: File): Promise<File> {
  const compressed  = await compressImage(file);   // 1. compress
  const watermarked = await addWatermark(compressed); // 2. watermark
  return watermarked;
}

/* ─────────────────────────────────────────────────────────────
   UPLOAD STATUS TYPE
───────────────────────────────────────────────────────────── */
type UploadPhase =
  | "idle"
  | "compressing"
  | "watermarking"
  | "uploading"
  | "done";

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
  const [form,        setForm]        = useState<ProductFormData>(EMPTY_FORM);
  const [uploading,   setUploading]   = useState(false);
  const [saving,      setSaving]      = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [uploadPhase, setUploadPhase] = useState<UploadPhase>("idle");
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });

  /* ── initialValues sync (unchanged) ── */
  useEffect(() => {
    if (initialValues) {
      setForm({
        title:       initialValues.title       ?? "",
        description: initialValues.description ?? "",
        price:       initialValues.price?.toString() ?? "",
        brand:       initialValues.brand       ?? "",
        model:       initialValues.model       ?? "",
        ram:         initialValues.ram         ?? "",
        storage:     initialValues.storage     ?? "",
        color:       initialValues.color       ?? "",
        condition:   initialValues.condition   ?? "",
        category:    initialValues.category    ?? "Mobile",
        state:       initialValues.state       ?? "",
        city:        initialValues.city        ?? "",
        pincode:     initialValues.pincode     ?? "",
        address:     initialValues.address     ?? "",
        images:      initialValues.images      ?? [],
      });
    }
  }, [initialValues]);

  const update = (key: keyof ProductFormData, value: string) =>
    setForm(p => ({ ...p, [key]: value }));

  /* ── Pincode auto-fill (unchanged) ── */
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

  /* ── UPDATED uploadImages — with compression + watermark pipeline ── */
  const uploadImages = async (files: FileList) => {
    setUploading(true);
    const fileArr = Array.from(files);
    setUploadProgress({ current: 0, total: fileArr.length });

    try {
      const urls: string[] = [];

      for (let i = 0; i < fileArr.length; i++) {
        const file = fileArr[i];
        setUploadProgress({ current: i + 1, total: fileArr.length });

        // ── Phase 1: Compress ──
        setUploadPhase("compressing");
        const compressed = await compressImage(file);

        // ── Phase 2: Watermark ──
        setUploadPhase("watermarking");
        const watermarked = await addWatermark(compressed);

        // ── Phase 3: Upload to Supabase ──
        setUploadPhase("uploading");
        const name = `${Date.now()}-${Math.random().toString(36).slice(2)}.webp`;

        const { error } = await supabase.storage
          .from("products-images")
          .upload(name, watermarked, {
            contentType: "image/webp",
            cacheControl: "3600",
          });

        if (error) throw error;

        const { data } = supabase.storage
          .from("products-images")
          .getPublicUrl(name);

        urls.push(data.publicUrl);
      }

      setUploadPhase("done");
      setForm(p => ({ ...p, images: [...p.images, ...urls] }));

      // reset phase after brief moment
      setTimeout(() => setUploadPhase("idle"), 1200);

    } catch (e: any) {
      alert("Upload failed: " + e.message);
      setUploadPhase("idle");
    } finally {
      setUploading(false);
    }
  };

  /* ── handleSubmit (unchanged) ── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSubmit(form);
      setShowSuccess(true);
      setTimeout(onComplete, 2000);
    } catch (e: any) { alert(e.message); }
    finally { setSaving(false); }
  };

  /* ── Upload status label ── */
  const uploadStatusLabel = (): string => {
    const { current, total } = uploadProgress;
    const suffix = total > 1 ? ` (${current}/${total})` : "";
    switch (uploadPhase) {
      case "compressing":   return `Compressing${suffix}…`;
      case "watermarking":  return `Adding watermark${suffix}…`;
      case "uploading":     return `Uploading${suffix}…`;
      case "done":          return "✓ Done!";
      default:              return "Add images";
    }
  };

  const isProcessing = uploading;

  /* ── Styles (unchanged) ── */
  const inputStyle  = "w-full bg-gray-50 dark:bg-[#1e293b] border-2 border-gray-100 dark:border-gray-800 focus:border-blue-500 p-4 rounded-2xl outline-none transition-all text-gray-900 dark:text-white font-medium";
  const selectStyle = "w-full bg-gray-50 dark:bg-[#1e293b] border-2 border-gray-100 dark:border-gray-800 focus:border-blue-500 p-4 rounded-2xl outline-none transition-all text-gray-900 dark:text-white font-bold appearance-none";

  /* ── Success screen (unchanged) ── */
  if (showSuccess) {
    return (
      <div className="fixed inset-0 z-50 bg-white dark:bg-[#05080d] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-80 h-80">
          <DotLottieReact src="/success-list.lottie" autoplay />
        </div>
        <h2 className="text-3xl font-black text-blue-600">Listing Saved!</h2>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-5 bg-white dark:bg-[#0f172a] p-6 md:p-10 rounded-[2.5rem] border dark:border-gray-800 shadow-2xl"
    >
      {/* ── Title & Price (unchanged) ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase text-blue-600 ml-2">Product Title</label>
          <input className={inputStyle} placeholder="Title" value={form.title}
            onChange={e => update("title", e.target.value)} required />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase text-blue-600 ml-2">Price</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
            <input className={`${inputStyle} pl-8 text-xl font-black text-blue-600`}
              placeholder="Price" type="number" value={form.price}
              onChange={e => update("price", e.target.value)} required />
          </div>
        </div>
      </div>

      {/* ── Brand, Model, RAM, Storage (unchanged) ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Brand</label>
          <input className={inputStyle} list="brands" value={form.brand}
            onChange={e => update("brand", e.target.value)} />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Model</label>
          <input className={inputStyle} value={form.model}
            onChange={e => update("model", e.target.value)} />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase text-gray-400 ml-2">RAM</label>
          <select className={selectStyle} value={form.ram}
            onChange={e => update("ram", e.target.value)}>
            <option value="">Select</option>
            {["2GB","4GB","6GB","8GB","12GB","16GB"].map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Storage</label>
          <select className={selectStyle} value={form.storage}
            onChange={e => update("storage", e.target.value)}>
            <option value="">Select</option>
            {["32GB","64GB","128GB","256GB","512GB","1TB"].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* ── Condition & Color (unchanged) ── */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Condition</label>
          <select className={selectStyle} value={form.condition}
            onChange={e => update("condition", e.target.value)}>
            <option value="">Select</option>
            <option value="Used-Superb">Used-Superb</option>
            <option value="Used-Good">Used-Good</option>
            <option value="Used-Fair">Used-Fair</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Color</label>
          <input className={inputStyle} value={form.color}
            onChange={e => update("color", e.target.value)} />
        </div>
      </div>

      {/* ── Description (unchanged) ── */}
      <div className="space-y-1">
        <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Description</label>
        <textarea className={`${inputStyle} h-24 resize-none`} placeholder="Details..."
          value={form.description} onChange={e => update("description", e.target.value)} />
      </div>

      {/* ── Location (unchanged) ── */}
      <div className="space-y-1 pt-2">
        <label className="text-[10px] font-black uppercase text-blue-600 ml-2">Pickup Location</label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input className={inputStyle} placeholder="Pincode" value={form.pincode}
            onChange={e => handlePincode(e.target.value)} maxLength={6} required />
          <input className={`${inputStyle} opacity-60`} placeholder="City" value={form.city} readOnly />
          <input className={`${inputStyle} opacity-60`} placeholder="State" value={form.state} readOnly />
        </div>
        <input className={`${inputStyle} mt-2`} placeholder="Full Address" value={form.address}
          onChange={e => update("address", e.target.value)} required />
      </div>

      {/* ── IMAGES — updated with status indicator ── */}
      <div className="space-y-1">
        <div className="flex items-center justify-between mb-1 px-1">
          <label className="text-[10px] font-black uppercase text-blue-600 ml-1">
            Photos
          </label>
          {/* Processing badge */}
          {uploadPhase !== "idle" && (
            <span className="flex items-center gap-1.5 text-[10px] font-black px-3 py-1 rounded-full"
              style={{
                background: uploadPhase === "done" ? "#dcfce7" : "#eff6ff",
                color:      uploadPhase === "done" ? "#15803d" : "#1d4ed8",
                border:     uploadPhase === "done" ? "1px solid #bbf7d0" : "1px solid #bfdbfe",
              }}>
              {uploadPhase !== "done" && (
                /* spinning circle */
                <svg className="animate-spin" width="10" height="10" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                </svg>
              )}
              {uploadStatusLabel()}
            </span>
          )}
        </div>

        <div className={`relative border-2 border-dashed rounded-3xl text-center transition-all duration-300 ${
          isProcessing
            ? "border-blue-400 dark:border-blue-500 bg-blue-50 dark:bg-blue-500/5"
            : "border-gray-200 dark:border-gray-800"
        }`}
          style={{ padding: "clamp(16px,4vw,24px)" }}>

          <input
            type="file"
            multiple
            accept="image/*"
            disabled={isProcessing}
            className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
            onChange={e => e.target.files && uploadImages(e.target.files)}
          />

          {/* Drop zone content */}
          {!isProcessing ? (
            <div className="pointer-events-none">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center mx-auto mb-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                  stroke="#1A56DB" strokeWidth="2" strokeLinecap="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
              </div>
              <p className="text-sm font-bold text-gray-500 dark:text-white/40">
                Tap to add photos
              </p>
              <p className="text-[10px] text-gray-400 dark:text-white/25 mt-1">
                Auto-compressed · BuYzze watermark added
              </p>
            </div>
          ) : (
            /* Processing animation */
            <div className="pointer-events-none py-2">
              <div className="flex items-center justify-center gap-2 mb-2">
                {/* Animated dots */}
                {[0,1,2].map(i => (
                  <div key={i} className="w-2 h-2 rounded-full bg-blue-500"
                    style={{ animation: `bounce 1s ${i * 0.15}s ease-in-out infinite` }}/>
                ))}
              </div>
              <p className="text-sm font-black text-blue-600 dark:text-blue-400">
                {uploadStatusLabel()}
              </p>
              {uploadProgress.total > 1 && (
                <div className="mt-2 mx-auto max-w-[200px]">
                  <div className="w-full h-1.5 bg-blue-100 dark:bg-blue-500/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all duration-500"
                      style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          <style>{`
            @keyframes bounce {
              0%,100% { transform: translateY(0); }
              50%      { transform: translateY(-6px); }
            }
          `}</style>
        </div>

        {/* Image previews */}
        {form.images.length > 0 && (
          <div className="flex gap-3 mt-3 flex-wrap">
            {form.images.map((img, idx) => (
              <div key={img} className="relative group">
                {/* Preview */}
                <img
                  src={img}
                  alt={`photo-${idx + 1}`}
                  className="w-20 h-20 object-cover rounded-xl border-2 dark:border-gray-700 shadow-md"
                />
                {/* Watermark indicator badge */}
                <span className="absolute bottom-1 left-1 text-[7px] font-black px-1 py-0.5 rounded"
                  style={{ background: "rgba(10,10,20,0.62)", color: "rgba(255,255,255,0.88)" }}>
                  BuYzze
                </span>
                {/* Remove button */}
                <button
                  type="button"
                  onClick={() => setForm(p => ({ ...p, images: p.images.filter(i => i !== img) }))}
                  className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-700 text-white rounded-full w-6 h-6 text-xs shadow-lg transition-colors flex items-center justify-center"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Submit button (unchanged) ── */}
      <button
        disabled={saving || uploading}
        className="bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white py-5 rounded-[2rem] font-black uppercase tracking-widest active:scale-95 transition-all"
      >
        {saving ? "Saving..." : "Save Listing"}
      </button>

      <datalist id="brands">
        {Object.keys(PHONE_CATALOG).map(b => <option key={b} value={b} />)}
      </datalist>
    </form>
  );
}
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { ChevronRight, ArrowLeft, Search, MapPin, Check, Camera, Image as ImageIcon } from "lucide-react";

/* ─────────────────────────────────────────────────────────────
   ✅ TYPES (Saved with granular conditions)
───────────────────────────────────────────────────────────── */
type ProductFormData = {
  title: string; description: string; price: string;
  brand: string; model: string; ram: string;
  storage: string; color: string; condition: string;
  category: string; state: string; city: string;
  pincode: string; address: string; images: string[];
  
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
  state: "", city: "", pincode: "", address: "", images: [],
  cond_screen: "", cond_body: "", cond_cam: "", cond_func: "", cond_warr: "", cond_age: "",
};

const BRANDS = [
  { id: "Apple", name: "Apple", logo: "/logos/apple.svg", invertInDark: true },
  { id: "Samsung", name: "Samsung", logo: "/logos/samsung.svg", invertInDark: false },
  { id: "Google", name: "Google", logo: "/logos/google.svg", invertInDark: false },
  { id: "OnePlus", name: "OnePlus", logo: "/logos/OnePlus-Logo.wine.svg", invertInDark: false },
  { id: "Vivo", name: "Vivo", logo: "/logos/vivo.svg", invertInDark: false },
  
  // Niche ke teeno me maine invertInDark 'true' kiya hai taaki dark mode me invisible na hon
  { id: "Xiaomi", name: "Xiaomi", logo: "/logos/xiaomi.svg", invertInDark: true },
  { id: "Oppo", name: "Oppo", logo: "/logos/Oppo-Logo.wine.svg", invertInDark: true },
  
  // Is file ko apne folder me rename karke exactly 'motorola.svg' kar dena
  { id: "Motorola", name: "Motorola", logo: "/logos/motorola.svg", invertInDark: true },
];

/* ─────────────────────────────────────────────────────────────
   IMAGE COMPRESSION & WATERMARK
───────────────────────────────────────────────────────────── */
async function compressImage(file: File): Promise<File> {
  try {
    const imageCompression = (await import("browser-image-compression")).default;
    const compressed = await imageCompression(file, {
      maxSizeMB: 0.3, maxWidthOrHeight: 1080, useWebWorker: true,
      fileType: "image/webp", initialQuality: 0.78,
    });
    return new File([compressed], file.name.replace(/\.[^.]+$/, ".webp"), { type: "image/webp" });
  } catch (err) {
    return file; 
  }
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

  useEffect(() => {
    if (initialValues) {
      setForm((p) => ({ ...p, ...initialValues }));
    }
  }, [initialValues]);

  const update = (key: keyof ProductFormData, value: string) => setForm(p => ({ ...p, [key]: value }));

  // AUTO CONDITION ENGINE
  useEffect(() => {
    const { cond_screen, cond_body, cond_cam, cond_func, cond_warr, cond_age } = form;
    if (!cond_screen) return;
    
    let finalCondition = "Used-Superb";
    
    if (cond_screen === "Broken" || cond_body === "Damaged" || cond_cam === "Faulty" || cond_func === "Issues") {
      finalCondition = "Used-Fair";
    } else if (cond_screen === "Scratches" || cond_body === "Dents" || cond_warr === "Out of Warranty" || cond_age === "2+ years") {
      finalCondition = "Used-Good";
    }
    
    update("condition", finalCondition);
  }, [form.cond_screen, form.cond_body, form.cond_cam, form.cond_func, form.cond_warr, form.cond_age]);

  const handlePincode = async (val: string) => {
    const pin = val.replace(/[^0-9]/g, "").slice(0, 6);
    update("pincode", pin);
    if (pin.length === 6) {
      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
        const data = await res.json();
        if (data[0].Status === "Success") {
          update("city", data[0].PostOffice[0].District);
          update("state", data[0].PostOffice[0].State);
        }
      } catch { console.error("Pincode API Error"); }
    }
  };

  const uploadImages = async (files: FileList) => {
    setUploading(true);
    const fileArr = Array.from(files);

    try {
      const urls: string[] = [];
      for (let i = 0; i < fileArr.length; i++) {
        const file = fileArr[i];
        setUploadPhase("compressing");
        const compressed = await compressImage(file);
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
      }
      setUploadPhase("done");
      setForm(p => ({ ...p, images: [...p.images, ...urls] }));
      setTimeout(() => setUploadPhase("idle"), 1200);
    } catch (e: any) {
      alert("Upload failed: " + e.message);
      setUploadPhase("idle");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.title) {
      form.title = `${form.brand} ${form.model} - ${form.condition}`;
    }
    setSaving(true);
    try {
      await onSubmit(form);
      setShowSuccess(true);
      setTimeout(onComplete, 2500);
    } catch (e: any) { alert(e.message); }
    finally { setSaving(false); }
  };

  if (showSuccess) {
    return (
      <div className="fixed inset-0 z-50 bg-white dark:bg-[#0a0a0a] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-80 h-80 opacity-90">
          <DotLottieReact src="/success-list.lottie" autoplay />
        </div>
        <h2 className="text-3xl font-light tracking-wide text-neutral-900 dark:text-white mt-8">Listing Published</h2>
        <p className="text-sm font-light text-neutral-500 mt-2 tracking-widest uppercase">Your device is now live on the marketplace</p>
      </div>
    );
  }

  // ✅ Graded Helper for Condition Chips (Premium UI)
  const ConditionBlock = ({ label, propKey, options }: { label: string, propKey: keyof ProductFormData, options: string[] }) => (
    <div className="mb-10 lg:mb-12">
      <h4 className="text-sm font-medium tracking-wide text-neutral-400 dark:text-neutral-500 mb-4 lg:mb-5">{label}</h4>
      <div className="flex flex-wrap gap-3 lg:gap-4">
        {options.map((opt: string) => {
          const isSelected = form[propKey] === opt;
          return (
            <button
              key={opt}
              onClick={() => update(propKey, opt)}
              className={`px-6 lg:px-8 py-3 lg:py-4 rounded-full text-sm font-medium transition-all duration-300 border ${
                isSelected 
                  ? "bg-neutral-900 border-neutral-900 text-white dark:bg-white dark:border-white dark:text-neutral-900 shadow-xl" 
                  : "bg-transparent border-neutral-200 text-neutral-600 hover:border-neutral-400 dark:border-neutral-800 dark:text-neutral-400 dark:hover:border-neutral-600"
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );

  const activeBrandData = BRANDS.find(b => b.id === form.brand);

  return (
    <div className="w-full max-w-[90rem] mx-auto flex flex-col md:flex-row bg-white dark:bg-[#0a0a0a] rounded-3xl md:border dark:border-neutral-800/60 shadow-[0_8px_40px_rgb(0,0,0,0.04)] dark:shadow-none overflow-hidden min-h-[75vh] md:m-4">
      
      {/* 🛠️ WIDER PC SIDEBAR */}
      <div className="hidden md:flex md:w-[40%] bg-neutral-50/50 dark:bg-[#111111] border-r border-neutral-200/60 dark:border-neutral-800/60 p-12 flex-col justify-between">
        <div>
          <h2 className="text-3xl font-light tracking-wide text-neutral-900 dark:text-white mb-3">Post Your Device Ad</h2>
          <p className="text-sm font-light text-neutral-500 tracking-wide leading-relaxed max-w-sm">Sell faster by providing precise specifications and authentic device condition.</p>
          
          <div className="mt-20 space-y-12">
            {[
              { num: 1, title: "Identity", desc: "Select Brand & Specifications" },
              { num: 2, title: "Diagnostics", desc: "Audit Hardware & Condition" },
              { num: 3, title: "Valuation", desc: "Set Price, Photos & Location" }
            ].map((s) => (
              <div key={s.num} className={`flex items-start gap-5 transition-all duration-500 ${step >= s.num ? "opacity-100" : "opacity-30"}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-medium border-2 transition-colors ${step === s.num ? "bg-neutral-900 border-neutral-900 text-white dark:bg-white dark:border-white dark:text-neutral-900" : "border-neutral-300 dark:border-neutral-700 text-neutral-500"}`}>
                  {step > s.num ? <Check size={16} /> : s.num}
                </div>
                <div>
                  <h4 className={`text-lg tracking-wide ${step === s.num ? "font-medium text-neutral-900 dark:text-white" : "font-light text-neutral-500"}`}>{s.title}</h4>
                  <p className="text-xs font-light text-neutral-400 mt-1.5 tracking-wide leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="text-[11px] uppercase tracking-widest text-neutral-400 font-light border-t border-neutral-100 dark:border-neutral-800/60 pt-6">
          Secured by BuYzze Enterprise Index
        </div>
      </div>

      {/* 📱 MOBILE NAVIGATION BAR */}
      <div className="md:hidden px-6 py-5 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between bg-white dark:bg-[#0a0a0a] sticky top-0 z-20">
        <div className="flex items-center gap-3">
          {step > 1 && (
            <button onClick={() => setStep(step - 1)} className="p-2 text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors">
              <ArrowLeft size={20} strokeWidth={1.5} />
            </button>
          )}
          <span className="text-sm font-medium tracking-wider uppercase text-neutral-900 dark:text-white">
            {step === 1 ? "Identity" : step === 2 ? "Diagnostics" : "Valuation"}
          </span>
        </div>
        <div className="text-xs font-medium text-neutral-400 tracking-widest">{step} / 3</div>
      </div>

      {/* 🚀 MAIN CONTENT AREA */}
      <div className="flex-1 p-6 md:p-16 overflow-y-auto relative bg-white dark:bg-[#0a0a0a]">
        
        {/* ── STEP 1: BRAND & MODEL ── */}
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
            {!form.brand ? (
              <>
                <h3 className="text-4xl font-light tracking-wide text-neutral-900 dark:text-white mb-10">Select Manufacturer</h3>
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {BRANDS.map(b => (
                    <button 
                      key={b.id} 
                      onClick={() => update("brand", b.id)} 
                      className="aspect-square bg-neutral-50/50 dark:bg-[#111111] border border-neutral-200/60 dark:border-neutral-800 rounded-3xl p-8 xl:p-10 flex flex-col items-center justify-center gap-5 hover:border-neutral-400 dark:hover:border-neutral-500 transition-all duration-300 group shadow-sm"
                    >
                      <img 
                        src={b.logo} 
                        alt={b.name} 
                        className={`h-24 xl:h-28 object-contain opacity-80 group-hover:opacity-100 transition-opacity duration-300 ${b.invertInDark ? 'dark:invert' : ''}`} 
                        onError={(e) => { (e.target as HTMLElement).style.display = 'none'; e.currentTarget.parentElement!.innerHTML = `<span class="text-3xl font-light text-neutral-400">${b.name}</span>`; }} 
                      />
                      <span className="text-xs font-medium tracking-wide text-neutral-600 dark:text-neutral-400 opacity-60 group-hover:opacity-100 transition-opacity">{b.name}</span>
                    </button>
                  ))}
                  <button 
                    onClick={() => { const b = prompt("Enter Brand Name"); if (b) update("brand", b); }} 
                    className="aspect-square bg-transparent border border-dashed border-neutral-300 dark:border-neutral-700 rounded-3xl p-8 flex flex-col items-center justify-center gap-2 hover:border-neutral-900 dark:hover:border-white transition-all text-neutral-400"
                  >
                    <span className="text-sm font-light tracking-wide">Other Brand</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="max-w-2xl mx-auto mt-4 animate-in fade-in duration-500">
                
                {/* Brand Header */}
                <div className="flex items-center justify-between pb-8 mb-10 border-b border-neutral-100 dark:border-neutral-800">
                  <div className="flex items-center gap-6">
                     <div className="w-20 h-20 bg-neutral-50 dark:bg-[#111111] border border-neutral-200/50 dark:border-neutral-800 rounded-2xl flex items-center justify-center shadow-sm">
                        {activeBrandData?.logo ? (
                          <img src={activeBrandData.logo} className={`h-10 object-contain ${activeBrandData.invertInDark ? 'dark:invert' : ''}`} alt={form.brand} />
                        ) : (
                          <span className="text-xl font-light">{form.brand[0]}</span>
                        )}
                     </div>
                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-widest text-neutral-400 mb-1">Manufacturer</p>
                      <p className="text-3xl font-light tracking-wide dark:text-white">{form.brand}</p>
                    </div>
                  </div>
                  <button onClick={() => update("brand", "")} className="text-xs font-medium uppercase tracking-widest text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">Change</button>
                </div>

                {/* Minimalist Inputs */}
                <div className="space-y-10">
                  <div>
                    <label className="text-xs font-medium tracking-wide text-neutral-400 uppercase mb-4 block">Device Model</label>
                    <div className="relative">
                      <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-neutral-400" size={24} strokeWidth={1.5} />
                      <input 
                        type="text" value={form.model} onChange={(e) => update("model", e.target.value)}
                        placeholder="e.g. iPhone 15 Pro Max, Galaxy S24 Ultra"
                        className="w-full bg-transparent border-b-2 border-neutral-200 dark:border-neutral-800 focus:border-neutral-900 dark:focus:border-white py-5 pl-12 pr-4 text-2xl font-light tracking-wide text-neutral-900 dark:text-white outline-none transition-all placeholder:text-neutral-300 dark:placeholder:text-neutral-700"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-10">
                    <div>
                      <label className="text-xs font-medium tracking-wide text-neutral-400 uppercase mb-4 block">Memory (RAM)</label>
                      <select value={form.ram} onChange={(e) => update("ram", e.target.value)} className="w-full bg-neutral-50 dark:bg-[#111111] border border-neutral-200/60 dark:border-neutral-800 rounded-2xl p-5 text-lg font-light tracking-wide outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-white appearance-none dark:text-white cursor-pointer transition-all">
                        <option value="">Select RAM</option>
                        {["4GB","6GB","8GB","12GB","16GB"].map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium tracking-wide text-neutral-400 uppercase mb-4 block">Storage Capacity</label>
                      <select value={form.storage} onChange={(e) => update("storage", e.target.value)} className="w-full bg-neutral-50 dark:bg-[#111111] border border-neutral-200/60 dark:border-neutral-800 rounded-2xl p-5 text-lg font-light tracking-wide outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-white appearance-none dark:text-white cursor-pointer transition-all">
                        <option value="">Select Capacity</option>
                        {["64GB","128GB","256GB","512GB","1TB"].map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>

                  <button 
                    disabled={!form.model || !form.storage} 
                    onClick={() => setStep(2)}
                    className="w-full mt-12 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-medium tracking-widest uppercase py-6 rounded-full disabled:opacity-30 active:scale-[0.99] transition-all flex items-center justify-center gap-3 hover:shadow-2xl"
                  >
                    Proceed to Diagnostics <ChevronRight size={18} strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── STEP 2: CONDITION AUDIT ── */}
        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 max-w-2xl mx-auto pb-10">
            <h3 className="text-4xl font-light tracking-wide text-neutral-900 dark:text-white mb-10 lg:mb-12">Hardware Diagnostics</h3>
            
            <ConditionBlock label="Display Panel / Glass Cover" propKey="cond_screen" options={["Flawless", "Scratches", "Broken"]} />
            <ConditionBlock label="Chassis / Frame Body" propKey="cond_body" options={["Flawless", "Dents", "Damaged"]} />
            <ConditionBlock label="Camera Module & System" propKey="cond_cam" options={["Perfect", "Faulty"]} />
            <ConditionBlock label="Hardware Functionality" propKey="cond_func" options={["All Working", "Issues"]} />
            <ConditionBlock label="Warranty Coverage" propKey="cond_warr" options={["Under Warranty", "Out of Warranty"]} />
            <ConditionBlock label="Device Age Profile" propKey="cond_age" options={["0-6 months", "6-12 months", "1-2 years", "2+ years"]} />

            {/* Calculated Grade Card */}
            {form.cond_screen && form.cond_body && form.cond_cam && form.cond_func && (
               <div className="mt-12 lg:mt-16 p-8 lg:p-10 bg-neutral-50 dark:bg-[#111111] border border-neutral-200/60 dark:border-neutral-800 rounded-3xl flex items-center justify-between">
                 <div>
                   <p className="text-xs font-medium uppercase tracking-widest text-neutral-400 mb-2">Assigned Grade</p>
                   <p className="text-3xl font-light tracking-wide text-neutral-900 dark:text-white">
                     {form.condition.replace("Used-", "")} Grade
                   </p>
                 </div>
                 <div className="w-16 h-16 rounded-full border-2 border-neutral-200 dark:border-neutral-700 flex items-center justify-center text-neutral-900 dark:text-white">
                    <Check size={28} strokeWidth={1.5} />
                 </div>
               </div>
            )}

            <button 
              disabled={!form.cond_screen || !form.cond_body || !form.cond_cam || !form.cond_func || !form.cond_warr || !form.cond_age}
              onClick={() => setStep(3)}
              className="w-full mt-12 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-medium tracking-widest uppercase py-6 rounded-full disabled:opacity-30 active:scale-[0.99] transition-all flex items-center justify-center gap-3 hover:shadow-2xl"
            >
              Continue to Valuation <ChevronRight size={18} strokeWidth={1.5} />
            </button>
          </div>
        )}

        {/* ── STEP 3: PRICE, PHOTOS & LOCATION ── */}
        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 max-w-2xl mx-auto pb-10 relative">
            <h3 className="text-4xl font-light tracking-wide text-neutral-900 dark:text-white mb-10 lg:mb-12">Asset Valuation</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-12 mb-10 lg:mb-12">
              <div>
                <label className="text-xs font-medium tracking-wide text-neutral-400 uppercase mb-4 block">Expected Disbursal Amount</label>
                <div className="relative">
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 text-neutral-400 text-xl font-light">₹</span>
                  <input type="number" value={form.price} onChange={e => update("price", e.target.value)} placeholder="0" className="w-full bg-transparent border-b-2 border-neutral-200 dark:border-neutral-800 focus:border-neutral-900 dark:focus:border-white py-5 pl-8 pr-4 text-3xl font-light tracking-wide text-neutral-900 dark:text-white outline-none transition-all placeholder:text-neutral-300 dark:placeholder:text-neutral-700" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium tracking-wide text-neutral-400 uppercase mb-4 block">Device Color Profile</label>
                <input type="text" value={form.color} onChange={e => update("color", e.target.value)} placeholder="e.g. Midnight Black, Titanium" className="w-full bg-transparent border-b-2 border-neutral-200 dark:border-neutral-800 focus:border-neutral-900 dark:focus:border-white py-5 text-xl font-light tracking-wide text-neutral-900 dark:text-white outline-none transition-all placeholder:text-neutral-300 dark:placeholder:text-neutral-700" />
              </div>
            </div>

            <div className="mb-10 lg:mb-12">
              <label className="text-xs font-medium tracking-wide text-neutral-400 uppercase mb-5 flex items-center gap-2"><MapPin size={16} strokeWidth={1.5}/> Servicing Coordinates (Pickup)</label>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <input type="text" value={form.pincode} onChange={e => handlePincode(e.target.value)} maxLength={6} placeholder="Pincode" className="w-full bg-neutral-50 dark:bg-[#111111] border border-neutral-200/60 dark:border-neutral-800 rounded-2xl p-4 lg:p-5 text-sm font-light tracking-wide dark:text-white outline-none focus:border-neutral-400 transition-all text-center" />
                <input type="text" value={form.city} readOnly placeholder="City" className="w-full bg-transparent border border-neutral-200/40 dark:border-neutral-800/40 rounded-2xl p-4 lg:p-5 text-sm font-light tracking-wide text-neutral-400 text-center outline-none" />
                <input type="text" value={form.state} readOnly placeholder="State" className="w-full bg-transparent border border-neutral-200/40 dark:border-neutral-800/40 rounded-2xl p-4 lg:p-5 text-sm font-light tracking-wide text-neutral-400 text-center outline-none" />
              </div>
              <input type="text" value={form.address} onChange={e => update("address", e.target.value)} placeholder="House No., Building, Street Name (Full pickup address)" className="w-full bg-neutral-50 dark:bg-[#111111] border border-neutral-200/60 dark:border-neutral-800 rounded-2xl p-5 text-base font-light tracking-wide dark:text-white outline-none focus:border-neutral-400 transition-all" />
            </div>

            <div className="mb-10 lg:mb-12">
              <label className="text-xs font-medium tracking-wide text-neutral-400 uppercase mb-4 block">Additional Inventory Notes (Optional)</label>
              <textarea value={form.description} onChange={e => update("description", e.target.value)} placeholder="Include details about battery health (if possible), inbox accessories (bill/box), etc." className="w-full bg-neutral-50 dark:bg-[#111111] border border-neutral-200/60 dark:border-neutral-800 rounded-2xl p-6 text-base font-light tracking-wide dark:text-white outline-none focus:border-neutral-400 transition-all resize-none min-h-[140px]" />
            </div>

            <div className="mb-14">
              <div className="flex items-center justify-between mb-5">
                <label className="text-xs font-medium tracking-wide text-neutral-400 uppercase">Authentic Device Media</label>
                {uploadPhase !== "idle" && (
                  <span className="text-[10px] font-medium tracking-widest uppercase px-3 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 animate-pulse">Processing media...</span>
                )}
              </div>
              
              <div className="relative border border-dashed border-neutral-300 dark:border-neutral-700 rounded-3xl p-12 lg:p-14 text-center hover:bg-neutral-50 dark:hover:bg-[#111111] transition-all overflow-hidden group">
                <input type="file" multiple accept="image/*" disabled={uploading} className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed z-10" onChange={e => e.target.files && uploadImages(e.target.files)} />
                <div className="pointer-events-none flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-500 group-hover:scale-110 transition-transform">
                     <Camera size={24} strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-lg font-light tracking-wide text-neutral-900 dark:text-white">Upload Device Imagery</p>
                    <p className="text-[13px] font-light text-neutral-400 mt-1.5 tracking-wide leading-relaxed">High-resolution images directly impact listing visibility and disbursal offers.</p>
                  </div>
                </div>
              </div>

              {form.images.length > 0 && (
                <div className="flex gap-4 mt-8 flex-wrap">
                  {form.images.map((img) => (
                    <div key={img} className="relative group w-28 h-28 lg:w-32 lg:h-32">
                      <img src={img} className="w-full h-full object-cover rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm" alt="Preview" />
                      <button onClick={() => setForm(p => ({ ...p, images: p.images.filter(i => i !== img) }))} className="absolute -top-3 -right-3 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-full w-7 h-7 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-lg border border-neutral-200/50 dark:border-neutral-700/50">
                        <span className="text-base mt-[-3px]">×</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button 
              disabled={saving || uploading || !form.price || !form.pincode}
              onClick={handleSubmit}
              className="w-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-medium tracking-widest uppercase py-6 rounded-full disabled:opacity-30 active:scale-[0.99] transition-all shadow-xl hover:shadow-2xl"
            >
              {saving ? "Publishing Ad..." : "Publish Asset"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
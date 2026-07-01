"use client";
import { useEffect, useState, useRef, useMemo, useCallback, memo } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useLocation } from "@/features/location/context/LocationContext";
import dynamic from "next/dynamic";
import HeroSlider from "./components/HeroSlider";
import BrandFilter from "./components/BrandFilter";
import ListingArea from "./components/ListingArea";
import FloatingNav from "@/components/FloatingNav";
import FavoriteButton from "@/components/FavoriteButton";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import {
  ChevronLeft, ChevronRight, MapPin,
  Zap, ArrowRight, Clock, Sparkles
} from "lucide-react";

// ✅ SPEED FIX: Dynamic imports for heavy components
const AIVideoSlider = dynamic(() => import("@/components/AIVideoSlider"), { ssr: false });
const BuyzzeChat = dynamic(() => import("@/components/BuyzzeChat"), { ssr: false });

const FONT = "'DM Sans', 'Outfit', system-ui, sans-serif";
const NO_SCROLL = { scrollbarWidth: "none" as const, msOverflowStyle: "none" as const };

const ALL_BRANDS = [
  { name: "Apple",    img: "/brand-apple.webp"    },
  { name: "Samsung",  img: "/brand-samsung.webp"  },
  { name: "OnePlus",  img: "/brand-oneplus.webp"  },
  { name: "Xiaomi",   img: "/brand-xiaomi.webp"   },
  { name: "Vivo",     img: "/brand-vivo.webp"     },
  { name: "Oppo",     img: "/brand-oppo.webp"     },
  { name: "Realme",   img: "/brand-realme.webp"   },
  { name: "Google",   img: "/brand-google.webp"   },
  { name: "Motorola", img: "/brand-motorola.webp" },
  { name: "Nothing",  img: "/brand-nothing.webp"  },
];

const TOP_BRANDS = [
  {
    name: "Apple", img: "/brand-apple.webp",
    headerBg: "linear-gradient(135deg, #c2410c 0%, #ea580c 100%)",
    lCardBg: "#fff7ed", lBorder: "#fed7aa", lAccent: "#c2410c", lTagBg: "#ffedd5", lTagColor: "#c2410c",
    dCardBg: "#0f0a05", dBorder: "#431407", dAccent: "#fb923c", dTagBg: "#1c0f06", dTagColor: "#fb923c",
  },
  {
    name: "Samsung", img: "/brand-samsung.webp",
    headerBg: "linear-gradient(135deg, #a16207 0%, #ca8a04 100%)",
    lCardBg: "#fffbeb", lBorder: "#fde68a", lAccent: "#92400e", lTagBg: "#fef3c7", lTagColor: "#92400e",
    dCardBg: "#0f0d04", dBorder: "#422006", dAccent: "#fbbf24", dTagBg: "#1a1200", dTagColor: "#fbbf24",
  },
  {
    name: "Xiaomi", img: "/brand-xiaomi.webp",
    headerBg: "linear-gradient(135deg, #0369a1 0%, #0ea5e9 100%)",
    lCardBg: "#f0f9ff", lBorder: "#bae6fd", lAccent: "#0369a1", lTagBg: "#e0f2fe", lTagColor: "#0369a1",
    dCardBg: "#040d14", dBorder: "#082f49", dAccent: "#38bdf8", dTagBg: "#071520", dTagColor: "#38bdf8",
  },
  {
    name: "Google", img: "/brand-google.webp",
    headerBg: "linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)",
    lCardBg: "#edf4ff", lBorder: "#c4d8fa", lAccent: "#1a56db", lTagBg: "#dbeafe", lTagColor: "#1a56db",
    dCardBg: "#050a14", dBorder: "#1e3a5f", dAccent: "#60a5fa", dTagBg: "#070f1a", dTagColor: "#60a5fa",
  },
];

function useIsDark() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return false;
  return resolvedTheme === "dark";
}

// ✅ SPEED FIX: real viewport-based lazy loading using the native IntersectionObserver.
// Once a section has entered view it stays "in view" (no unmount/remount, no layout thrash).
// rootMargin pre-loads content slightly before it's visible so there's no visible pop-in.
function useInView<T extends HTMLElement>(rootMargin: string = "300px 0px") {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || inView) return;

    // Fallback for environments without IntersectionObserver support
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin, threshold: 0.01 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [inView, rootMargin]);

  return { ref, inView };
}

function useBrandTokens(brand: typeof TOP_BRANDS[0]) {
  const isDark = useIsDark();
  return {
    cardBg:   isDark ? brand.dCardBg   : brand.lCardBg,
    border:   isDark ? brand.dBorder   : brand.lBorder,
    accent:   isDark ? brand.dAccent   : brand.lAccent,
    tagBg:    isDark ? brand.dTagBg    : brand.lTagBg,
    tagColor: isDark ? brand.dTagColor : brand.lTagColor,
  };
}

const RecentCard = memo(function RecentCard({ p }: { p: any }) {
  const date = new Date(p.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
  return (
    <Link
      href={`/products/${p.id}`}
      className="flex-shrink-0 rounded-2xl overflow-hidden relative group transition-all duration-300 hover:-translate-y-1"
      style={{
        width: 152,
        minHeight: 230,
        display: "flex",
        flexDirection: "column",
        background: "var(--rc-card)",
        border: "var(--rc-border)",
        boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
      }}
    >
      {p.status && p.status !== 'active' && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 30,
          background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(2px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderRadius: 16, pointerEvents: 'none'
        }}>
          <span style={{
            background: p.status === 'sold' ? '#ef4444' : '#6b7280',
            color: 'white', padding: '4px 12px', borderRadius: 8,
            fontSize: 12, fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)', transform: 'rotate(-10deg)'
          }}>
            {p.status === 'sold' ? 'Sold Out' : 'Expired'}
          </span>
        </div>
      )}

      <FavoriteButton productId={p.id} size="sm" />
      <div className="flex items-center justify-center overflow-hidden flex-shrink-0"
        style={{ height: 112, background: "var(--rc-img)" }}>
        <Image src={p.images?.[0] || "/placeholder.png"} alt={p.title || "Used Mobile"} width={100} height={100}
          sizes="(max-width: 768px) 100px, 100px" loading="lazy" decoding="async"
          className="object-contain p-2 group-hover:scale-110 transition-transform duration-500" />
      </div>
      <div className="p-3 flex flex-col flex-1">
        <p className="text-[9px] font-black uppercase tracking-[0.15em] truncate mb-1"
          style={{ color: "var(--rc-brand)" }}>{p.brand}</p>
        <h4 className="text-[11.5px] font-semibold line-clamp-2 leading-snug mb-2 flex-1"
          style={{ color: "var(--rc-title)" }}>{p.title}</h4>
        <p className="text-[15px] font-black"
          style={{ color: "var(--rc-price)" }}>
          ₹{p.price?.toLocaleString("en-IN")}
        </p>
        <div className="flex items-center gap-1 mt-1.5">
          <MapPin size={8} style={{ color: "var(--rc-meta)" }} />
          <span className="text-[9px] truncate" style={{ color: "var(--rc-meta)" }}>
            {p.city} · {date}
          </span>
        </div>
      </div>
    </Link>
  );
});

// ✅ SPEED FIX: hoisted so the string isn't rebuilt on every render
const RECENTLY_STYLES = `
        :root {
          --rc-card: #ffffff;
          --rc-border: 1px solid rgba(0,0,0,0.07);
          --rc-img: #f3f4f6;
          --rc-brand: #2563eb;
          --rc-title: #1f2937;
          --rc-price: #111827;
          --rc-meta: #9ca3af;
        }
        .dark {
          --rc-card: #1e2a45;
          --rc-border: 1px solid rgba(255,255,255,0.08);
          --rc-img: #162032;
          --rc-brand: #60a5fa;
          --rc-title: #f1f5f9;
          --rc-price: #ffffff;
          --rc-meta: #64748b;
        }
        .recently-section-inner {
          background: linear-gradient(135deg, #fce4ec 0%, #f3e5f5 45%, #e8eaf6 100%);
          border: 1px solid rgba(219,39,119,0.1);
          box-shadow: 0 8px 32px rgba(233,30,99,0.07);
        }
        .dark .recently-section-inner {
          background: linear-gradient(135deg, #1a1025 0%, #0f172a 50%, #161c2e 100%);
          border: 1px solid rgba(139,92,246,0.12);
          box-shadow: 0 8px 32px rgba(0,0,0,0.4);
        }
        .dark .recently-title { color: #f1f5f9 !important; }
        .dark .recently-count { color: rgba(255,255,255,0.35) !important; }
        .dark .recently-viewall { color: #a78bfa !important; }
        .dark .recently-badge {
          background: linear-gradient(135deg,#7c3aed,#4f46e5) !important;
        }
        .dark .recently-btn {
          background: rgba(255,255,255,0.1) !important;
          border: 1px solid rgba(255,255,255,0.12) !important;
        }
        .dark .recently-skeleton {
          background: rgba(255,255,255,0.06) !important;
          border: 1px solid rgba(255,255,255,0.08) !important;
        }
      `;

const RecentlyAddedSection = memo(function RecentlyAddedSection({ products, loading }: { products: any[]; loading: boolean }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scroll = useCallback((d: "l" | "r") =>
    scrollRef.current?.scrollBy({ left: d === "r" ? 200 : -200, behavior: "smooth" }), []);
  // ✅ SPEED FIX: only recompute the filtered/sliced list when products actually change
  const recent = useMemo(() => {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return products.filter(p => new Date(p.created_at) >= sevenDaysAgo).slice(0, 10);
  }, [products]);

  return (
    <section className="max-w-7xl mx-auto px-4 mt-6">
      <style>{RECENTLY_STYLES}</style>
      <div
        className="recently-section-inner rounded-2xl px-5 pt-5 pb-5 overflow-hidden"
        style={{ position: "relative" }}
      >
        <div className="flex items-center justify-between mb-5" style={{ position: "relative", zIndex: 1 }}>
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full recently-badge"
              style={{ background: "linear-gradient(135deg,#ec4899,#a855f7)", color: "#fff" }}>
              <Clock size={9} /><span>Last 7 Days</span>
            </div>
            <h2 className="recently-title text-[15px] font-bold" style={{ color: "#1f2937" }}>Recently Added</h2>
            {!loading && <span className="recently-count text-[11px]" style={{ color: "rgba(0,0,0,0.35)" }}>({recent.length})</span>}
          </div>
          <div className="flex items-center gap-2">
            <Link href="/recently-added"
              className="text-[11px] font-bold hover:opacity-80 flex items-center gap-0.5 transition-opacity recently-viewall"
              style={{ color: "#be185d" }}>
              View all <ArrowRight size={11} />
            </Link>
            <div className="flex gap-1">
              <button onClick={() => scroll("l")} aria-label="Scroll left"
                className="w-7 h-7 rounded-full flex items-center justify-center transition-colors recently-btn"
                style={{ background: "rgba(0,0,0,0.07)", border: "1px solid rgba(0,0,0,0.09)" }}>
                <ChevronLeft size={12} style={{ color: "rgba(0,0,0,0.5)" }} />
              </button>
              <button onClick={() => scroll("r")} aria-label="Scroll right"
                className="w-7 h-7 rounded-full flex items-center justify-center transition-colors recently-btn"
                style={{ background: "rgba(0,0,0,0.07)", border: "1px solid rgba(0,0,0,0.09)" }}>
                <ChevronRight size={12} style={{ color: "rgba(0,0,0,0.5)" }} />
              </button>
            </div>
          </div>
        </div>

        <div ref={scrollRef} className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide"
          style={{ ...NO_SCROLL, position: "relative", zIndex: 1 }}>
          {loading
            ? [...Array(6)].map((_, i) => (
                <div key={i} className="flex-shrink-0 w-[152px] h-[230px] rounded-2xl animate-pulse recently-skeleton"
                  style={{ background: "rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.05)" }} />
              ))
            : recent.length === 0
            ? <div className="w-full py-12 text-center">
                <p className="text-[13px]" style={{ color: "rgba(0,0,0,0.4)" }}>No products added in last 7 days</p>
              </div>
            : recent.map(p => <RecentCard key={p.id} p={p} />)
          }
        </div>
      </div>
    </section>
  );
});

const CONDITION_CARDS = [
  { value: "used-superb", label: "Used — Superb", badge: "Best Quality", image: "/condition-superb.png", bg: "#f0fdf4", darkBg: "#0a1f10" },
  { value: "used-good",   label: "Used — Good",   badge: "Good Value",   image: "/condition-good.png",   bg: "#eff6ff", darkBg: "#070f1a" },
  { value: "used-fair",   label: "Used — Fair",   badge: "Best Price",   image: "/condition-fair.png",   bg: "#fff7ed", darkBg: "#1a0f05" },
];

const ConditionSection = memo(function ConditionSection() {
  const isDark = useIsDark();
  return (
    <section className="max-w-7xl mx-auto px-4 mt-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[15px] font-bold text-gray-900 dark:text-white">Shop by Condition</h2>
        <Link href="/condition" className="text-[11px] font-bold text-blue-600 dark:text-blue-400 flex items-center gap-0.5 hover:opacity-80 transition-opacity">
          View all <ChevronRight size={11} />
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {CONDITION_CARDS.map((c) => (
          <Link key={c.value} href={`/search?q=&condition=${c.value}`}
            className="flex items-stretch rounded-2xl overflow-hidden active:scale-[0.99] transition-transform"
            style={{
              background: isDark ? c.darkBg : c.bg,
              border: `1.5px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)"}`,
              boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
              textDecoration: "none", minHeight: 130,
            }}>
            <div style={{ flex: 1, padding: "20px 0 20px 20px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <span style={{
                  fontSize: 9, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase",
                  color: isDark ? "rgba(255,255,255,0.4)" : "#9ca3af",
                  background: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.05)",
                  borderRadius: 6, padding: "2px 7px", display: "inline-block", marginBottom: 8,
                }}>{c.badge}</span>
                <p style={{ fontSize: 12, fontWeight: 500, color: isDark ? "rgba(255,255,255,0.4)" : "#6b7280", margin: "0 0 3px" }}>Best Selling</p>
                <p style={{ fontSize: 20, fontWeight: 900, lineHeight: 1.15, color: isDark ? "#f8fafc" : "#111827", margin: 0, letterSpacing: "-0.4px" }}>{c.label}</p>
              </div>
              <div style={{
                width: 38, height: 38, borderRadius: "50%", marginTop: 14,
                background: isDark ? "rgba(255,255,255,0.12)" : "#111827",
                display: "flex", alignItems: "center", justifyContent: "center", // FIXED: justify-content -> justifyContent
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </div>
            </div>
            <div style={{ width: "48%", flexShrink: 0, position: "relative", overflow: "hidden" }}>
              <Image
                src={c.image}
                alt={c.label}
                fill
                sizes="(max-width: 768px) 50vw, 33vw"
                style={{ objectFit: "contain", objectPosition: "center bottom" }}
              />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
});

const BrandProductCard = memo(function BrandProductCard({ p, brand }: { p: any; brand: typeof TOP_BRANDS[0] }) {
  const t = useBrandTokens(brand);
  return (
    <Link href={`/products/${p.id}`}
      className="flex flex-col rounded-xl border overflow-hidden hover:scale-[1.02] hover:shadow-md transition-all duration-200 group relative"
      style={{ borderColor: t.border, backgroundColor: t.tagBg }}
    >
      {p.status && p.status !== 'active' && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 30,
          background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(2px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderRadius: 12, pointerEvents: 'none'
        }}>
          <span style={{
            background: p.status === 'sold' ? '#ef4444' : '#6b7280',
            color: 'white', padding: '4px 10px', borderRadius: 6,
            fontSize: 10, fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)', transform: 'rotate(-10deg)'
          }}>
            {p.status === 'sold' ? 'Sold' : 'Expired'}
          </span>
        </div>
      )}

      <div className="w-full h-[110px] flex items-center justify-center overflow-hidden" style={{ backgroundColor: t.tagBg }}>
        <Image src={p.images?.[0] || "/placeholder.png"} alt={p.title || "Brand Product"} width={90} height={90}
          sizes="(max-width: 768px) 90px, 90px" loading="lazy" decoding="async"
          className="object-contain p-2 group-hover:scale-110 transition-transform duration-300" />
      </div>
      <div className="p-2.5 flex flex-col flex-1" style={{ backgroundColor: t.cardBg }}>
        <h4 className="text-[11px] font-semibold line-clamp-2 leading-snug mb-1.5 flex-1" style={{ color: t.tagColor }}>{p.title}</h4>
        {(p.ram || p.storage) && (
          <div className="flex gap-1 flex-wrap mb-1.5">
            {p.ram && <span className="text-[8.5px] font-bold px-1.5 py-0.5 rounded-md border" style={{ borderColor: t.border, color: t.accent, backgroundColor: t.tagBg }}>{p.ram}</span>}
            {p.storage && <span className="text-[8.5px] font-bold px-1.5 py-0.5 rounded-md border" style={{ borderColor: t.border, color: t.accent, backgroundColor: t.tagBg }}>{p.storage}</span>}
          </div>
        )}
        <p className="text-[14px] font-black leading-none" style={{ color: t.accent }}>₹{p.price?.toLocaleString("en-IN")}</p>
        {p.city && (
          <div className="flex items-center gap-0.5 mt-1.5">
            <MapPin size={8} className="flex-shrink-0" style={{ color: t.accent + "80" }} />
            <span className="text-[8.5px] truncate" style={{ color: t.accent + "80" }}>{p.city}</span>
          </div>
        )}
      </div>
    </Link>
  );
});

const BrandPanel = memo(function BrandPanel({ brand, brandProducts, loading }: { brand: typeof TOP_BRANDS[0]; brandProducts: Record<string, any[]>; loading: boolean }) {
  const t = useBrandTokens(brand);
  const products = (brandProducts[brand.name] || []).slice(0, 4);
  return (
    <div className="tb-panel snap-start flex-shrink-0 rounded-2xl overflow-hidden border flex flex-col shadow-sm dark:shadow-none"
      style={{ width: "min(85vw, 380px)", borderColor: t.border, backgroundColor: t.cardBg }}
    >
      <div className="px-4 py-3.5 flex items-center justify-between" style={{ background: brand.headerBg }}>
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-black/20 border border-white/25 flex items-center justify-center overflow-hidden flex-shrink-0">
            <Image src={brand.img} alt={brand.name} width={30} height={30} loading="lazy" className="object-contain p-0.5" />
          </div>
          <div>
            <p className="text-white font-black text-[16px] leading-none">{brand.name}</p>
            <p className="text-white/60 text-[10px] mt-0.5">{loading ? "Loading…" : `${(brandProducts[brand.name] || []).length} listings`}</p>
          </div>
        </div>
        <Link href={`/search?q=${brand.name}`}
          className="flex items-center gap-1 text-[10px] font-bold bg-black/20 hover:bg-black/30 text-white px-2.5 py-1.5 rounded-lg border border-white/20 transition-colors">
          All <ChevronRight size={10} />
        </Link>
      </div>
      <div className="p-3 grid grid-cols-2 gap-2.5">
        {loading
          ? [...Array(4)].map((_, i) => <div key={i} className="h-[88px] rounded-xl animate-pulse" style={{ backgroundColor: t.tagBg }} />)
          : products.length === 0
          ? <div className="col-span-2 py-8 text-center"><p className="text-gray-400 dark:text-white/25 text-[12px]">No listings available</p></div>
          : products.map(p => <BrandProductCard key={p.id} p={p} brand={brand} />)
        }
      </div>
      {!loading && (brandProducts[brand.name] || []).length > 4 && (
        <div className="px-3 pb-3">
          <Link href={`/search?q=${brand.name}`}
            className="flex items-center justify-center gap-1 w-full py-2 rounded-xl border text-[11px] font-bold transition-colors hover:opacity-80"
            style={{ borderColor: t.border, color: t.accent, backgroundColor: t.tagBg }}>
            {(brandProducts[brand.name] || []).length - 4} more listings <ChevronRight size={11} />
          </Link>
        </div>
      )}
    </div>
  );
});

const TopBrandsSkeleton = memo(function TopBrandsSkeleton() {
  return (
    <section className="max-w-7xl mx-auto px-4 mt-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-[3px] h-5 bg-blue-600 dark:bg-blue-500 rounded-full" />
          <h2 className="text-[15px] font-bold text-gray-900 dark:text-white">Top Brands</h2>
        </div>
      </div>
      <div className="flex gap-4 overflow-hidden">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="rounded-2xl animate-pulse bg-gray-100 dark:bg-white/5 flex-shrink-0"
            style={{ width: "min(85vw, 380px)", height: 320 }} />
        ))}
      </div>
    </section>
  );
});

const TopBrandsSection = memo(function TopBrandsSection({ brandProducts, loading }: { brandProducts: Record<string, any[]>; loading: boolean }) {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const isDark = useIsDark();

  const scrollTo = useCallback((i: number) => {
    const slider = sliderRef.current;
    if (!slider) return;
    const panels = slider.querySelectorAll<HTMLElement>(".tb-panel");
    if (panels[i]) { slider.scrollTo({ left: panels[i].offsetLeft - 16, behavior: "smooth" }); setActiveIdx(i); }
  }, []);

  const handleSliderScroll = useCallback(() => {
    const slider = sliderRef.current;
    if (!slider) return;
    const panels = slider.querySelectorAll<HTMLElement>(".tb-panel");
    let closest = 0, minDiff = Infinity;
    panels.forEach((p, i) => { const diff = Math.abs(p.offsetLeft - slider.scrollLeft - 16); if (diff < minDiff) { minDiff = diff; closest = i; } });
    setActiveIdx(closest);
  }, []);

  return (
    <section className="max-w-7xl mx-auto px-4 mt-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-[3px] h-5 bg-blue-600 dark:bg-blue-500 rounded-full" />
          <h2 className="text-[15px] font-bold text-gray-900 dark:text-white">Top Brands</h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            {TOP_BRANDS.map((b, i) => {
              const accent = isDark ? b.dAccent : b.lAccent;
              return (
                <button key={b.name} onClick={() => scrollTo(i)} aria-label={`Scroll to ${b.name}`} className="rounded-full transition-all duration-300"
                  style={{ width: activeIdx === i ? 18 : 6, height: 6, backgroundColor: activeIdx === i ? accent : (isDark ? "#333" : "#d1d5db") }} />
              );
            })}
          </div>
          <Link href="/top-brands" className="text-[11px] font-bold text-blue-600 dark:text-blue-400 flex items-center gap-0.5 hover:opacity-80 transition-opacity">
            View all <ArrowRight size={11} />
          </Link>
        </div>
      </div>

      <div ref={sliderRef} onScroll={handleSliderScroll}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none", WebkitOverflowScrolling: "touch" } as React.CSSProperties}>
        {TOP_BRANDS.map(brand => <BrandPanel key={brand.name} brand={brand} brandProducts={brandProducts} loading={loading} />)}
      </div>

      <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
        {TOP_BRANDS.map((brand, i) => {
          const accent = isDark ? brand.dAccent : brand.lAccent;
          const tagBg  = isDark ? brand.dTagBg  : brand.lTagBg;
          return (
            <button key={brand.name} onClick={() => scrollTo(i)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] font-bold transition-all duration-200"
              style={activeIdx === i
                ? { borderColor: accent, backgroundColor: tagBg, color: accent }
                : { borderColor: isDark ? "#2a2a2a" : "#e5e7eb", backgroundColor: isDark ? "#111" : "#fff", color: isDark ? "#666" : "#6b7280" }
              }>
              <Image src={brand.img} alt={brand.name} width={13} height={13} className="object-contain" />
              {brand.name}
            </button>
          );
        })}
      </div>
    </section>
  );
});

const SellCTA = memo(function SellCTA() {
  return (
    <section className="max-w-7xl mx-auto px-4">
      <div className="rounded-2xl p-6 flex items-center justify-between gap-4 relative overflow-hidden border border-blue-200 dark:border-blue-500/20">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-[#0a1628] dark:to-[#0f1f3d]" />
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle, #3b82f6 1px, transparent 1px)", backgroundSize: "22px 22px" }} />
        <div className="relative">
          <div className="flex items-center gap-1.5 mb-2">
            <Sparkles size={10} className="text-blue-600 dark:text-blue-400" />
            <p className="text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase tracking-widest">Sell on BuyZze — Free</p>
          </div>
          <h2 className="text-[20px] font-black text-gray-900 dark:text-white leading-tight mb-1">
            Have a phone to sell?<br />
            <span className="text-blue-600 dark:text-blue-300">Get the best price today.</span>
          </h2>
          <p className="text-gray-500 dark:text-white/35 text-[12px]">List in 2 minutes. Zero commission.</p>
        </div>
        <div className="flex flex-col gap-2.5 flex-shrink-0 relative">
          <Link href="/sell"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[13px] px-5 py-2.5 rounded-xl shadow-md shadow-blue-200 dark:shadow-blue-500/20 transition-colors">
            <Zap size={13} /> Start Selling — Free
          </Link>
          <Link href="/how-it-works"
            className="text-center border border-blue-300 dark:border-white/15 text-blue-700 dark:text-white/60 hover:bg-blue-50 dark:hover:bg-white/5 font-medium text-[12px] px-5 py-2 rounded-xl transition-colors">
            How it works →
          </Link>
        </div>
      </div>
    </section>
  );
});

const NearbyToggle = memo(function NearbyToggle() {
  const { isNearbyActive, setIsNearbyActive, selectedCity } = useLocation();
  return (
    <div className="max-w-7xl mx-auto px-4">
      <button
        onClick={() => setIsNearbyActive(!isNearbyActive)}
        className={`inline-flex items-center gap-2.5 px-4 py-2 rounded-xl border text-[12px] font-semibold transition-all ${
          isNearbyActive
            ? "border-blue-300 dark:border-blue-500/40 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300"
            : "border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.04] text-gray-600 dark:text-white/50 hover:border-gray-300 dark:hover:border-white/20"
        }`}
      >
        <MapPin size={12} className={isNearbyActive ? "text-blue-500 dark:text-blue-400" : "text-gray-400 dark:text-white/30"} />
        {isNearbyActive ? `Near: ${selectedCity || "Current City"}` : "Show Nearby Only"}
        <div className={`w-8 h-4 rounded-full relative transition-colors ${isNearbyActive ? "bg-blue-500" : "bg-gray-200 dark:bg-white/10"}`}>
          <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow transition-all ${isNearbyActive ? "left-4" : "left-0.5"}`} />
        </div>
      </button>
    </div>
  );
});

export default function HomePage() {
  const [allProducts, setAllProducts]     = useState<any[]>([]);
  const [brandProducts, setBrandProducts] = useState<Record<string, any[]>>({});
  const [loading, setLoading]             = useState(true);
  const [activeBrand, setActiveBrand]     = useState<string | null>(null);
  const [chatOpen, setChatOpen]           = useState(false);
  const { selectedCity, isNearbyActive, location }  = useLocation();

  useEffect(() => {
    // ✅ SPEED FIX: guard against race conditions so a slow, stale request
    // can't overwrite state from a newer request (avoids wasted renders)
    let cancelled = false;

    const fetchData = async () => {
      setLoading(true);
      
      let q = supabase
        .from("products")
        .select("id, title, price, images, brand, city, state, created_at, status, expires_at, ram, storage, condition")
        .order("created_at", { ascending: false })
        .limit(100); 
        
      if (isNearbyActive && selectedCity) q = q.ilike("city", `%${selectedCity}%`);
      const { data } = await q;
      if (cancelled) return;
      let raw = data || [];

      const nowTime = Date.now();

      raw = raw.filter((p: any) => {
        if (p.status === 'expired') return false; 
        if (p.expires_at && new Date(p.expires_at).getTime() < nowTime) return false;
        return true; 
      });

      const userCity = (selectedCity || location || "").toLowerCase().trim();

      const scored = raw.map((p: any) => {
        let score = 0;
        const pCity  = (p.city  || "").toLowerCase().trim();
        const pState = (p.state || "").toLowerCase().trim();

        if (userCity && pCity === userCity)                                    score += 100;
        else if (userCity && (pCity.includes(userCity) || userCity.includes(pCity))) score += 60;
        else if (pState)                                                        score += 20;

        const ageDays = (nowTime - new Date(p.created_at).getTime()) / 86400000;
        if      (ageDays <= 1)  score += 30;
        else if (ageDays <= 3)  score += 20;
        else if (ageDays <= 7)  score += 10;
        else if (ageDays <= 14) score += 5;

        if (Array.isArray(p.images) && p.images.length > 0) score += 5;

        score += Math.random() * 8;

        return { ...p, _score: score };
      });

      scored.sort((a: any, b: any) => b._score - a._score);
      const products = scored.map(({ _score, ...p }: any) => p);

      if (cancelled) return;
      setAllProducts(products);
      const grouped: Record<string, any[]> = {};
      for (const brand of ALL_BRANDS) {
        grouped[brand.name] = products.filter((p: any) => (p.brand || "").toLowerCase().includes(brand.name.toLowerCase())).slice(0, 4);
      }
      setBrandProducts(grouped);
      setLoading(false);
    };
    fetchData();
    return () => { cancelled = true; };
  }, [isNearbyActive, selectedCity, location]);

  const isAllMode = !activeBrand;

  // ✅ SPEED FIX: memoize derived list so it's only recomputed when its inputs change
  const gridProducts = useMemo(
    () =>
      isAllMode
        ? allProducts
        : allProducts.filter(p => (p.brand || "").toLowerCase().includes(activeBrand!.toLowerCase())),
    [isAllMode, allProducts, activeBrand]
  );

  // ✅ SPEED FIX: stable function reference so it doesn't cause BuyzzeChat to re-render
  const handleChatClose = useCallback(() => setChatOpen(false), []);

  // ✅ SPEED FIX: only mount these heavy, below-the-fold sections once the user
  // scrolls near them — cuts initial JS execution/render work significantly.
  const { ref: videoRef, inView: videoInView } = useInView<HTMLDivElement>();
  const { ref: brandsRef, inView: brandsInView } = useInView<HTMLDivElement>();

  return (
    <main
      className="min-h-screen pb-32"
      style={{ backgroundColor: "var(--bg-base)", color: "var(--text-primary)", fontFamily: FONT }}
    >
      {isAllMode && <HeroSlider />}

      <BrandFilter activeBrand={activeBrand} setActiveBrand={setActiveBrand} />

      <div className="mt-4 mb-2"><NearbyToggle /></div>

      {isAllMode && <RecentlyAddedSection products={allProducts} loading={loading} />}
      {isAllMode && <ConditionSection />}
      {isAllMode && <div className="mt-6"><SellCTA /></div>}
      
      {isAllMode && (
        <div ref={videoRef}>
          {videoInView && <AIVideoSlider />}
        </div>
      )}

      {isAllMode && (
        <div ref={brandsRef}>
          {brandsInView
            ? <TopBrandsSection brandProducts={brandProducts} loading={loading} />
            : <TopBrandsSkeleton />}
        </div>
      )}

      <div className="mt-6">
        <ListingArea products={gridProducts} loading={loading}
          title={isAllMode ? "All Listings" : `${activeBrand} — All Listings`} />
      </div>

      <FloatingNav />
      <BuyzzeChat isOpen={chatOpen} onClose={handleChatClose} isDesktop={false} />
    </main>
  );
}
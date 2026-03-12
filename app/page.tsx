"use client";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useLocation } from "@/features/location/context/LocationContext";
import HeroSlider from "./components/HeroSlider";
import BrandFilter from "./components/BrandFilter";
import ListingArea from "./components/ListingArea";
import FloatingNav from "@/components/FloatingNav";
import BuyzzeChat from "@/components/BuyzzeChat";
import FavoriteButton from "@/components/FavoriteButton";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import {
  ChevronLeft, ChevronRight, MapPin,
  Zap, ArrowRight, Clock, Sparkles
} from "lucide-react";

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

// ─── Safe dark mode hook ──────────────────────────────────────────────────────
function useIsDark() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return false;
  return resolvedTheme === "dark";
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

// ═══════════════════════════════════════════════════════════════
// RECENTLY ADDED
// ═══════════════════════════════════════════════════════════════
function RecentCard({ p }: { p: any }) {
  const date = new Date(p.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
  return (
    <Link
      href={`/products/${p.id}`}
      className="flex-shrink-0 w-[152px] rounded-2xl overflow-hidden
        border border-gray-200 dark:border-white/[0.07]
        bg-white dark:bg-[#111215]
        hover:border-blue-300 dark:hover:border-blue-500/40
        hover:-translate-y-1 hover:shadow-lg hover:shadow-black/10 dark:hover:shadow-black/50
        transition-all duration-300 relative group"
    >
      <FavoriteButton productId={p.id} size="sm" />
      <div className="h-[112px] bg-gray-50 dark:bg-white/[0.03] flex items-center justify-center overflow-hidden">
        <Image src={p.images?.[0] || "/placeholder.png"} alt={p.title} width={100} height={100}
          className="object-contain p-2 group-hover:scale-110 transition-transform duration-500" />
      </div>
      <div className="p-3">
        <p className="text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.15em] truncate mb-1">{p.brand}</p>
        <h4 className="text-[11.5px] font-semibold text-gray-800 dark:text-white/90 line-clamp-2 leading-snug mb-2">{p.title}</h4>
        <p className="text-[15px] font-black text-gray-900 dark:text-white">₹{p.price?.toLocaleString("en-IN")}</p>
        <div className="flex items-center gap-1 mt-1.5">
          <MapPin size={8} className="text-gray-400 dark:text-white/30" />
          <span className="text-[9px] text-gray-400 dark:text-white/30 truncate">{p.city} · {date}</span>
        </div>
      </div>
    </Link>
  );
}

function RecentlyAddedSection({ products, loading }: { products: any[]; loading: boolean }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scroll = (d: "l" | "r") =>
    scrollRef.current?.scrollBy({ left: d === "r" ? 200 : -200, behavior: "smooth" });
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const recent = products.filter(p => new Date(p.created_at) >= sevenDaysAgo).slice(0, 10);

  return (
    <section className="max-w-7xl mx-auto px-4 mt-6">
      <div className="rounded-2xl border border-gray-200 dark:border-white/[0.06] bg-white dark:bg-[#0e0f12] px-5 pt-5 pb-5 shadow-sm dark:shadow-none">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 text-[10px] font-bold px-2.5 py-1 rounded-full">
              <Clock size={9} /><span>Last 7 Days</span>
            </div>
            <h2 className="text-[15px] font-bold text-gray-900 dark:text-white">Recently Added</h2>
            {!loading && <span className="text-[11px] text-gray-400 dark:text-white/25">({recent.length})</span>}
          </div>
          <div className="flex items-center gap-2">
            <Link href="/recently-added" className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:opacity-80 flex items-center gap-0.5 transition-opacity">
              View all <ArrowRight size={11} />
            </Link>
            <div className="flex gap-1">
              <button onClick={() => scroll("l")} className="w-7 h-7 rounded-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-white/10 transition-colors">
                <ChevronLeft size={12} className="text-gray-500 dark:text-white/50" />
              </button>
              <button onClick={() => scroll("r")} className="w-7 h-7 rounded-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-white/10 transition-colors">
                <ChevronRight size={12} className="text-gray-500 dark:text-white/50" />
              </button>
            </div>
          </div>
        </div>
        <div ref={scrollRef} className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide" style={NO_SCROLL}>
          {loading
            ? [...Array(6)].map((_, i) => <div key={i} className="flex-shrink-0 w-[152px] h-[230px] bg-gray-100 dark:bg-white/5 rounded-2xl animate-pulse" />)
            : recent.length === 0
            ? <div className="w-full py-12 text-center"><p className="text-gray-400 dark:text-white/25 text-[13px]">No products added in last 7 days</p></div>
            : recent.map(p => <RecentCard key={p.id} p={p} />)
          }
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════
// TOP BRANDS
// ═══════════════════════════════════════════════════════════════
function BrandProductCard({ p, brand }: { p: any; brand: typeof TOP_BRANDS[0] }) {
  const t = useBrandTokens(brand);
  return (
    <Link href={`/products/${p.id}`}
      className="flex flex-col rounded-xl border overflow-hidden hover:scale-[1.02] hover:shadow-md transition-all duration-200 group"
      style={{ borderColor: t.border, backgroundColor: t.tagBg }}
    >
      <div className="w-full h-[110px] flex items-center justify-center overflow-hidden" style={{ backgroundColor: t.tagBg }}>
        <Image src={p.images?.[0] || "/placeholder.png"} alt={p.title} width={90} height={90}
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
}

function BrandPanel({ brand, brandProducts, loading }: { brand: typeof TOP_BRANDS[0]; brandProducts: Record<string, any[]>; loading: boolean }) {
  const t = useBrandTokens(brand);
  const products = (brandProducts[brand.name] || []).slice(0, 4);
  return (
    <div className="tb-panel snap-start flex-shrink-0 rounded-2xl overflow-hidden border flex flex-col shadow-sm dark:shadow-none"
      style={{ width: "min(85vw, 380px)", borderColor: t.border, backgroundColor: t.cardBg }}
    >
      <div className="px-4 py-3.5 flex items-center justify-between" style={{ background: brand.headerBg }}>
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-black/20 border border-white/25 flex items-center justify-center overflow-hidden flex-shrink-0">
            <Image src={brand.img} alt={brand.name} width={30} height={30} className="object-contain p-0.5" />
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
}

function TopBrandsSection({ brandProducts, loading }: { brandProducts: Record<string, any[]>; loading: boolean }) {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const isDark = useIsDark();

  const scrollTo = (i: number) => {
    const slider = sliderRef.current;
    if (!slider) return;
    const panels = slider.querySelectorAll<HTMLElement>(".tb-panel");
    if (panels[i]) { slider.scrollTo({ left: panels[i].offsetLeft - 16, behavior: "smooth" }); setActiveIdx(i); }
  };

  const handleSliderScroll = () => {
    const slider = sliderRef.current;
    if (!slider) return;
    const panels = slider.querySelectorAll<HTMLElement>(".tb-panel");
    let closest = 0, minDiff = Infinity;
    panels.forEach((p, i) => { const diff = Math.abs(p.offsetLeft - slider.scrollLeft - 16); if (diff < minDiff) { minDiff = diff; closest = i; } });
    setActiveIdx(closest);
  };

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
                <button key={b.name} onClick={() => scrollTo(i)} className="rounded-full transition-all duration-300"
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
          const border = isDark ? brand.dBorder : brand.lBorder;
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
}

// ═══════════════════════════════════════════════════════════════
// SELL CTA
// ═══════════════════════════════════════════════════════════════
function SellCTA() {
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
}

// ═══════════════════════════════════════════════════════════════
// NEARBY TOGGLE
// ═══════════════════════════════════════════════════════════════
function NearbyToggle() {
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
}

// ═══════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════
export default function HomePage() {
  const [allProducts, setAllProducts]     = useState<any[]>([]);
  const [brandProducts, setBrandProducts] = useState<Record<string, any[]>>({});
  const [loading, setLoading]             = useState(true);
  const [activeBrand, setActiveBrand]     = useState<string | null>(null);
  const [chatOpen, setChatOpen]           = useState(false);
  const { selectedCity, isNearbyActive }  = useLocation();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      let q = supabase.from("products").select("*").order("created_at", { ascending: false }).limit(100);
      if (isNearbyActive && selectedCity) q = q.ilike("city", `%${selectedCity}%`);
      const { data } = await q;
      const products = data || [];
      setAllProducts(products);
      const grouped: Record<string, any[]> = {};
      for (const brand of ALL_BRANDS) {
        grouped[brand.name] = products.filter(p => (p.brand || "").toLowerCase().includes(brand.name.toLowerCase())).slice(0, 4);
      }
      setBrandProducts(grouped);
      setLoading(false);
    };
    fetchData();
  }, [isNearbyActive, selectedCity]);

  const isAllMode = !activeBrand;

  const gridProducts = isAllMode
    ? allProducts
    : allProducts.filter(p => (p.brand || "").toLowerCase().includes(activeBrand!.toLowerCase()));

  return (
    <main
      className="min-h-screen pb-32"
      style={{ backgroundColor: "var(--bg-base)", color: "var(--text-primary)", fontFamily: FONT }}
    >
      {isAllMode && <HeroSlider />}

      <BrandFilter activeBrand={activeBrand} setActiveBrand={setActiveBrand} />

      <div className="mt-4 mb-2"><NearbyToggle /></div>

      {isAllMode && <RecentlyAddedSection products={allProducts} loading={loading} />}
      {isAllMode && <div className="mt-6"><SellCTA /></div>}
      {isAllMode && <TopBrandsSection brandProducts={brandProducts} loading={loading} />}

      <div className="mt-6">
        <ListingArea products={gridProducts} loading={loading}
          title={isAllMode ? "All Listings" : `${activeBrand} — All Listings`} />
      </div>

      <FloatingNav />
      <BuyzzeChat isOpen={chatOpen} onClose={() => setChatOpen(false)} />
    </main>
  );
}
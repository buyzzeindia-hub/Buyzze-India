"use client";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import FavoriteButton from "@/components/FavoriteButton";
import Link from "next/link";
import Image from "next/image";
import { MapPin, ArrowLeft, ChevronRight } from "lucide-react";

const FONT = "'Roboto', 'Segoe UI', system-ui, sans-serif";
const NO_SCROLL = { scrollbarWidth: "none" as const, msOverflowStyle: "none" as const };

// ─── 9 Brands Config — shown in 3 rows × 3 cols ───────────────────────────────
const ALL_BRANDS = [
  // Row 1
  {
    name: "Apple",
    img: "/brand-apple.webp",
    headerBg: "linear-gradient(135deg,#ea580c,#fb923c)",
    sectionBg: "#fff7ed",
    border: "#fed7aa",
    accent: "#c2410c",
    tagBg: "#ffedd5",
    tagColor: "#c2410c",
  },
  {
    name: "Samsung",
    img: "/brand-samsung.webp",
    headerBg: "linear-gradient(135deg,#92400e,#d97706)",
    sectionBg: "#fffbeb",
    border: "#fde68a",
    accent: "#92400e",
    tagBg: "#fef3c7",
    tagColor: "#92400e",
  },
  {
    name: "Xiaomi",
    img: "/xiaomi-brand.webp",
    headerBg: "linear-gradient(135deg,#0369a1,#0ea5e9)",
    sectionBg: "#f0f9ff",
    border: "#bae6fd",
    accent: "#0369a1",
    tagBg: "#e0f2fe",
    tagColor: "#0369a1",
  },
  // Row 2
  {
    name: "Google",
    img: "/brand-google.webp",
    headerBg: "linear-gradient(135deg,#1565c0,#4285f4)",
    sectionBg: "#edf4ff",
    border: "#c4d8fa",
    accent: "#1a56db",
    tagBg: "#dbeafe",
    tagColor: "#1a56db",
  },
  {
    name: "OnePlus",
    img: "/brand-oneplus.webp",
    headerBg: "linear-gradient(135deg,#9b1c1c,#ef4444)",
    sectionBg: "#fff5f5",
    border: "#fecaca",
    accent: "#b91c1c",
    tagBg: "#fee2e2",
    tagColor: "#b91c1c",
  },
  {
    name: "Vivo",
    img: "/brand-vivo.webp",
    headerBg: "linear-gradient(135deg,#3730a3,#6366f1)",
    sectionBg: "#eef2ff",
    border: "#c7d2fe",
    accent: "#4338ca",
    tagBg: "#e0e7ff",
    tagColor: "#4338ca",
  },
  // Row 3
  {
    name: "Oppo",
    img: "/brand-oppo.webp",
    headerBg: "linear-gradient(135deg,#0e7490,#06b6d4)",
    sectionBg: "#ecfeff",
    border: "#a5f3fc",
    accent: "#0e7490",
    tagBg: "#cffafe",
    tagColor: "#0e7490",
  },
  {
    name: "Realme",
    img: "/brand-realme.webp",
    headerBg: "linear-gradient(135deg,#b45309,#f59e0b)",
    sectionBg: "#fffbeb",
    border: "#fde68a",
    accent: "#b45309",
    tagBg: "#fef3c7",
    tagColor: "#b45309",
  },
  {
    name: "Motorola",
    img: "/brand-motorola.webp",
    headerBg: "linear-gradient(135deg,#4a1d96,#7c3aed)",
    sectionBg: "#f5f3ff",
    border: "#ddd6fe",
    accent: "#6d28d9",
    tagBg: "#ede9fe",
    tagColor: "#6d28d9",
  },
];

// ─── Brand Product Card — vertical, 2×2 grid ─────────────────────────────────
function BrandProductCard({ p, brand }: { p: any; brand: typeof ALL_BRANDS[0] }) {
  return (
    <div className="relative group">
      <FavoriteButton productId={p.id} size="sm" />
      <Link
        href={`/products/${p.id}`}
        className="flex flex-col rounded-xl border bg-white overflow-hidden hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200"
        style={{ borderColor: brand.border }}
      >
        {/* Image */}
        <div
          className="w-full h-[100px] flex items-center justify-center overflow-hidden"
          style={{ backgroundColor: brand.tagBg }}
        >
          <Image
            src={p.images?.[0] || "/placeholder.png"}
            alt={p.title}
            width={88} height={88}
            className="object-contain p-2 group-hover:scale-105 transition-transform duration-200"
          />
        </div>
        {/* Info */}
        <div className="p-2 flex flex-col">
          <h4 className="text-[11px] font-semibold text-gray-800 line-clamp-2 leading-snug mb-1.5">
            {p.title}
          </h4>
          {(p.ram || p.storage) && (
            <div className="flex gap-1 flex-wrap mb-1.5">
              {p.ram && (
                <span className="text-[8.5px] font-bold px-1.5 py-0.5 rounded-md"
                  style={{ background: brand.tagBg, color: brand.tagColor }}>
                  {p.ram}
                </span>
              )}
              {p.storage && (
                <span className="text-[8.5px] font-bold px-1.5 py-0.5 rounded-md"
                  style={{ background: brand.tagBg, color: brand.tagColor }}>
                  {p.storage}
                </span>
              )}
            </div>
          )}
          <p className="text-[13px] font-black" style={{ color: brand.accent }}>
            ₹{p.price?.toLocaleString("en-IN")}
          </p>
          {p.city && (
            <div className="flex items-center gap-0.5 mt-1">
              <MapPin size={8} className="text-gray-400 flex-shrink-0" />
              <span className="text-[8.5px] text-gray-400 truncate">{p.city}</span>
            </div>
          )}
        </div>
      </Link>
    </div>
  );
}

// ─── Single Brand Section Panel ───────────────────────────────────────────────
function BrandPanel({ brand, products, loading }: {
  brand: typeof ALL_BRANDS[0];
  products: any[];
  loading: boolean;
}) {
  const top4 = products.slice(0, 4);

  return (
    <div
      className="rounded-2xl overflow-hidden border shadow-sm flex flex-col"
      style={{ borderColor: brand.border, backgroundColor: brand.sectionBg }}
    >
      {/* Header */}
      <div
        className="px-4 py-3 flex items-center justify-between flex-shrink-0"
        style={{ background: brand.headerBg }}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center flex-shrink-0">
            <Image src={brand.img} alt={brand.name} width={26} height={26} className="object-contain p-0.5" />
          </div>
          <div>
            <p className="text-white font-black text-[14px] leading-none">{brand.name}</p>
            <p className="text-white/60 text-[9.5px] mt-0.5">
              {loading ? "Loading…" : `${products.length} listing${products.length !== 1 ? "s" : ""}`}
            </p>
          </div>
        </div>
        <Link
          href={`/search?q=${brand.name}`}
          className="flex items-center gap-0.5 bg-white/20 hover:bg-white/30 border border-white/28 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition-colors"
        >
          All <ChevronRight size={10} />
        </Link>
      </div>

      {/* 2×2 Product Grid */}
      <div className="p-2.5 grid grid-cols-2 gap-2">
        {loading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="h-[140px] rounded-xl animate-pulse" style={{ backgroundColor: brand.tagBg }} />
          ))
        ) : top4.length === 0 ? (
          <div className="col-span-2 py-8 text-center">
            <p className="text-gray-400 text-[12px]">No listings yet</p>
          </div>
        ) : (
          top4.map(p => <BrandProductCard key={p.id} p={p} brand={brand} />)
        )}
      </div>

      {/* See more */}
      {!loading && products.length > 4 && (
        <div className="px-2.5 pb-2.5">
          <Link
            href={`/search?q=${brand.name}`}
            className="flex items-center justify-center gap-1 w-full py-2 rounded-xl border text-[11px] font-bold bg-white transition-colors hover:opacity-80"
            style={{ borderColor: brand.border, color: brand.accent }}
          >
            {products.length - 4} more <ChevronRight size={11} />
          </Link>
        </div>
      )}
    </div>
  );
}

// ─── Row of 3 brand panels (horizontal slider on mobile) ─────────────────────
function BrandRow({ brands, brandProducts, loading }: {
  brands: typeof ALL_BRANDS;
  brandProducts: Record<string, any[]>;
  loading: boolean;
}) {
  return (
    <div
      className="flex gap-4 overflow-x-auto snap-x snap-mandatory"
      style={NO_SCROLL}
    >
      {brands.map(brand => (
        <div
          key={brand.name}
          className="snap-start flex-shrink-0"
          style={{ width: "min(82vw, 340px)", flex: "0 0 calc(33.333% - 11px)" }}
        >
          <BrandPanel
            brand={brand}
            products={brandProducts[brand.name] || []}
            loading={loading}
          />
        </div>
      ))}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function TopBrandsPage() {
  const [brandProducts, setBrandProducts] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(300);

      const products = data || [];
      const grouped: Record<string, any[]> = {};
      for (const brand of ALL_BRANDS) {
        grouped[brand.name] = products.filter(p =>
          (p.brand || "").toLowerCase().includes(brand.name.toLowerCase())
        );
      }
      setBrandProducts(grouped);
      setLoading(false);
    };
    fetchData();
  }, []);

  // Split 9 brands into 3 rows of 3
  const rows = [
    ALL_BRANDS.slice(0, 3), // Row 1: Apple, Samsung, Xiaomi
    ALL_BRANDS.slice(3, 6), // Row 2: Google, OnePlus, Vivo
    ALL_BRANDS.slice(6, 9), // Row 3: Oppo, Realme, Motorola
  ];

  return (
    <main className="min-h-screen bg-[#f1f3f6] pb-24" style={{ fontFamily: FONT }}>

      {/* Sticky Header */}
      <div className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3.5 flex items-center gap-3">
          <Link
            href="/"
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors flex-shrink-0"
          >
            <ArrowLeft size={15} className="text-gray-600" />
          </Link>
          <div className="flex-1">
            <h1 className="text-[16px] font-bold text-gray-900">Top Brands</h1>
            <p className="text-[11px] text-gray-400">9 brands · swipe each row on mobile</p>
          </div>
        </div>
      </div>

      {/* 3 rows of brand panels */}
      <div className="max-w-7xl mx-auto px-4 py-5 space-y-4">
        {rows.map((rowBrands, rowIdx) => (
          <div key={rowIdx}>
            {/* Row label */}
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2.5 px-0.5">
              {rowIdx === 0 ? "🔥 Most Popular" : rowIdx === 1 ? "⚡ Trending" : "✨ Also Available"}
            </p>
            <BrandRow
              brands={rowBrands}
              brandProducts={brandProducts}
              loading={loading}
            />
          </div>
        ))}
      </div>
    </main>
  );
}
"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import FavoriteButton from "@/components/FavoriteButton";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Search, ShieldCheck, Clock, ArrowLeft, SlidersHorizontal } from "lucide-react";

const FONT = "'Roboto', 'Segoe UI', system-ui, sans-serif";

// Condition color coding
function conditionStyle(condition: string) {
  const c = condition.toLowerCase();
  if (c.includes("excellent")) return { bg: "#dbeafe", color: "#1d4ed8" };
  if (c.includes("good"))      return { bg: "#dcfce7", color: "#15803d" };
  if (c.includes("fair"))      return { bg: "#fef9c3", color: "#854d0e" };
  return { bg: "#f3f4f6", color: "#374151" };
}

// Brand bg gradient map
const BRAND_BG: Record<string, string> = {
  apple:    "linear-gradient(145deg,#f5f5f7,#e8e8ed)",
  samsung:  "linear-gradient(145deg,#eef0ff,#dde2ff)",
  oneplus:  "linear-gradient(145deg,#fff0f1,#ffd6da)",
  xiaomi:   "linear-gradient(145deg,#f0f9ff,#bae6fd)",
  vivo:     "linear-gradient(145deg,#eff1ff,#d8dfff)",
  oppo:     "linear-gradient(145deg,#edf6fc,#c8e8f7)",
  realme:   "linear-gradient(145deg,#fdfaed,#f5edbb)",
  google:   "linear-gradient(145deg,#edf4ff,#d2e5ff)",
  motorola: "linear-gradient(145deg,#f5f0ff,#e5d6ff)",
  nothing:  "linear-gradient(145deg,#f0f0f0,#e0e0e0)",
  nokia:    "linear-gradient(145deg,#e8f5e9,#c8e6c9)",
  poco:     "linear-gradient(145deg,#fff3e0,#ffe0b2)",
};

function getBrandBg(brand?: string) {
  if (!brand) return "linear-gradient(145deg,#f8fafc,#f1f5f9)";
  return BRAND_BG[brand.toLowerCase()] || "linear-gradient(145deg,#f8fafc,#f1f5f9)";
}

// ─── Product Card (vertical list style) ───────────────────────────────────────
function ProductCard({ product }: { product: any }) {
  const postedDate = new Date(product.created_at).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  });
  const daysAgo = Math.floor(
    (Date.now() - new Date(product.created_at).getTime()) / (1000 * 60 * 60 * 24)
  );
  const timeLabel = daysAgo === 0 ? "Today" : daysAgo === 1 ? "Yesterday" : `${daysAgo}d ago`;
  const cStyle = product.condition ? conditionStyle(product.condition) : null;

  return (
    <div className="relative group">
      <FavoriteButton productId={product.id} size="sm" />
      <Link
        href={`/products/${product.id}`}
        className="flex gap-4 bg-white rounded-2xl border border-gray-100 shadow-sm p-3.5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
      >
        {/* Image */}
        <div
          className="w-28 h-28 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden"
          style={{ background: getBrandBg(product.brand) }}
        >
          <Image
            src={product.images?.[0] || "/placeholder.png"}
            alt={product.title}
            width={96} height={96}
            className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-2 mb-1">
              <div>
                {product.brand && (
                  <p className="text-[10px] font-extrabold text-blue-500 uppercase tracking-widest mb-0.5">
                    {product.brand}
                  </p>
                )}
                <h3 className="text-[14px] font-semibold text-gray-900 line-clamp-2 leading-snug">
                  {product.title}
                </h3>
              </div>
              {cStyle && product.condition && (
                <span
                  className="flex-shrink-0 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide"
                  style={{ backgroundColor: cStyle.bg, color: cStyle.color }}
                >
                  {product.condition}
                </span>
              )}
            </div>

            {/* Spec pills */}
            {(product.ram || product.storage) && (
              <div className="flex gap-1.5 flex-wrap mt-1.5">
                {product.ram && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                    {product.ram} RAM
                  </span>
                )}
                {product.storage && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-violet-50 text-violet-600 border border-violet-100">
                    {product.storage}
                  </span>
                )}
              </div>
            )}
          </div>

          <div>
            {/* Price */}
            <p className="text-[18px] font-black text-gray-900 mt-2">
              ₹{product.price?.toLocaleString("en-IN")}
            </p>

            {/* Footer row */}
            <div className="flex items-center justify-between mt-1.5">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-gray-400">
                  <MapPin size={10} />
                  <span className="text-[10px] truncate max-w-[110px]">{product.city}</span>
                </div>
                <div className="flex items-center gap-1 bg-emerald-50 border border-emerald-100 rounded-md px-1.5 py-0.5">
                  <ShieldCheck size={9} className="text-emerald-600" />
                  <span className="text-[9px] font-bold text-emerald-700">Assured</span>
                </div>
              </div>
              <div className="flex items-center gap-1 text-gray-400">
                <Clock size={9} />
                <span className="text-[10px]">{timeLabel}</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

// ─── Sort / Filter options ─────────────────────────────────────────────────────
const SORT_OPTIONS = [
  { label: "Newest First", value: "newest" },
  { label: "Price: Low → High", value: "price_asc" },
  { label: "Price: High → Low", value: "price_desc" },
];

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function RecentlyAddedPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [showSort, setShowSort] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const { data } = await supabase
        .from("products")
        .select("*")
        .gte("created_at", sevenDaysAgo)
        .order("created_at", { ascending: false });
      setProducts(data || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  // Filter by search
  const filtered = products.filter(p => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (p.title || "").toLowerCase().includes(q) ||
      (p.brand || "").toLowerCase().includes(q) ||
      (p.city || "").toLowerCase().includes(q)
    );
  });

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    if (sort === "price_asc") return (a.price || 0) - (b.price || 0);
    if (sort === "price_desc") return (b.price || 0) - (a.price || 0);
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <main className="min-h-screen bg-[#f1f3f6]" style={{ fontFamily: FONT }}>

      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/" className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 hover:bg-gray-200 transition-colors">
            <ArrowLeft size={15} className="text-gray-600" />
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-1.5 mb-0.5">
              <h1 className="text-[16px] font-bold text-gray-900">Recently Added</h1>
              <span className="flex items-center gap-1 bg-blue-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                <Clock size={8} /> Last 7 days
              </span>
            </div>
            {!loading && (
              <p className="text-[11px] text-gray-400">{sorted.length} product{sorted.length !== 1 ? "s" : ""} found</p>
            )}
          </div>
        </div>

        {/* Search + Sort bar */}
        <div className="max-w-3xl mx-auto px-4 pb-3 flex gap-2">
          <div className="flex-1 flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
            <Search size={13} className="text-gray-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search by name, brand, city..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 bg-transparent text-[13px] text-gray-700 placeholder-gray-400 outline-none font-medium"
              style={{ fontFamily: FONT }}
            />
            {search && (
              <button onClick={() => setSearch("")} className="text-gray-400 hover:text-gray-600 text-[13px]">✕</button>
            )}
          </div>
          {/* Sort button */}
          <div className="relative">
            <button
              onClick={() => setShowSort(!showSort)}
              className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-xl px-3 py-2 text-[12px] font-semibold text-gray-600 hover:border-gray-300 transition-colors"
            >
              <SlidersHorizontal size={12} />
              Sort
            </button>
            {showSort && (
              <div className="absolute right-0 top-10 bg-white border border-gray-100 rounded-xl shadow-lg z-50 min-w-[180px] overflow-hidden">
                {SORT_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => { setSort(opt.value); setShowSort(false); }}
                    className={`w-full text-left px-4 py-2.5 text-[12px] font-medium transition-colors ${
                      sort === opt.value
                        ? "bg-blue-50 text-blue-600 font-bold"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-4 space-y-3 pb-24">
        {loading ? (
          [...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl h-32 animate-pulse border border-gray-100" />
          ))
        ) : sorted.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-2xl border border-gray-100">
            <Clock size={32} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-semibold text-[15px]">
              {search ? "No results found" : "No products added in last 7 days"}
            </p>
            <p className="text-gray-400 text-[12px] mt-1">
              {search ? "Try different keywords" : "Check back soon!"}
            </p>
            {search && (
              <button
                onClick={() => setSearch("")}
                className="mt-4 text-[12px] font-bold text-blue-600 border border-blue-200 px-4 py-1.5 rounded-lg"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          sorted.map(p => <ProductCard key={p.id} product={p} />)
        )}
      </div>
    </main>
  );
}
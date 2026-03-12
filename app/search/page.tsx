"use client";
import { useEffect, useState, Suspense, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import {
  MapPin,
  Smartphone,
  HardDrive,
  Star,
  Calendar,
  SlidersHorizontal,
  X,
  ChevronDown,
  ChevronUp,
  Search,
} from "lucide-react";
import { useSearch } from "@/context/SearchContext";

// ─── Static Filter Options (Flipkart / Cashify style) ─────────────────────────
const TOP_BRANDS = [
  "Apple", "Samsung", "OnePlus", "Xiaomi", "Realme",
  "Oppo", "Vivo", "Motorola", "Nokia", "Google",
];
const RAM_OPTIONS = ["4GB", "6GB", "8GB", "12GB"];
const ROM_OPTIONS = ["64GB", "128GB", "256GB", "512GB", "1TB"];

// ─── Types ────────────────────────────────────────────────────────────────────
interface FilterState {
  brands: string[];
  rams: string[];
  storages: string[];
  priceMin: number;
  priceMax: number;
  city: string;
}

const PRICE_MAX = 100000;

const DEFAULT_FILTERS: FilterState = {
  brands: [],
  rams: [],
  storages: [],
  priceMin: 0,
  priceMax: PRICE_MAX,
  city: "",
};

// ─── Apply filters logic ──────────────────────────────────────────────────────
function applyFilters(products: any[], filters: FilterState): any[] {
  return products.filter((p) => {
    if (filters.brands.length > 0) {
      const productBrand = (p.brand || "").toLowerCase();
      const matched = filters.brands.some(
        (b) => productBrand === b.toLowerCase() || productBrand.includes(b.toLowerCase())
      );
      if (!matched) return false;
    }
    if (filters.rams.length > 0) {
      const productRam = (p.ram || "").toLowerCase().replace(/\s/g, "");
      const matched = filters.rams.some(
        (r) => productRam === r.toLowerCase().replace(/\s/g, "")
      );
      if (!matched) return false;
    }
    if (filters.storages.length > 0) {
      const productStorage = (p.storage || "").toLowerCase().replace(/\s/g, "");
      const matched = filters.storages.some(
        (s) => productStorage === s.toLowerCase().replace(/\s/g, "")
      );
      if (!matched) return false;
    }
    const price = Number(p.price) || 0;
    if (price < filters.priceMin || price > filters.priceMax) return false;
    if (filters.city.trim()) {
      const q = filters.city.trim().toLowerCase();
      if (
        !p.city?.toLowerCase().includes(q) &&
        !p.state?.toLowerCase().includes(q)
      )
        return false;
    }
    return true;
  });
}

function countActiveFilters(f: FilterState) {
  return (
    f.brands.length +
    f.rams.length +
    f.storages.length +
    (f.city ? 1 : 0) +
    (f.priceMin > 0 || f.priceMax < PRICE_MAX ? 1 : 0)
  );
}

// ─── Price Slider ─────────────────────────────────────────────────────────────
function PriceSlider({
  min,
  max,
  onChange,
}: {
  min: number;
  max: number;
  onChange: (min: number, max: number) => void;
}) {
  const [localMin, setLocalMin] = useState(min);
  const [localMax, setLocalMax] = useState(max);

  useEffect(() => setLocalMin(min), [min]);
  useEffect(() => setLocalMax(max), [max]);

  const leftPct = (localMin / PRICE_MAX) * 100;
  const rightPct = 100 - (localMax / PRICE_MAX) * 100;
  const commit = () => onChange(localMin, localMax);

  return (
    <div>
      {/* Min/Max input boxes */}
      <div className="flex gap-2 mb-4">
        <div className="flex-1">
          <label className="text-[10px] text-gray-400 font-semibold block mb-1">Min</label>
          <div className="flex items-center border border-gray-200 dark:border-zinc-700 rounded-lg px-2 py-1.5 bg-gray-50 dark:bg-zinc-800">
            <span className="text-[11px] text-gray-400 mr-1">₹</span>
            <input
              type="number"
              value={localMin}
              min={0}
              max={localMax - 1000}
              step={1000}
              onChange={(e) => setLocalMin(Math.min(Number(e.target.value), localMax - 1000))}
              onBlur={commit}
              className="w-full bg-transparent text-[11px] font-bold text-gray-700 dark:text-gray-200 outline-none"
            />
          </div>
        </div>
        <div className="flex-1">
          <label className="text-[10px] text-gray-400 font-semibold block mb-1">Max</label>
          <div className="flex items-center border border-gray-200 dark:border-zinc-700 rounded-lg px-2 py-1.5 bg-gray-50 dark:bg-zinc-800">
            <span className="text-[11px] text-gray-400 mr-1">₹</span>
            <input
              type="number"
              value={localMax}
              min={localMin + 1000}
              max={PRICE_MAX}
              step={1000}
              onChange={(e) => setLocalMax(Math.max(Number(e.target.value), localMin + 1000))}
              onBlur={commit}
              className="w-full bg-transparent text-[11px] font-bold text-gray-700 dark:text-gray-200 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Dual range slider */}
      <div className="relative h-5 flex items-center">
        <div className="absolute w-full h-1 bg-gray-200 dark:bg-zinc-700 rounded-full" />
        <div
          className="absolute h-1 bg-blue-500 rounded-full"
          style={{ left: `${leftPct}%`, right: `${rightPct}%` }}
        />
        <input
          type="range"
          min={0}
          max={PRICE_MAX}
          step={1000}
          value={localMin}
          onChange={(e) =>
            setLocalMin(Math.min(Number(e.target.value), localMax - 1000))
          }
          onMouseUp={commit}
          onTouchEnd={commit}
          className="absolute w-full h-1 appearance-none bg-transparent cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-[18px] [&::-webkit-slider-thumb]:h-[18px]
            [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white
            [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-blue-500
            [&::-webkit-slider-thumb]:shadow-[0_1px_4px_rgba(0,0,0,0.2)]
            [&::-webkit-slider-thumb]:cursor-pointer"
          style={{ zIndex: localMin > PRICE_MAX - 5000 ? 5 : 3 }}
        />
        <input
          type="range"
          min={0}
          max={PRICE_MAX}
          step={1000}
          value={localMax}
          onChange={(e) =>
            setLocalMax(Math.max(Number(e.target.value), localMin + 1000))
          }
          onMouseUp={commit}
          onTouchEnd={commit}
          className="absolute w-full h-1 appearance-none bg-transparent cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-[18px] [&::-webkit-slider-thumb]:h-[18px]
            [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white
            [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-blue-500
            [&::-webkit-slider-thumb]:shadow-[0_1px_4px_rgba(0,0,0,0.2)]
            [&::-webkit-slider-thumb]:cursor-pointer"
          style={{ zIndex: 4 }}
        />
      </div>
      <div className="flex justify-between mt-2 text-[10px] text-gray-400">
        <span>₹0</span>
        <span>₹1,00,000</span>
      </div>
    </div>
  );
}

// ─── Filter Section (collapsible) ─────────────────────────────────────────────
function FilterSection({
  title,
  count,
  children,
  defaultOpen = true,
}: {
  title: string;
  count?: number;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-100 dark:border-zinc-800">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex justify-between items-center w-full text-left py-3.5"
      >
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-bold text-gray-800 dark:text-gray-100">
            {title}
          </span>
          {count != null && count > 0 && (
            <span className="bg-blue-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full leading-none">
              {count}
            </span>
          )}
        </div>
        {open ? (
          <ChevronUp size={15} className="text-gray-400 flex-shrink-0" />
        ) : (
          <ChevronDown size={15} className="text-gray-400 flex-shrink-0" />
        )}
      </button>
      {open && <div className="pb-4">{children}</div>}
    </div>
  );
}

// ─── Checkbox Row (Flipkart style) ────────────────────────────────────────────
function CheckRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer group py-1">
      <div
        onClick={onChange}
        className={`w-4 h-4 rounded flex-shrink-0 border-2 flex items-center justify-center transition-all duration-150 ${
          checked
            ? "bg-blue-600 border-blue-600"
            : "border-gray-300 dark:border-zinc-600 group-hover:border-blue-400"
        }`}
      >
        {checked && (
          <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
            <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <span
        onClick={onChange}
        className={`text-[12px] select-none transition-colors ${
          checked
            ? "text-blue-600 dark:text-blue-400 font-semibold"
            : "text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white"
        }`}
      >
        {label}
      </span>
    </label>
  );
}

// ─── Filter Panel ─────────────────────────────────────────────────────────────
function FilterPanel({
  pending,
  setPending,
  onApply,
  onClear,
}: {
  pending: FilterState;
  setPending: (f: FilterState) => void;
  onApply: () => void;
  onClear: () => void;
}) {
  const toggle = (key: "brands" | "rams" | "storages", val: string) => {
    const arr = pending[key];
    setPending({
      ...pending,
      [key]: arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val],
    });
  };

  const hasActive =
    pending.brands.length > 0 ||
    pending.rams.length > 0 ||
    pending.storages.length > 0 ||
    pending.city !== "" ||
    pending.priceMin > 0 ||
    pending.priceMax < PRICE_MAX;

  return (
    <div className="flex flex-col h-full">
      {/* Panel Header */}
      <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-zinc-700 mb-1">
        <h2 className="text-[13px] font-bold text-gray-900 dark:text-white tracking-wide">
          Filters
        </h2>
        {hasActive && (
          <button
            onClick={onClear}
            className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Scrollable sections */}
      <div className="flex-1 overflow-y-auto">

        {/* Brand */}
        <FilterSection title="Brand" count={pending.brands.length}>
          <div className="space-y-0.5 max-h-52 overflow-y-auto pr-1">
            {TOP_BRANDS.map((b) => (
              <CheckRow
                key={b}
                label={b}
                checked={pending.brands.includes(b)}
                onChange={() => toggle("brands", b)}
              />
            ))}
          </div>
        </FilterSection>

        {/* Price */}
        <FilterSection
          title="Price Range"
          count={pending.priceMin > 0 || pending.priceMax < PRICE_MAX ? 1 : 0}
        >
          <PriceSlider
            min={pending.priceMin}
            max={pending.priceMax}
            onChange={(min, max) =>
              setPending({ ...pending, priceMin: min, priceMax: max })
            }
          />
        </FilterSection>

        {/* RAM */}
        <FilterSection title="RAM" count={pending.rams.length}>
          <div className="flex flex-wrap gap-2 pt-1">
            {RAM_OPTIONS.map((r) => (
              <button
                key={r}
                onClick={() => toggle("rams", r)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold border transition-all duration-150 ${
                  pending.rams.includes(r)
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white dark:bg-zinc-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-zinc-700 hover:border-blue-400 hover:text-blue-600"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </FilterSection>

        {/* Storage */}
        <FilterSection title="Internal Storage" count={pending.storages.length}>
          <div className="flex flex-wrap gap-2 pt-1">
            {ROM_OPTIONS.map((s) => (
              <button
                key={s}
                onClick={() => toggle("storages", s)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold border transition-all duration-150 ${
                  pending.storages.includes(s)
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white dark:bg-zinc-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-zinc-700 hover:border-blue-400 hover:text-blue-600"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </FilterSection>

        {/* City */}
        <FilterSection title="Location" count={pending.city ? 1 : 0} defaultOpen={false}>
          <div className="relative">
            <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="City or state..."
              value={pending.city}
              onChange={(e) => setPending({ ...pending, city: e.target.value })}
              className="w-full pl-8 pr-3 py-2 text-[12px] rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
            />
          </div>
        </FilterSection>
      </div>

      {/* Apply Button */}
      <div className="pt-3 mt-2 flex gap-2">
        {hasActive && (
          <button
            onClick={onClear}
            className="flex-1 border border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-gray-300 font-semibold text-[12px] py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all"
          >
            Reset
          </button>
        )}
        <button
          onClick={onApply}
          className="flex-1 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold text-[12px] py-2.5 rounded-xl transition-all shadow-md shadow-blue-500/20"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
}

// ─── Product Card ─────────────────────────────────────────────────────────────
function ProductCard({ product }: { product: any }) {
  return (
    <Link
      href={`/products/${product.id}`}
      className="group flex bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden transition-all duration-300
        border border-gray-100 dark:border-zinc-800
        shadow-[0_2px_8px_0_rgba(0,0,0,0.07),inset_0_1px_0_0_rgba(255,255,255,0.9),inset_0_-1px_0_0_rgba(0,0,0,0.04)]
        dark:shadow-[0_2px_12px_0_rgba(0,0,0,0.4),inset_0_1px_0_0_rgba(255,255,255,0.04),inset_0_-1px_0_0_rgba(0,0,0,0.3)]
        hover:shadow-[0_8px_24px_-4px_rgba(0,0,0,0.11),inset_0_1px_0_0_rgba(255,255,255,0.9),inset_0_-1px_0_0_rgba(0,0,0,0.04)]
        dark:hover:shadow-[0_8px_28px_-4px_rgba(0,0,0,0.6),inset_0_1px_0_0_rgba(255,255,255,0.05),inset_0_-1px_0_0_rgba(0,0,0,0.3)]
        hover:-translate-y-0.5"
    >
      {/* Image */}
      <div className="w-36 md:w-44 bg-[#f4f5f7] dark:bg-black/20 flex-shrink-0 flex items-center justify-center p-4 relative">
        <img
          src={product.images?.[0] || "/placeholder.png"}
          className="max-w-full max-h-full object-contain group-hover:scale-105 transition duration-500"
          alt={product.title}
        />
        {product.condition && (
          <span className="absolute top-2 left-2 bg-yellow-400 backdrop-blur-sm text-black text-[6px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-tight leading-tight">
            {product.condition}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 p-4 md:p-5 flex flex-col justify-between min-w-0">
        <div>
          <div className="flex justify-between items-start gap-2 mb-3">
            <h2 className="text-sm md:text-base font-bold text-gray-900 dark:text-white line-clamp-1 leading-tight">
              {product.title}
            </h2>
            <div className="flex-shrink-0 flex items-center gap-1 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-[8px] font-bold px-2 py-1 rounded-lg border border-green-100 dark:border-green-900/30 whitespace-nowrap">
              <Star size={8} className="fill-green-600 dark:fill-green-400" />
              BEST VALUE
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            {product.ram && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] md:text-[11px] font-medium bg-white/60 dark:bg-white/5 border border-white/60 dark:border-white/10 backdrop-blur-md shadow-[0_1px_4px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.8)] dark:shadow-[0_1px_4px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.05)] text-gray-700 dark:text-gray-200">
                <Smartphone size={9} className="text-blue-500" />
                {product.ram} RAM
              </div>
            )}
            {product.storage && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] md:text-[11px] font-medium bg-white/60 dark:bg-white/5 border border-white/60 dark:border-white/10 backdrop-blur-md shadow-[0_1px_4px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.8)] dark:shadow-[0_1px_4px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.05)] text-gray-700 dark:text-gray-200">
                <HardDrive size={9} className="text-purple-500" />
                {product.storage} ROM
              </div>
            )}
          </div>

          <div className="mt-3 flex items-center gap-3 flex-wrap">
            <p className="text-xl md:text-2xl font-bold text-black dark:text-white tracking-tight">
              ₹{product.price?.toLocaleString("en-IN")}
            </p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 shadow-[0_2px_8px_rgba(37,99,235,0.35)] border border-blue-400/30">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
                <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7L12 2z" fill="rgba(255,255,255,0.25)" stroke="white" strokeWidth="1.8" strokeLinejoin="round"/>
                <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-white font-bold" style={{ fontSize: "9px", letterSpacing: "0.04em" }}>
                BuyZze Assured
              </span>
            </div>
          </div>

          {product.description && (
            <p className="mt-1.5 text-[11px] md:text-xs text-gray-400 dark:text-gray-500 line-clamp-1 leading-relaxed">
              {product.description}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-gray-100 dark:border-zinc-800/60 pt-3 mt-3">
          <div className="flex items-center text-gray-400 text-[10px] font-medium uppercase tracking-wide">
            <MapPin size={11} className="mr-1 text-blue-500" />
            {product.city}, {product.state}
          </div>
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-1 bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-gray-400 text-[9px] font-medium px-2.5 py-1 rounded-full border border-gray-200 dark:border-zinc-700">
              <Calendar size={9} />
              {new Date(product.created_at).toLocaleDateString("en-GB")}
            </div>
            <span className="bg-blue-600 text-white text-[11px] font-semibold px-4 py-2 rounded-full hidden md:block group-hover:bg-black transition-colors shadow-md shadow-blue-500/20">
              View Details
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ─── Active Filter Chips ──────────────────────────────────────────────────────
function ActiveFilterChips({
  applied,
  onRemoveBrand,
  onRemoveRam,
  onRemoveStorage,
  onClearCity,
  onClearPrice,
}: {
  applied: FilterState;
  onRemoveBrand: (b: string) => void;
  onRemoveRam: (r: string) => void;
  onRemoveStorage: (s: string) => void;
  onClearCity: () => void;
  onClearPrice: () => void;
}) {
  const chips: { label: string; onRemove: () => void }[] = [
    ...applied.brands.map((b) => ({ label: b, onRemove: () => onRemoveBrand(b) })),
    ...applied.rams.map((r) => ({ label: `${r} RAM`, onRemove: () => onRemoveRam(r) })),
    ...applied.storages.map((s) => ({ label: `${s} ROM`, onRemove: () => onRemoveStorage(s) })),
    ...(applied.city ? [{ label: `📍 ${applied.city}`, onRemove: onClearCity }] : []),
    ...(applied.priceMin > 0 || applied.priceMax < PRICE_MAX
      ? [
          {
            label: `₹${applied.priceMin.toLocaleString("en-IN")} – ₹${applied.priceMax.toLocaleString("en-IN")}`,
            onRemove: onClearPrice,
          },
        ]
      : []),
  ];

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {chips.map((chip, i) => (
        <span
          key={i}
          className="inline-flex items-center gap-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-[11px] font-medium px-3 py-1.5 rounded-full border border-blue-100 dark:border-blue-800"
        >
          {chip.label}
          <button
            onClick={chip.onRemove}
            className="hover:text-red-500 transition-colors ml-0.5"
          >
            <X size={11} />
          </button>
        </span>
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q");
  const { setSearchQuery } = useSearch();

  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [pendingFilters, setPendingFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (query) setSearchQuery(query);

    const fetchResults = async () => {
      setLoading(true);
      const startTime = Date.now();
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .or(`title.ilike.%${query}%, brand.ilike.%${query}%, model.ilike.%${query}%`)
        .order("created_at", { ascending: false });

      const wait = Math.max(0, 1000 - (Date.now() - startTime));
      setTimeout(() => {
        if (!error) {
          setAllProducts(data || []);
          setFilteredProducts(data || []);
        }
        setLoading(false);
      }, wait);
    };

    fetchResults();
  }, [query, setSearchQuery]);

  const handleApply = useCallback(() => {
    setAppliedFilters(pendingFilters);
    setFilteredProducts(applyFilters(allProducts, pendingFilters));
    setDrawerOpen(false);
  }, [pendingFilters, allProducts]);

  const handleClear = useCallback(() => {
    setPendingFilters(DEFAULT_FILTERS);
    setAppliedFilters(DEFAULT_FILTERS);
    setFilteredProducts(allProducts);
    setDrawerOpen(false);
  }, [allProducts]);

  const removeAndApply = useCallback(
    (updated: FilterState) => {
      setPendingFilters(updated);
      setAppliedFilters(updated);
      setFilteredProducts(applyFilters(allProducts, updated));
    },
    [allProducts]
  );

  if (loading)
    return (
      <div className="max-w-[1200px] mx-auto px-4 py-10">
        <div className="flex gap-6">
          <div className="hidden md:block w-72 flex-shrink-0">
            <div className="h-[500px] bg-gray-100 dark:bg-zinc-900 rounded-2xl animate-pulse" />
          </div>
          <div className="flex-1 space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-44 bg-gray-100 dark:bg-zinc-900 rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );

  const activeCount = countActiveFilters(appliedFilters);

  return (
    // Roboto font — same as Flipkart & Cashify
    <div
      className="min-h-screen bg-[#f1f3f6] dark:bg-[#05080d] pb-20"
      style={{ fontFamily: "'Roboto', 'Segoe UI', Arial, sans-serif" }}
    >
      <div className="max-w-[1200px] mx-auto px-3 md:px-6 py-6">

        {/* Page Header */}
        <div className="mb-5 flex items-center justify-between">
          <p className="text-[13px] text-gray-500 dark:text-gray-400">
            Showing results for{" "}
            <span className="font-semibold text-gray-900 dark:text-white">
              "{query}"
            </span>{" "}
            <span className="text-gray-400">— {filteredProducts.length} products</span>
          </p>

          {/* Mobile Filter Button */}
          <button
            onClick={() => {
              setPendingFilters(appliedFilters);
              setDrawerOpen(true);
            }}
            className="md:hidden flex items-center gap-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-gray-200 text-[12px] font-semibold px-4 py-2 rounded-xl shadow-sm"
          >
            <SlidersHorizontal size={14} />
            Filters
            {activeCount > 0 && (
              <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                {activeCount}
              </span>
            )}
          </button>
        </div>

        {/* Sidebar + Results */}
        <div className="flex gap-5">

          {/* ── PC Sidebar ──────────────────────────────────────────── */}
          <aside className="hidden md:flex flex-col w-72 flex-shrink-0">
            <div
              className="sticky top-20 bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 overflow-hidden flex flex-col"
              style={{ maxHeight: "calc(100vh - 6rem)" }}
            >
              {/* Sidebar Header */}
              <div className="px-5 py-4 border-b border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/50">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal size={15} className="text-blue-600" />
                  <span className="text-[13px] font-bold text-gray-800 dark:text-gray-100 uppercase tracking-wide">
                    Filter By
                  </span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-5">
                <FilterPanel
                  pending={pendingFilters}
                  setPending={setPendingFilters}
                  onApply={handleApply}
                  onClear={handleClear}
                />
              </div>
            </div>
          </aside>

          {/* ── Results ─────────────────────────────────────────────── */}
          <div className="flex-1 min-w-0">
            <ActiveFilterChips
              applied={appliedFilters}
              onRemoveBrand={(b) =>
                removeAndApply({
                  ...appliedFilters,
                  brands: appliedFilters.brands.filter((x) => x !== b),
                })
              }
              onRemoveRam={(r) =>
                removeAndApply({
                  ...appliedFilters,
                  rams: appliedFilters.rams.filter((x) => x !== r),
                })
              }
              onRemoveStorage={(s) =>
                removeAndApply({
                  ...appliedFilters,
                  storages: appliedFilters.storages.filter((x) => x !== s),
                })
              }
              onClearCity={() => removeAndApply({ ...appliedFilters, city: "" })}
              onClearPrice={() =>
                removeAndApply({ ...appliedFilters, priceMin: 0, priceMax: PRICE_MAX })
              }
            />

            <div className="flex flex-col gap-4">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))
              ) : (
                <div className="text-center py-24 bg-white dark:bg-zinc-900 rounded-2xl border border-dashed border-gray-200 dark:border-zinc-800">
                  <SlidersHorizontal size={36} className="mx-auto text-gray-300 dark:text-zinc-700 mb-3" />
                  <p className="text-gray-500 font-semibold text-sm">
                    No products match your filters
                  </p>
                  <button
                    onClick={handleClear}
                    className="mt-4 text-blue-600 text-[12px] font-semibold hover:underline"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile Bottom Drawer ─────────────────────────────────────── */}
      {drawerOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setDrawerOpen(false)}
        />
      )}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white dark:bg-zinc-900 rounded-t-2xl shadow-2xl transition-transform duration-300 ease-out ${
          drawerOpen ? "translate-y-0" : "translate-y-full"
        }`}
        style={{
          maxHeight: "88vh",
          fontFamily: "'Roboto', 'Segoe UI', Arial, sans-serif",
        }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-200 dark:bg-zinc-700 rounded-full" />
        </div>

        {/* Drawer Header */}
        <div className="flex justify-between items-center px-5 py-3 border-b border-gray-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={15} className="text-blue-600" />
            <span className="text-[13px] font-bold text-gray-800 dark:text-gray-100">
              Filter By
            </span>
            {activeCount > 0 && (
              <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                {activeCount} active
              </span>
            )}
          </div>
          <button
            onClick={() => setDrawerOpen(false)}
            className="text-gray-400 hover:text-gray-700 dark:hover:text-white p-1"
          >
            <X size={20} />
          </button>
        </div>

        <div
          className="px-5 pb-6 pt-2 overflow-y-auto"
          style={{ maxHeight: "calc(88vh - 7rem)" }}
        >
          <FilterPanel
            pending={pendingFilters}
            setPending={setPendingFilters}
            onApply={handleApply}
            onClear={handleClear}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Page Export ──────────────────────────────────────────────────────────────
export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="p-10 text-center text-sm text-gray-500">
          Initialising...
        </div>
      }
    >
      <SearchResults />
    </Suspense>
  );
}
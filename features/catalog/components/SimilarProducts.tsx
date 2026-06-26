"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { MapPin, ChevronRight } from "lucide-react";

type Props = {
  productId: string | number;
  brand: string;
  category: string;
  price: number;
  city: string;
  state: string;
  pincode?: string;
};

// ── Theme Configurations for Sections ──
const THEMES = {
  emerald: {
    bg: "bg-gradient-to-br from-emerald-500 to-teal-700 dark:from-emerald-800 dark:to-teal-950",
    text: "text-white",
    subtitle: "text-emerald-100 dark:text-emerald-300",
    iconBg: "bg-white/20",
  },
  yellow: {
    bg: "bg-gradient-to-br from-[#FFD700] to-[#FF8C00] dark:from-amber-600 dark:to-orange-800",
    text: "text-neutral-900 dark:text-white",
    subtitle: "text-amber-900/80 dark:text-amber-200",
    iconBg: "bg-black/10 dark:bg-white/20",
  },
  maroon: {
    bg: "bg-gradient-to-br from-rose-700 to-red-600 dark:from-rose-900 dark:to-red-950",
    text: "text-white",
    subtitle: "text-rose-100 dark:text-rose-300",
    iconBg: "bg-white/20",
  }
};

// ── Horizontal Slider Row Component ──
function SliderRow({ 
  title, 
  subtitle, 
  items, 
  themeKey 
}: { 
  title: string, 
  subtitle: string, 
  items: any[], 
  themeKey: keyof typeof THEMES 
}) {
  const router = useRouter();
  if (!items || items.length === 0) return null;

  const theme = THEMES[themeKey];

  return (
    <div className={`relative rounded-2xl p-4 md:p-5 mb-6 overflow-hidden shadow-sm ${theme.bg}`}>
      {/* Background Texture/Blob */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl pointer-events-none" />
      
      {/* Section Header */}
      <div className="flex items-start justify-between mb-4 relative z-10">
        <div>
          <h3 className={`text-lg md:text-xl font-bold tracking-tight flex items-center gap-2 ${theme.text}`}>
            {title}
          </h3>
          <p className={`text-[11px] md:text-xs font-medium mt-0.5 ${theme.subtitle}`}>
            {subtitle}
          </p>
        </div>
        <button className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 backdrop-blur-sm transition-transform active:scale-95 ${theme.iconBg} ${theme.text}`}>
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Products Carousel - Fixed stretching issue here */}
      <div className="flex overflow-x-auto gap-3 snap-x snap-mandatory scrollbar-hide pb-2 relative z-10 items-stretch">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => { router.push(`/products/${item.id}`); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            className="snap-start shrink-0 w-[135px] md:w-[160px] h-full bg-white dark:bg-[#1a1a1a] rounded-xl shadow-[0_4px_16px_rgba(0,0,0,0.12)] overflow-hidden cursor-pointer hover:-translate-y-1 transition-transform duration-300 flex flex-col group border border-transparent dark:border-neutral-800"
          >
            {/* Image Box - Strictly locked to exact height and shrink-0 so it NEVER stretches vertically */}
            <div className="relative w-full h-[135px] md:h-[160px] shrink-0 bg-slate-50/80 dark:bg-[#111] p-3 flex items-center justify-center group-hover:bg-slate-100 dark:group-hover:bg-black transition-colors">
              <img
                src={item.images?.[0] || "/placeholder.png"}
                alt={item.title}
                className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal drop-shadow-sm group-hover:scale-105 transition-transform duration-300"
              />
              {item.condition && (
                <div className="absolute top-1.5 left-1.5 bg-white/95 dark:bg-neutral-800/95 backdrop-blur-md px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest text-neutral-800 dark:text-neutral-200 shadow-sm border border-neutral-200 dark:border-neutral-700">
                  {item.condition.split("-")[1] || item.condition}
                </div>
              )}
            </div>
            
            {/* Content Box */}
            <div className="p-2.5 flex-1 flex flex-col justify-between gap-2">
              <div>
                {item.brand && (
                  <p className="text-[9px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-0.5">
                    {item.brand}
                  </p>
                )}
                <p className="text-[12px] md:text-xs font-semibold text-neutral-800 dark:text-neutral-200 line-clamp-2 leading-snug">
                  {item.title}
                </p>
              </div>
              <div className="mt-1">
                <p className="text-[15px] md:text-base font-black text-neutral-900 dark:text-white tracking-tight">
                  ₹{Number(item.price).toLocaleString("en-IN")}
                </p>
                <div className="flex items-center gap-1 mt-1 text-[9px] font-medium text-neutral-500 dark:text-neutral-400">
                  <MapPin size={10} className="shrink-0" />
                  <span className="truncate">{item.city}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SimilarProducts({ productId, brand, category, price, city, state, pincode }: Props) {
  const [lists, setLists] = useState<{ sameCity: any[]; nearbyPrice: any[]; sameBrand: any[] }>({ sameCity: [], nearbyPrice: [], sameBrand: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSimilar = async () => {
      setLoading(true);
      try {
        const { data } = await supabase
          .from("products")
          .select("*")
          .eq("state", state)
          .neq("id", productId)
          .limit(100);

        const allItems = data || [];

        // 1. Same Exact City
        const sameCity = allItems.filter(i => i.city?.toLowerCase() === city?.toLowerCase()).slice(0, 8);

        // 2. Nearby Area (Pincode Prefix) + Similar Price (+/- 25%)
        const minPrice = price * 0.75;
        const maxPrice = price * 1.25;
        const pinPrefix = pincode ? String(pincode).substring(0, 2) : ""; 
        
        const nearbyPrice = allItems.filter(i => {
          if (i.city?.toLowerCase() === city?.toLowerCase()) return false;
          const isPriceNear = Number(i.price) >= minPrice && Number(i.price) <= maxPrice;
          const isNearLocation = pinPrefix && i.pincode ? String(i.pincode).startsWith(pinPrefix) : true;
          return isPriceNear && isNearLocation;
        }).slice(0, 8);

        // 3. Same Brand anywhere in state
        const sameBrand = allItems.filter(i => i.brand?.toLowerCase() === brand?.toLowerCase()).slice(0, 8);

        setLists({ sameCity, nearbyPrice, sameBrand });
      } catch (error) {
        console.error("Similar Products Error", error);
      } finally {
        setLoading(false);
      }
    };

    if (state) fetchSimilar();
    else setLoading(false);
  }, [productId, city, state, price, pincode, brand]);

  if (loading) {
    return (
      <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-hide">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="shrink-0 w-[135px] md:w-[160px] bg-white dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800 p-2 animate-pulse">
            <div className="w-full h-[120px] md:h-[145px] shrink-0 bg-neutral-100 dark:bg-neutral-800 rounded-lg mb-3" />
            <div className="h-2 w-1/3 bg-neutral-100 dark:bg-neutral-800 rounded-full mb-2" />
            <div className="h-3 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full mb-1" />
            <div className="h-3 w-2/3 bg-neutral-100 dark:bg-neutral-800 rounded-full mb-3" />
            <div className="h-4 w-1/2 bg-neutral-100 dark:bg-neutral-800 rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  const { sameCity, nearbyPrice, sameBrand } = lists;

  if (!sameCity.length && !nearbyPrice.length && !sameBrand.length) return (
    <div className="py-8 text-center bg-white dark:bg-[#111] rounded-2xl border border-neutral-100 dark:border-neutral-800/60 shadow-sm">
      <div className="w-12 h-12 bg-neutral-50 dark:bg-neutral-900 rounded-full flex items-center justify-center mx-auto mb-3">
        <MapPin size={20} className="text-neutral-400" />
      </div>
      <p className="text-sm font-bold text-neutral-900 dark:text-white">No exact matches nearby</p>
      <p className="text-xs text-neutral-500 mt-1">Check back later for new listings</p>
    </div>
  );

  return (
    <section className="-mx-1 md:mx-0 pt-2">
      {/* Box 1: Emerald/Teal Theme - Nearby Deals */}
      <SliderRow 
        title="Top Picks For You"
        subtitle={`Near ${city} · Under ₹${Math.round(price * 1.25).toLocaleString("en-IN")}`}
        items={nearbyPrice} 
        themeKey="emerald"
      />

      {/* Box 2: Yellow/Gold Theme - Same City Locals */}
      <SliderRow 
        title={`Popular in ${city}`}
        subtitle="Phones available in your local area"
        items={sameCity} 
        themeKey="yellow"
      />

      {/* Box 3: Maroon/Red Theme - Brand Lovers */}
      <SliderRow 
        title={`${brand} Fan Favorites`}
        subtitle={`More options from ${brand}`}
        items={sameBrand} 
        themeKey="maroon"
      />
    </section>
  );
}
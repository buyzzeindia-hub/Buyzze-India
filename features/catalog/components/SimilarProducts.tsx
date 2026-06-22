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

// ── Horizontal Slider Row Component ──
function SliderRow({ title, items, bgColorDark, bgColorLight }: { title: string, items: any[], bgColorDark: string, bgColorLight: string }) {
  const router = useRouter();
  if (!items || items.length === 0) return null;

  return (
    <div className={`rounded-2xl p-4 mb-5 border border-neutral-100 dark:border-neutral-800/50 ${bgColorLight} ${bgColorDark}`}>
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="text-sm font-bold text-neutral-900 dark:text-white">{title}</h3>
        <ChevronRight size={16} className="text-neutral-400" />
      </div>
      <div className="flex overflow-x-auto gap-3.5 snap-x snap-mandatory scrollbar-hide pb-2">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => { router.push(`/products/${item.id}`); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            className="snap-start shrink-0 w-[150px] md:w-[170px] bg-white dark:bg-[#111] rounded-2xl border border-neutral-200 dark:border-neutral-800/60 overflow-hidden cursor-pointer shadow-sm hover:shadow-md transition-all active:scale-[0.98] flex flex-col"
          >
            <div className="relative aspect-square bg-neutral-50 dark:bg-neutral-900 p-2 flex items-center justify-center">
              <img
                src={item.images?.[0] || "/placeholder.png"}
                alt={item.title}
                className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal"
              />
              {item.condition && (
                <div className="absolute top-2 left-2 bg-white/90 dark:bg-neutral-800/90 backdrop-blur-md px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 shadow-sm border border-neutral-200/50 dark:border-neutral-700/50">
                  {item.condition.split("-")[1] || item.condition}
                </div>
              )}
            </div>
            <div className="p-3 flex-1 flex flex-col justify-between">
              <div>
                {item.brand && <p className="text-[9px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-0.5">{item.brand}</p>}
                <p className="text-xs font-semibold text-neutral-900 dark:text-white line-clamp-2 leading-snug">{item.title}</p>
              </div>
              <div className="mt-2">
                <p className="text-base font-black text-neutral-900 dark:text-white mb-1.5">₹{Number(item.price).toLocaleString("en-IN")}</p>
                <div className="flex items-center gap-1 text-[10px] text-neutral-500 dark:text-neutral-400 font-medium">
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
        // Fetch products in same state for performance
        const { data } = await supabase
          .from("products")
          .select("*")
          .eq("state", state)
          .neq("id", productId)
          .limit(100);

        const allItems = data || [];

        // 1. Same Exact City
        const sameCity = allItems.filter(i => i.city?.toLowerCase() === city?.toLowerCase()).slice(0, 8);

        // 2. Nearby Area (Using Pincode Prefix 50-100km radius) + Similar Price (+/- 25%)
        const minPrice = price * 0.75;
        const maxPrice = price * 1.25;
        const pinPrefix = pincode ? String(pincode).substring(0, 2) : ""; 
        
        const nearbyPrice = allItems.filter(i => {
          if (i.city?.toLowerCase() === city?.toLowerCase()) return false; // Avoid showing same city twice
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
      <div className="flex overflow-x-auto gap-3.5 pb-2 scrollbar-hide">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="shrink-0 w-[150px] md:w-[170px] bg-neutral-50 dark:bg-neutral-800/30 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-2 animate-pulse">
            <div className="aspect-square bg-neutral-200 dark:bg-neutral-700/50 rounded-xl mb-3" />
            <div className="h-2 w-1/2 bg-neutral-200 dark:bg-neutral-700/50 rounded-full mb-2" />
            <div className="h-3 w-full bg-neutral-200 dark:bg-neutral-700/50 rounded-full mb-1" />
            <div className="h-3 w-3/4 bg-neutral-200 dark:bg-neutral-700/50 rounded-full mb-3" />
            <div className="h-4 w-1/2 bg-neutral-200 dark:bg-neutral-700/50 rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  const { sameCity, nearbyPrice, sameBrand } = lists;

  if (!sameCity.length && !nearbyPrice.length && !sameBrand.length) return (
    <div className="py-6 text-center bg-neutral-50 dark:bg-neutral-900/40 rounded-2xl border border-neutral-100 dark:border-neutral-800/60">
      <MapPin size={24} className="text-neutral-300 dark:text-neutral-600 mx-auto mb-2" />
      <p className="text-xs font-semibold text-neutral-400">No other phones listed nearby</p>
    </div>
  );

  return (
    <section className="-mx-1">
      {/* Box 1: Ultra Light Blue for Nearby Similar Priced */}
      <SliderRow 
        title={`Near ${city} under ₹${Math.round(price * 1.25).toLocaleString("en-IN")}`} 
        items={nearbyPrice} 
        bgColorLight="bg-blue-50/50" 
        bgColorDark="dark:bg-blue-900/10" 
      />

      {/* Box 2: Ultra Light Beige for Same City */}
      <SliderRow 
        title={`More phones in ${city}`} 
        items={sameCity} 
        bgColorLight="bg-stone-50" 
        bgColorDark="dark:bg-stone-900/10" 
      />

      {/* Box 3: Ultra Light Slate for Brand Alternatives */}
      <SliderRow 
        title={`More from ${brand}`} 
        items={sameBrand} 
        bgColorLight="bg-slate-50" 
        bgColorDark="dark:bg-neutral-800/30" 
      />
    </section>
  );
}
"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const BRANDS = [
  { name: "All", isAll: true },
  { name: "Apple", img: "/brand-apple.webp" },
  { name: "Samsung", img: "/brand-samsung.webp" },
  { name: "OnePlus", img: "/brand-oneplus.webp" },
  { name: "Xiaomi", img: "/brand-xiaomi.webp" },
  { name: "Vivo", img: "/brand-vivo.webp" },
  { name: "Oppo", img: "/brand-oppo.webp" },
  { name: "Realme", img: "/brand-realme.webp" },
  { name: "Google", img: "/brand-google.webp" },
  { name: "Motorola", img: "/brand-motorola.webp" },
  { name: "Nothing", img: "/brand-nothing.webp" },
  { name: "More", img: "/brand-more.webp" }, 
];

export default function BrandFilter({ activeBrand, setActiveBrand }: any) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [glowStyle, setGlowStyle] = useState({ left: 0, width: 0, opacity: 0 });

  // null = "All" mode, string = specific brand
  const currentActive = activeBrand ?? "All";

  useEffect(() => {
    if (containerRef.current) {
      const activeEl = containerRef.current.querySelector(`[data-brand="${currentActive}"]`) as HTMLElement;
      if (activeEl) {
        setGlowStyle({
          left: activeEl.offsetLeft,
          width: activeEl.offsetWidth,
          opacity: 1
        });
      }
    }
  }, [currentActive]);

  return (
    <section className="max-w-7xl mx-auto px-4 mt-8 mb-4">
      <div className="flex items-center justify-between mb-4 px-2">
        <h2 className="text-xs font-black uppercase tracking-widest text-gray-400">Shop by Brand</h2>
        <div className="h-[1px] flex-1 bg-gray-200 dark:bg-zinc-800 mx-4"></div>
      </div>

      <div className="relative">
        <div ref={containerRef} className="flex overflow-x-auto md:grid md:grid-cols-12 gap-4 py-4 pb-8 scrollbar-hide relative">
          
          {/* SLIDING YELLOW GLOW */}
          <div 
            className="absolute bottom-2 h-1.5 bg-yellow-400 rounded-full shadow-[0_0_15px_rgba(250,204,21,0.8)] transition-all duration-500 ease-out z-0 pointer-events-none"
            style={{ left: glowStyle.left, width: glowStyle.width, opacity: glowStyle.opacity }}
          />

          {BRANDS.map((brand) => {
            const isActive = currentActive === brand.name;
            return (
              <button
                key={brand.name}
                data-brand={brand.name}
                onClick={() => setActiveBrand(brand.isAll ? null : (isActive ? null : brand.name))} // "All" ya active brand pe click = null (reset)
                className={`group flex-shrink-0 w-[90px] h-[110px] rounded-[2rem] transition-all duration-500 flex flex-col items-center justify-center relative bg-white dark:bg-zinc-900 border z-10
                  ${isActive ? "border-yellow-400 shadow-[0_15px_30px_-5px_rgba(250,204,21,0.2)] -translate-y-2" : "border-gray-100 dark:border-zinc-800 shadow-[0_10px_20px_-10px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_30px_-10px_rgba(0,0,0,0.1)] hover:-translate-y-1"}`}
              >
                {brand.isAll ? (
                  <span className={`text-sm font-black uppercase tracking-widest ${isActive ? "text-gray-900 dark:text-white" : "text-gray-400"}`}>
                    ALL
                  </span>
                ) : (
                  <>
                    <div className="relative w-12 h-12 mb-2 p-2 rounded-xl bg-gray-50 dark:bg-zinc-800 transition-transform duration-500 group-hover:scale-110 flex items-center justify-center">
                      <Image src={brand.img!} alt={brand.name} fill className="object-contain p-1" />
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-tighter ${isActive ? "text-gray-900 dark:text-white" : "text-gray-400"}`}>
                      {brand.name}
                    </span>
                  </>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
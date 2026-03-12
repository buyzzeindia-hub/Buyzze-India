"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";

/**
 * BUYZZE PREMIUM BRAND SLIDER - V5.0
 * Features: 3s Auto-slide | Touch Swipe Enabled | No Buttons | Mobile Optimized
 */

const SLIDES = [
  {
    id: 1,
    brand: "Apple",
    logo: "/logos/apple.svg",
    badge: "PRE-OWNED IPHONES",
    title: "iPhone Excellence",
    highlight: "Unmatched Value.",
    sub: "Get the iconic iPhone experience at a fraction of the cost. Thoroughly tested for performance.",
    cta: "Explore iPhones",
    href: "/search?brand=apple",
    img: "/apple-brand.webp",
    layout: "right",
    theme: {
      bg: "radial-gradient(circle at 20% 30%, #1a1a1a 0%, #000 100%)",
      accent: "#ffffff",
      pattern: "mesh",
    }
  },
  {
    id: 2,
    brand: "Samsung",
    logo: "/logos/samsung.svg",
    badge: "GALAXY SERIES",
    title: "Galaxy Innovation",
    highlight: "Display That Inspires.",
    sub: "From S-series flagships to multitasking Note models. Quality checked used Galaxy devices.",
    cta: "Shop Galaxy",
    href: "/search?brand=samsung",
    img: "/samsung-brand.webp",
    layout: "left",
    theme: {
      bg: "linear-gradient(135deg, #fdfbf7 0%, #e3dcd2 100%)", // Premium Beige Gradient
      accent: "#b5a38c", // Darker Beige Accent
      pattern: "grid",
      darkText: true // Added for visibility on light beige background
    }
  },
  {
    id: 3,
    brand: "Google",
    logo: "/logos/google.svg",
    badge: "PIXEL LINEUP",
    title: "Pure Android",
    highlight: "The Best of Google AI.",
    sub: "Experience the cleanest software and top-tier photography with our verified Pixel collection.",
    cta: "View Pixels",
    href: "/search?brand=google",
    img: "/google-brand.webp",
    layout: "right",
    theme: {
      bg: "linear-gradient(135deg, #f1f5f9 0%, #cbd5e1 100%)",
      accent: "#4285f4",
      pattern: "dots",
      darkText: true
    }
  },
  {
    id: 4,
    brand: "Vivo",
    logo: "/logos/vivo.svg",
    badge: "V-SERIES SPECIAL",
    title: "Portrait Masters",
    highlight: "Style Meets Camera.",
    sub: "Aura Light and Zeiss optics now more affordable. Slim designs, tested for durability.",
    cta: "Browse Vivo",
    href: "/search?brand=vivo",
    img: "/vivo-brand.webp",
    layout: "left",
    theme: {
      bg: "linear-gradient(160deg, #003366 0%, #00b4db 100%)",
      accent: "#ffffff",
      pattern: "waves",
    }
  },
  {
    id: 5,
    brand: "Xiaomi",
    logo: "/logos/xiaomi.svg",
    badge: "REDMI & MI",
    title: "Power Packed",
    highlight: "Specs That Matter.",
    sub: "The best hardware-to-price ratio. Discover used Xiaomi phones that still lead the pack.",
    cta: "Explore Xiaomi",
    href: "/search?brand=xiaomi",
    img: "/xiaomi-brand.webp",
    layout: "right",
    theme: {
      bg: "linear-gradient(135deg, #ff6700 0%, #e65d00 100%)",
      accent: "#ffffff",
      pattern: "diagonal",
    }
  },
  {
    id: 6,
    brand: "CMF",
    logo: "/logos/cmf.svg",
    badge: "NOTHING ECOSYSTEM",
    title: "CMF by Nothing",
    highlight: "Unique by Design.",
    sub: "Fresh aesthetic, clean OS. A modern used smartphone for those who want to stand out.",
    cta: "Shop CMF",
    href: "/search?brand=cmf",
    img: "/cmf-brand.webp",
    layout: "left",
    theme: {
      bg: "linear-gradient(135deg, #f43f5e 0%, #9f1239 100%)",
      accent: "#000000",
      pattern: "minimal",
    }
  }
];

const Pattern = ({ type, accent }: { type: string, accent: string }) => {
  switch (type) {
    case "mesh":
      return (
        <div className="absolute inset-0 opacity-25 pointer-events-none">
          <div className="absolute -top-20 -left-20 w-[500px] h-[500px] blur-[140px] rounded-full" style={{ background: accent }} />
        </div>
      );
    case "grid":
      return (
        <div className="absolute inset-0 opacity-[0.08] pointer-events-none" 
          style={{ backgroundImage: `linear-gradient(${accent} 1px, transparent 1px), linear-gradient(90deg, ${accent} 1px, transparent 1px)`, backgroundSize: '45px 45px' }} 
        />
      );
    case "dots":
      return (
        <div className="absolute inset-0 opacity-[0.18] pointer-events-none" 
          style={{ backgroundImage: `radial-gradient(${accent} 2.5px, transparent 2.5px)`, backgroundSize: '28px 28px' }} 
        />
      );
    case "waves":
      return (
        <div className="absolute inset-0 opacity-15 pointer-events-none overflow-hidden">
          <svg className="absolute bottom-0 w-full h-56 animate-pulse" viewBox="0 0 1440 320">
            <path fill={accent} d="M0,224L120,213.3C240,203,480,181,720,186.7C960,192,1200,224,1320,218.7L1440,128L1440,320L1320,320C1200,320,960,320,720,320C480,320,240,320,120,320L0,320Z"></path>
          </svg>
        </div>
      );
    default:
      return null;
  }
};

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const next = useCallback(() => setCurrent((prev) => (prev + 1) % SLIDES.length), []);
  const prev = useCallback(() => setCurrent((prev) => (prev - 1 + SLIDES.length) % SLIDES.length), []);

  // --- 3 Second Auto Slide Logic ---
  useEffect(() => {
    if (!paused) {
      timerRef.current = setInterval(next, 3000); // 3 Seconds
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [next, paused]);

  // --- Touch Swipe Logic ---
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
    setPaused(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) next();
    if (isRightSwipe) prev();

    setTouchStart(null);
    setTouchEnd(null);
    setPaused(false);
  };

  return (
    <section className="w-full max-w-[1440px] mx-auto px-0 sm:px-4 py-2 sm:py-6 overflow-hidden">
      <div 
        className="relative group sm:rounded-[2.5rem] overflow-hidden bg-zinc-950 shadow-2xl"
        style={{ height: "clamp(600px, 85vh, 700px)" }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {SLIDES.map((slide, i) => {
          const isActive = current === i;
          const isRight = slide.layout === "right";
          const { theme } = slide;

          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-all duration-700 ease-[cubic-bezier(0.23, 1, 0.32, 1)] flex flex-col md:flex-row
                ${isActive ? "opacity-100 scale-100 translate-x-0" : "opacity-0 scale-105 pointer-events-none"}`}
              style={{ 
                background: theme.bg,
                transform: isActive ? "translateX(0%)" : i < current ? "translateX(-10%)" : "translateX(10%)"
              }}
            >
              <Pattern type={theme.pattern} accent={theme.accent} />

              <div className={`relative z-10 w-full h-full flex flex-col md:flex-row items-center justify-between
                ${isRight ? "md:flex-row" : "md:flex-row-reverse"}`}>
                
                <div className="relative w-full md:w-[65%] h-[55%] md:h-full flex items-center justify-center p-4 md:p-10">
                  <div className={`relative w-full h-full transition-all duration-1000 delay-200 
                    ${isActive ? "translate-y-0 opacity-100 scale-100" : "translate-y-12 opacity-0 scale-90"}`}>
                    <Image
                      src={slide.img}
                      alt={slide.brand}
                      fill
                      className="object-contain drop-shadow-[0_40px_80px_rgba(0,0,0,0.6)]"
                      priority={i === 0}
                      sizes="(max-width: 768px) 100vw, 65vw"
                    />
                  </div>
                </div>

                <div className="w-full md:w-[35%] flex flex-col items-center md:items-start text-center md:text-left px-8 md:pl-16 md:pr-4 pb-12 md:pb-0">
                  <div className="flex items-center gap-4 mb-6">
                    <img 
                      src={slide.logo} 
                      alt={slide.brand} 
                      className={`h-8 md:h-12 object-contain ${theme.darkText ? "brightness-0" : "brightness-0 invert"}`} 
                    />
                    <span className={`px-4 py-1.5 rounded-lg text-[10px] md:text-xs font-black tracking-widest uppercase border backdrop-blur-md
                      ${theme.darkText ? "border-black/10 bg-black/5 text-black" : "border-white/20 bg-white/10 text-white"}`}>
                      {slide.badge}
                    </span>
                  </div>

                  <div className={`space-y-3 mb-8 ${theme.darkText ? "text-zinc-900" : "text-white"}`}>
                    <h1 className="font-black leading-[0.9] tracking-tighter" style={{ fontSize: "clamp(32px, 5.5vw, 72px)" }}>
                      {slide.title}
                    </h1>
                    <h2 className="font-bold tracking-tight opacity-90" style={{ fontSize: "clamp(18px, 3.2vw, 38px)", color: theme.accent }}>
                      {slide.highlight}
                    </h2>
                  </div>

                  <p className={`text-sm md:text-lg font-medium leading-relaxed max-w-sm mb-10 opacity-70 ${theme.darkText ? "text-zinc-800" : "text-zinc-200"}`}>
                    {slide.sub}
                  </p>

                  <div className="flex flex-wrap items-center gap-5">
                    <Link
                      href={slide.href}
                      className={`px-10 py-4 md:px-12 md:py-5 rounded-full font-black text-sm md:text-base transition-all hover:scale-105 active:scale-95 shadow-2xl
                        ${theme.darkText ? "bg-black text-white" : "bg-white text-black"}`}
                    >
                      {slide.cta}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* --- PROGRESS DOTS (No Buttons version) --- */}
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2">
          {SLIDES.map((_, i) => (
            <button 
              key={i} 
              onClick={() => setCurrent(i)} 
              className="h-1 rounded-full bg-white/20 transition-all duration-500 overflow-hidden" 
              style={{ width: current === i ? "40px" : "8px" }}
            >
              {current === i && <div className="h-full bg-white animate-slide-progress" />}
            </button>
          ))}
        </div>

        {/* --- TRUST STRIP --- */}
        <div className="absolute bottom-0 inset-x-0 bg-black/40 backdrop-blur-xl z-20 border-t border-white/5 py-3 md:py-4">
           <div className="flex justify-evenly items-center w-full max-w-4xl mx-auto px-2">
              <div className="flex items-center gap-1 md:gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                <span className="text-[9px] md:text-[11px] font-black text-white/60 tracking-wider uppercase whitespace-nowrap">Verified Sellers</span>
              </div>
              <div className="h-3 w-[1px] bg-white/10" />
              <div className="flex items-center gap-1 md:gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
                <span className="text-[9px] md:text-[11px] font-black text-white/60 tracking-wider uppercase whitespace-nowrap">No Scam</span>
              </div>
              <div className="h-3 w-[1px] bg-white/10" />
              <div className="flex items-center gap-1 md:gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
                <span className="text-[9px] md:text-[11px] font-black text-white/60 tracking-wider uppercase whitespace-nowrap">100% Secured</span>
              </div>
           </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideProgress {
          from { width: 0%; }
          to { width: 100%; }
        }
        .animate-slide-progress {
          animation: slideProgress 3s linear forwards;
        }
      `}</style>
    </section>
  );
}
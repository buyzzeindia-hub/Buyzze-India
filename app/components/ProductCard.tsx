"use client";
import Link from "next/link";
import Image from "next/image";
import { MapPin, HardDrive, Cpu, Calendar, ShieldCheck } from "lucide-react";
import FavoriteButton from "@/components/FavoriteButton";

// Condition badge — always yellow bg, black text
function conditionStyle() {
  return { bg: "bg-yellow-400", text: "text-black", dot: "bg-black/40" };
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const then = new Date(dateStr);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return then.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: diffDays > 365 ? "numeric" : undefined });
}

export default function ProductCard({ product }: { product: any }) {
  const condition = product.condition || "";
  const cs = conditionStyle();
  const posted = timeAgo(product.created_at);

  // Description — trim to ~80 chars
  const desc = product.description
    ? product.description.length > 80
      ? product.description.slice(0, 78) + "…"
      : product.description
    : null;

  return (
    <div className="relative group h-full">
      {/* Favorite Button — sits above the Link */}
      <div className="absolute top-2.5 right-2.5 z-20">
        <FavoriteButton productId={product.id} />
      </div>

      <Link
        href={`/products/${product.id}`}
        className="flex flex-col h-full bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden
          border border-gray-100 dark:border-zinc-800
          shadow-[0_2px_8px_rgba(0,0,0,0.06)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.3)]
          hover:shadow-[0_12px_32px_rgba(0,0,0,0.13)] dark:hover:shadow-[0_12px_32px_rgba(0,0,0,0.5)]
          hover:-translate-y-[3px] transition-all duration-300 group"
      >
        {/* ── IMAGE AREA ── */}
        <div className="relative w-full bg-gray-50 dark:bg-zinc-800 overflow-hidden"
          style={{ aspectRatio: "4/3" }}>

          {/* Watermark blocker overlay — prevents right-click save & hides watermarks via mix-blend */}
          <div className="absolute inset-0 z-10 pointer-events-none"
            style={{ mixBlendMode: "multiply", background: "transparent" }} />

          <Image
            src={product.images?.[0] || "/placeholder-phone.webp"}
            alt={product.title}
            fill
            className="object-contain p-2 transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            priority={false}
            onContextMenu={(e) => e.preventDefault()}
            style={{ userSelect: "none", WebkitUserDrag: "none" } as React.CSSProperties}
          />

          {/* Condition badge */}
          {condition && (
            <div className={`absolute top-2.5 left-2.5 z-20 flex items-center gap-1.5 
              ${cs.bg} ${cs.text}
              text-[10px] font-bold px-2.5 py-1 rounded-full
              border border-current/20 backdrop-blur-sm uppercase tracking-wide`}>
              <span className={`w-1.5 h-1.5 rounded-full ${cs.dot} flex-shrink-0`} />
              {condition}
            </div>
          )}

          {/* BuYzze Assured badge */}
          {product.is_assured && (
            <div className="absolute bottom-2.5 left-2.5 z-20 flex items-center gap-1
              bg-blue-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
              <ShieldCheck size={9} />
              BuYzze Assured
            </div>
          )}
        </div>

        {/* ── CONTENT ── */}
        <div className="flex flex-col flex-grow p-3.5 gap-1.5">

          {/* Price */}
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
              ₹{product.price.toLocaleString("en-IN")}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-[13px] font-semibold text-gray-800 dark:text-zinc-200 line-clamp-1
            group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {product.title}
          </h3>

          {/* Description */}
          {desc && (
            <p className="text-[10px] text-gray-400 dark:text-zinc-600 line-clamp-1 leading-relaxed">
              {desc}
            </p>
          )}

          {/* RAM / ROM chips */}
          {(product.ram || product.storage) && (
            <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
              {product.ram && (
                <span className="flex items-center gap-1 bg-gray-100 dark:bg-zinc-800
                  text-gray-600 dark:text-zinc-400 text-[10px] font-semibold
                  px-2 py-0.5 rounded-md">
                  <Cpu size={9} className="flex-shrink-0" />
                  {product.ram} RAM
                </span>
              )}
              {product.storage && (
                <span className="flex items-center gap-1 bg-gray-100 dark:bg-zinc-800
                  text-gray-600 dark:text-zinc-400 text-[10px] font-semibold
                  px-2 py-0.5 rounded-md">
                  <HardDrive size={9} className="flex-shrink-0" />
                  {product.storage}
                </span>
              )}
            </div>
          )}

          {/* Footer — location + date */}
          <div className="mt-auto pt-2.5 border-t border-gray-100 dark:border-zinc-800/60
            flex items-center justify-between gap-2">

            <div className="flex items-center gap-1 text-gray-500 dark:text-zinc-500
              text-[10.5px] font-medium truncate min-w-0">
              <MapPin size={11} className="flex-shrink-0 text-blue-500" />
              <span className="truncate">{product.city}{product.state ? `, ${product.state}` : ""}</span>
            </div>

            <div className="flex items-center gap-1 flex-shrink-0
              text-[10.5px] font-semibold text-gray-400 dark:text-zinc-500
              bg-gray-50 dark:bg-zinc-800 px-2 py-0.5 rounded-md">
              <Calendar size={9} className="flex-shrink-0" />
              {posted}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
// components/LocalFeedSection.tsx
// ─────────────────────────────────────────────────────────────
// Drop-in replacement for any product grid on home page
// Uses useLocalFeed internally — no "Near You" badge, feels organic
// ─────────────────────────────────────────────────────────────
"use client";

import { useLocalFeed } from "@/hooks/useLocalFeed";
import FavoriteButton from "@/components/FavoriteButton";
import Link from "next/link";
import Image from "next/image";
import { MapPin, ShieldCheck, Clock, Cpu, HardDrive } from "lucide-react";

interface Props {
  title?: string;
  limit?: number;
  category?: string;
}

// ─── Shared Logic for Card ──────────────────────────────────────────────────
function conditionStyle(condition: string) {
  const c = condition.toLowerCase();
  if (c.includes("excellent")) return { bg: "rgba(59,130,246,0.1)",  color: "#1d4ed8", border: "rgba(59,130,246,0.2)" };
  if (c.includes("good"))      return { bg: "rgba(34,197,94,0.1)",   color: "#16a34a", border: "rgba(34,197,94,0.2)" };
  if (c.includes("fair"))      return { bg: "rgba(234,179,8,0.1)",   color: "#a16207", border: "rgba(234,179,8,0.2)" };
  return                               { bg: "rgba(0,0,0,0.05)",      color: "#6b7280", border: "rgba(0,0,0,0.1)" };
}

const BRAND_BG: Record<string, string> = {
  apple:    "#f3f4f6",
  samsung:  "#eff6ff",
  oneplus:  "#fff1f2",
  xiaomi:   "#f0f9ff",
  vivo:     "#f0f9ff",
  oppo:     "#ecfdf5",
  realme:   "#fefce8",
  google:   "#eff6ff",
  motorola: "#faf5ff",
  nothing:  "#f3f4f6",
  nokia:    "#f0fdf4",
  poco:     "#fff7ed",
};

function getBrandBg(brand?: string) {
  if (!brand) return "#f3f4f6";
  return BRAND_BG[brand.toLowerCase()] || "#f3f4f6";
}

function timeAgo(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

// ─── Inline ProductCard Component ───────────────────────────────────────────
function ProductCard({ product }: { product: any }) {
  const timeLabel = timeAgo(product.created_at);
  const cStyle = product.condition ? conditionStyle(product.condition) : null;

  return (
    <div className="relative group">
      <div className="absolute top-3 right-3 z-20">
        <FavoriteButton productId={product.id} size="sm" />
      </div>

      {/* Sold/Expired Overlay */}
      {product.status && product.status !== 'active' && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 30,
          background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(2px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderRadius: 20, pointerEvents: 'none'
        }}>
          <span style={{
            background: product.status === 'sold' ? '#ef4444' : '#6b7280',
            color: 'white', padding: '6px 16px', borderRadius: 8,
            fontSize: 14, fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)', transform: 'rotate(-10deg)'
          }}>
            {product.status === 'sold' ? 'Sold Out' : 'Expired'}
          </span>
        </div>
      )}

      <Link
        href={`/products/${product.id}`}
        style={{
          display: "flex", gap: 16,
          background: "#ffffff",
          backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
          borderRadius: 20, border: "1px solid rgba(255,255,255,0.13)",
          padding: 14,
          boxShadow: "0 4px 24px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.1)",
          transition: "all 0.25s ease", textDecoration: "none",
        }}
        onMouseEnter={e => {
          const el = e.currentTarget as HTMLElement;
          el.style.background = "#f8fafc";
          el.style.transform = "translateY(-2px)";
          el.style.boxShadow = "0 8px 24px rgba(0,0,0,0.1)";
        }}
        onMouseLeave={e => {
          const el = e.currentTarget as HTMLElement;
          el.style.background = "#ffffff";
          el.style.transform = "translateY(0)";
          el.style.boxShadow = "0 2px 12px rgba(0,0,0,0.07)";
        }}
      >
        {/* Image */}
        <div style={{
          width: 112, height: 112, borderRadius: 14, flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          overflow: "hidden", background: getBrandBg(product.brand),
          border: "1px solid rgba(0,0,0,0.06)", position: "relative",
        }}>
          <Image
            src={product.images?.[0] || "/placeholder.png"}
            alt={product.title}
            width={96} height={96}
            className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
            style={{ userSelect: "none" }}
            onContextMenu={e => e.preventDefault()}
          />
          <div style={{
            position: "absolute", inset: 0, borderRadius: 14, pointerEvents: "none",
            background: "none",
          }} />
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 4 }}>
              <div>
                {product.brand && (
                  <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "#2563eb", marginBottom: 2 }}>
                    {product.brand}
                  </p>
                )}
                <h3 style={{
                  fontSize: 14, fontWeight: 600, color: "#111827", lineHeight: 1.35,
                  display: "-webkit-box", WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical", overflow: "hidden",
                }}>
                  {product.title}
                </h3>
              </div>
              {cStyle && product.condition && (
                <span style={{
                  flexShrink: 0, fontSize: 9, fontWeight: 700, padding: "3px 8px",
                  borderRadius: 20, textTransform: "uppercase", letterSpacing: "0.06em",
                  backgroundColor: cStyle.bg, color: cStyle.color, border: `1px solid ${cStyle.border}`,
                }}>
                  {product.condition}
                </span>
              )}
            </div>

            {(product.ram || product.storage) && (
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 6 }}>
                {product.ram && (
                  <span style={{
                    display: "flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 600,
                    padding: "2px 8px", borderRadius: 20,
                    background: "rgba(37,99,235,0.08)", color: "#2563eb", border: "1px solid rgba(37,99,235,0.15)",
                  }}>
                    <Cpu size={8} />{product.ram} RAM
                  </span>
                )}
                {product.storage && (
                  <span style={{
                    display: "flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 600,
                    padding: "2px 8px", borderRadius: 20,
                    background: "rgba(124,58,237,0.08)", color: "#7c3aed", border: "1px solid rgba(124,58,237,0.15)",
                  }}>
                    <HardDrive size={8} />{product.storage}
                  </span>
                )}
              </div>
            )}
          </div>

          <div>
            <p style={{
              fontSize: 20, fontWeight: 900, color: "#111827", letterSpacing: "-0.5px", marginTop: 8,
              
            }}>
              ₹{product.price?.toLocaleString("en-IN")}
            </p>

            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              marginTop: 6, paddingTop: 6, borderTop: "1px solid rgba(0,0,0,0.07)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 4, color: "rgba(0,0,0,0.5)" }}>
                  <MapPin size={10} />
                  <span style={{ fontSize: 10, maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {product.city}
                  </span>
                </div>
                {product.is_assured && (
                  <div style={{
                    display: "flex", alignItems: "center", gap: 3,
                    background: "rgba(22,163,74,0.08)", border: "1px solid rgba(22,163,74,0.2)",
                    borderRadius: 6, padding: "2px 6px",
                  }}>
                    <ShieldCheck size={9} style={{ color: "#16a34a" }} />
                    <span style={{ fontSize: 9, fontWeight: 700, color: "#16a34a" }}>Assured</span>
                  </div>
                )}
              </div>
              <div style={{
                display: "flex", alignItems: "center", gap: 4,
                background: "#ffffff", borderRadius: 8,
                padding: "3px 8px", border: "1px solid rgba(255,255,255,0.1)",
              }}>
                <Clock size={9} style={{ color: "rgba(0,0,0,0.4)" }} />
                <span style={{ fontSize: 10, fontWeight: 600, color: "rgba(0,0,0,0.45)" }}>{timeLabel}</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

// ─── Main Export ────────────────────────────────────────────────────────────
export default function LocalFeedSection({
  title,
  limit = 40,
  category,
}: Props) {
  const { products, loading } = useLocalFeed({ limit, category });

  if (loading) return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="aspect-[3/4] rounded-2xl bg-gray-100 dark:bg-gray-900 animate-pulse" />
      ))}
    </div>
  );

  if (!products.length) return null;

  return (
    <section>
      {title && (
        <h2 className="text-lg font-black mb-4 tracking-tight">{title}</h2>
      )}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
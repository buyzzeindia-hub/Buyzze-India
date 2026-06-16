"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import FavoriteButton from "@/components/FavoriteButton";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Search, ShieldCheck, Clock, ArrowLeft, SlidersHorizontal, Cpu, HardDrive } from "lucide-react";

const FONT = "'Roboto', 'Segoe UI', system-ui, sans-serif";

// Condition color coding — same logic
function conditionStyle(condition: string) {
  const c = condition.toLowerCase();
  if (c.includes("excellent")) return { bg: "rgba(59,130,246,0.1)",  color: "#1d4ed8", border: "rgba(59,130,246,0.2)" };
  if (c.includes("good"))      return { bg: "rgba(34,197,94,0.1)",   color: "#16a34a", border: "rgba(34,197,94,0.2)" };
  if (c.includes("fair"))      return { bg: "rgba(234,179,8,0.1)",   color: "#a16207", border: "rgba(234,179,8,0.2)" };
  return                               { bg: "rgba(0,0,0,0.05)",      color: "#6b7280", border: "rgba(0,0,0,0.1)" };
}

// Brand image bg — dark tones for green bg contrast
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

// ─── Product Card ──────────────────────────────────────────────────────────────
function ProductCard({ product }: { product: any }) {
  const timeLabel = timeAgo(product.created_at);
  const cStyle = product.condition ? conditionStyle(product.condition) : null;

  return (
    <div className="relative group">
      <div className="absolute top-3 right-3 z-20">
        <FavoriteButton productId={product.id} size="sm" />
      </div>

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

// ─── Sort options ──────────────────────────────────────────────────────────────
const SORT_OPTIONS = [
  { label: "Newest First",      value: "newest"     },
  { label: "Price: Low → High", value: "price_asc"  },
  { label: "Price: High → Low", value: "price_desc" },
];

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function RecentlyAddedPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");
  const [sort,     setSort]     = useState("newest");
  const [showSort, setShowSort] = useState(false);

  // ── same fetch logic ──
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

  // ── same filter logic ──
  const filtered = products.filter(p => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (p.title || "").toLowerCase().includes(q) ||
      (p.brand || "").toLowerCase().includes(q) ||
      (p.city  || "").toLowerCase().includes(q)
    );
  });

  // ── same sort logic ──
  const sorted = [...filtered].sort((a, b) => {
    if (sort === "price_asc")  return (a.price || 0) - (b.price || 0);
    if (sort === "price_desc") return (b.price || 0) - (a.price || 0);
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <main style={{ minHeight: "100vh", fontFamily: FONT, background: "linear-gradient(135deg, #fefce8 0%, #fef9c3 100%)", position: "relative" }}>

      {/* Minimal Dotted Texture */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, opacity: 1,
        backgroundImage: "radial-gradient(rgba(0,0,0,0.04) 1px, transparent 1px)",
        backgroundSize: "24px 24px"
      }} />

      {/* ── Sticky Header ── */}
      <div style={{
        position: "sticky", top: 0, zIndex: 40,
        background: "rgba(255,255,255,0.92)",
        backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(234,179,8,0.15)",
        boxShadow: "0 2px 16px rgba(0,0,0,0.04)",
      }}>
        <div style={{ maxWidth: 768, margin: "0 auto", padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/" style={{
            width: 34, height: 34, borderRadius: "50%",
            background: "rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.08)",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0, textDecoration: "none",
          }}>
            <ArrowLeft size={15} color="#374151" />
          </Link>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
              <h1 style={{ fontSize: 17, fontWeight: 800, color: "#111827", letterSpacing: "-0.3px", margin: 0 }}>
                Recently Added
              </h1>
              <span style={{
                display: "flex", alignItems: "center", gap: 4,
                background: "linear-gradient(135deg, #ec4899, #a855f7)",
                color: "#ffffff", fontSize: 9, fontWeight: 800,
                padding: "3px 8px", borderRadius: 20,
              }}>
                <Clock size={8} /> Last 7 days
              </span>
            </div>
            {!loading && (
              <p style={{ fontSize: 11, color: "rgba(0,0,0,0.45)", margin: 0 }}>
                {sorted.length} product{sorted.length !== 1 ? "s" : ""} found
              </p>
            )}
          </div>
        </div>

        {/* Search + Sort */}
        <div style={{ maxWidth: 768, margin: "0 auto", padding: "0 16px 12px", display: "flex", gap: 8 }}>
          <div style={{
            flex: 1, display: "flex", alignItems: "center", gap: 8,
            background: "rgba(255,255,255,0.4)", border: "1px solid rgba(0,0,0,0.08)",
            borderRadius: 14, padding: "10px 14px",
          }}>
            <Search size={13} color="rgba(0,0,0,0.4)" style={{ flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Search by name, brand, city..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                flex: 1, background: "transparent", border: "none", outline: "none",
                fontSize: 13, color: "#111827", fontFamily: FONT,
              }}
            />
            {search && (
              <button onClick={() => setSearch("")}
                style={{ color: "rgba(0,0,0,0.4)", background: "none", border: "none", cursor: "pointer", fontSize: 13 }}>
                ✕
              </button>
            )}
          </div>

          <div style={{ position: "relative" }}>
            <button
              onClick={() => setShowSort(!showSort)}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                background: "rgba(255,255,255,0.4)", border: "1px solid rgba(0,0,0,0.08)",
                borderRadius: 14, padding: "10px 14px",
                fontSize: 12, fontWeight: 600, color: "rgba(0,0,0,0.55)",
                cursor: "pointer", fontFamily: FONT,
              }}
            >
              <SlidersHorizontal size={12} /> Sort
            </button>
            {showSort && (
              <div style={{
                position: "absolute", right: 0, top: 46,
                background: "#ffffff", border: "1px solid rgba(0,0,0,0.08)",
                borderRadius: 14, boxShadow: "0 16px 40px rgba(0,0,0,0.08)",
                zIndex: 50, minWidth: 180, overflow: "hidden",
              }}>
                {SORT_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => { setSort(opt.value); setShowSort(false); }}
                    style={{
                      width: "100%", textAlign: "left", padding: "10px 16px",
                      fontSize: 12, fontFamily: FONT, border: "none", cursor: "pointer",
                      background: sort === opt.value ? "rgba(251,191,36,0.15)" : "transparent",
                      color: sort === opt.value ? "#b45309" : "#374151",
                      fontWeight: sort === opt.value ? 700 : 500,
                      borderBottom: "1px solid rgba(0,0,0,0.05)",
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Cards ── */}
      <div style={{ maxWidth: 768, margin: "0 auto", padding: "20px 16px 100px", position: "relative", zIndex: 1 }}>
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{
                height: 130, borderRadius: 20,
                background: "rgba(0,0,0,0.05)", border: "1px solid rgba(0,0,0,0.05)",
                animation: "zzpulse 1.5s ease-in-out infinite",
                animationDelay: `${i * 0.1}s`,
              }} />
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <div style={{
            padding: "80px 20px", textAlign: "center",
            background: "#ffffff", border: "1px solid rgba(0,0,0,0.07)", borderRadius: 24,
          }}>
            <Clock size={36} color="rgba(0,0,0,0.15)" style={{ margin: "0 auto 12px" }} />
            <p style={{ fontSize: 15, fontWeight: 600, color: "rgba(0,0,0,0.6)" }}>
              {search ? "No results found" : "No products added in last 7 days"}
            </p>
            <p style={{ fontSize: 12, color: "rgba(0,0,0,0.35)", marginTop: 4 }}>
              {search ? "Try different keywords" : "Check back soon!"}
            </p>
            {search && (
              <button onClick={() => setSearch("")} style={{
                marginTop: 16, fontSize: 12, fontWeight: 700,
                color: "#b45309", background: "rgba(251,191,36,0.15)",
                border: "1px solid rgba(251,191,36,0.3)",
                padding: "6px 16px", borderRadius: 10, cursor: "pointer", fontFamily: FONT,
              }}>
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {sorted.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>

      <style>{`
        @keyframes zzpulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        input::placeholder { color: rgba(0,0,0,0.3); }
      `}</style>
    </main>
  );
}
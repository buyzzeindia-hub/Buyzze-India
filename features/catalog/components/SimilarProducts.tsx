"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { MapPin } from "lucide-react";


// ── Scroll-animated card wrapper ──────────────────────────────
function AnimatedCard({ children, index }: { children: React.ReactNode; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.1, rootMargin: "0px 0px -30px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0) scale(1)" : "translateY(24px) scale(0.97)",
        transition: `opacity 0.4s cubic-bezier(0.4,0,0.2,1) ${index * 60}ms, transform 0.4s cubic-bezier(0.4,0,0.2,1) ${index * 60}ms`,
        willChange: "opacity, transform",
      }}
    >
      {children}
    </div>
  );
}

type Props = {
  productId: string | number;
  brand: string;
  category: string;
  price: number;
  city: string;
  state: string;
};

export function SimilarProducts({ productId, brand, category, price, city, state }: Props) {
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSimilar = async () => {
      if (!city) { setLoading(false); return; }
      setLoading(true);
      try {
        const { data } = await supabase
          .from("products")
          .select("*")
          .neq("id", productId)
          .ilike("city", city)
          .limit(10);

        setItems(data || []);
      } catch (error) {
        console.error("Similar Products Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSimilar();
  }, [productId, city]);

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  };

  if (loading) return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 16 }}>
      {[1,2,3,4,5].map(i => (
        <div key={i} style={{ borderRadius: 16, overflow: "hidden", background: "#f1f5f9" }}>
          <div style={{ aspectRatio: "1/1", background: "#e2e8f0", animation: "spulse 1.4s ease-in-out infinite" }} />
          <div style={{ padding: "12px 12px 14px" }}>
            <div style={{ height: 10, background: "#e2e8f0", borderRadius: 6, marginBottom: 8, width: "60%", animation: "spulse 1.4s ease-in-out infinite" }} />
            <div style={{ height: 13, background: "#e2e8f0", borderRadius: 6, marginBottom: 8, animation: "spulse 1.4s ease-in-out infinite" }} />
            <div style={{ height: 16, background: "#e2e8f0", borderRadius: 6, width: "50%", animation: "spulse 1.4s ease-in-out infinite" }} />
          </div>
        </div>
      ))}
      <style>{`@keyframes spulse{0%,100%{opacity:1}50%{opacity:0.5}}`}</style>
    </div>
  );

  if (!items.length) return (
    <div style={{ padding: "32px 0", textAlign: "center" }}>
      <MapPin size={28} style={{ color: "#d1d5db", margin: "0 auto 10px", display: "block" }} />
      <p style={{ fontSize: 13, fontWeight: 600, color: "#9ca3af", margin: 0 }}>No products found in {city}</p>
    </div>
  );

  return (
    <section>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 16 }}>
        {items.map((item, index) => (
          <AnimatedCard key={item.id} index={index}>
          <div
            onClick={() => { router.push(`/products/${item.id}`); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            style={{
              borderRadius: 16,
              overflow: "hidden",
              border: "1px solid #f1f5f9",
              background: "#ffffff",
              cursor: "pointer",
              transition: "box-shadow 0.2s, transform 0.2s",
              display: "flex",
              flexDirection: "column",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 24px rgba(0,0,0,0.1)";
              (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.boxShadow = "none";
              (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
            }}
          >
            {/* Image */}
            <div style={{ aspectRatio: "1/1", background: "#f8fafc", overflow: "hidden", position: "relative" }}>
              <img
                src={item.images?.[0] || "/placeholder.png"}
                alt={item.title}
                style={{ width: "100%", height: "100%", objectFit: "contain", padding: 10, display: "block", transition: "transform 0.4s ease" }}
                onMouseEnter={e => (e.currentTarget as HTMLImageElement).style.transform = "scale(1.06)"}
                onMouseLeave={e => (e.currentTarget as HTMLImageElement).style.transform = "scale(1)"}
              />
              {/* Condition badge */}
              {item.condition && (
                <div style={{
                  position: "absolute", top: 8, left: 8,
                  background: "rgba(255,255,255,0.92)",
                  backdropFilter: "blur(4px)",
                  borderRadius: 20, padding: "3px 8px",
                  fontSize: 9, fontWeight: 700,
                  color: item.condition.toLowerCase().includes("superb") ? "#15803d"
                       : item.condition.toLowerCase().includes("good") ? "#1d4ed8" : "#b45309",
                  letterSpacing: "0.05em", textTransform: "uppercase",
                }}>
                  {item.condition}
                </div>
              )}
            </div>

            {/* Info */}
            <div style={{ padding: "10px 12px 13px", flex: 1, display: "flex", flexDirection: "column", gap: 3 }}>
              {item.brand && (
                <p style={{ fontSize: 9, fontWeight: 800, color: "#2563eb", textTransform: "uppercase", letterSpacing: "0.1em", margin: 0 }}>
                  {item.brand}
                </p>
              )}
              <h3 style={{
                fontSize: 12, fontWeight: 600, color: "#111827", margin: 0,
                display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                overflow: "hidden", lineHeight: 1.4,
              }}>
                {item.title}
              </h3>
              <p style={{ fontSize: 15, fontWeight: 900, color: "#0f172a", margin: "4px 0 0", letterSpacing: "-0.5px" }}>
                ₹{Number(item.price).toLocaleString("en-IN")}
              </p>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 4 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                  <MapPin size={9} color="#9ca3af" />
                  <span style={{ fontSize: 9, color: "#9ca3af", fontWeight: 500 }}>{item.city}</span>
                </div>
                {item.created_at && (
                  <span style={{ fontSize: 9, color: "#d1d5db", fontWeight: 500 }}>{timeAgo(item.created_at)}</span>
                )}
              </div>
            </div>
          </div>
          </AnimatedCard>
        ))}
      </div>
    </section>
  );
}
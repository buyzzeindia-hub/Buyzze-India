"use client";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";

function useIsDark() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return false;
  return resolvedTheme === "dark";
}

const CONDITIONS = [
  {
    value: "used-superb",
    label: "Used — Superb",
    badge: "Best Quality",
    image: "/condition-superb.png",
    bg: "#f0fdf4",
    darkBg: "#0a1f10",
  },
  {
    value: "used-good",
    label: "Used — Good",
    badge: "Good Value",
    image: "/condition-good.png",
    bg: "#eff6ff",
    darkBg: "#070f1a",
  },
  {
    value: "used-fair",
    label: "Used — Fair",
    badge: "Best Price",
    image: "/condition-fair.png",
    bg: "#fff7ed",
    darkBg: "#1a0f05",
  },
];

export default function ConditionPage() {
  const isDark = useIsDark();

  return (
    <main style={{
      minHeight: "100vh",
      background: isDark ? "#0a0a0f" : "#f8fafc",
      fontFamily: "'DM Sans', system-ui, sans-serif",
      paddingBottom: 100,
    }}>

      {/* Header */}
      <div style={{
        position: "sticky", top: 0, zIndex: 40,
        background: isDark ? "rgba(10,10,15,0.9)" : "rgba(248,250,252,0.9)",
        backdropFilter: "blur(16px)",
        borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "#e5e7eb"}`,
        padding: "12px 16px",
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <Link href="/" style={{
          width: 32, height: 32, borderRadius: "50%",
          background: isDark ? "rgba(255,255,255,0.08)" : "#f1f5f9",
          border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "#e2e8f0"}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          textDecoration: "none", flexShrink: 0,
        }}>
          <ArrowLeft size={14} color={isDark ? "rgba(255,255,255,0.8)" : "#374151"} />
        </Link>
        <h1 style={{ fontSize: 16, fontWeight: 800, color: isDark ? "#f8fafc" : "#111827", margin: 0 }}>
          Shop by Condition
        </h1>
      </div>

      {/* Cards */}
      <div style={{ maxWidth: 500, margin: "0 auto", padding: "20px 16px", display: "flex", flexDirection: "column", gap: 14 }}>
        {CONDITIONS.map((c) => (
          <Link
            key={c.value}
            href={`/search?q=&condition=${c.value}`}
            style={{
              display: "flex", alignItems: "stretch",
              borderRadius: 20, overflow: "hidden",
              background: isDark ? c.darkBg : c.bg,
              border: `1.5px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)"}`,
              boxShadow: isDark ? "0 4px 20px rgba(0,0,0,0.3)" : "0 2px 16px rgba(0,0,0,0.06)",
              textDecoration: "none",
              minHeight: 140,
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
              (e.currentTarget as HTMLElement).style.boxShadow = isDark
                ? "0 8px 32px rgba(0,0,0,0.4)"
                : "0 8px 28px rgba(0,0,0,0.1)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
              (e.currentTarget as HTMLElement).style.boxShadow = isDark
                ? "0 4px 20px rgba(0,0,0,0.3)"
                : "0 2px 16px rgba(0,0,0,0.06)";
            }}
          >
            {/* Left: text */}
            <div style={{
              flex: 1,
              padding: "22px 0 22px 24px",
              display: "flex", flexDirection: "column", justifyContent: "space-between",
            }}>
              <div>
                {/* Badge */}
                <span style={{
                  fontSize: 9, fontWeight: 700, letterSpacing: "0.07em",
                  textTransform: "uppercase",
                  color: isDark ? "rgba(255,255,255,0.4)" : "#9ca3af",
                  background: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.05)",
                  borderRadius: 6, padding: "2px 8px",
                  display: "inline-block", marginBottom: 10,
                }}>
                  {c.badge}
                </span>

                <p style={{
                  fontSize: 12, fontWeight: 500,
                  color: isDark ? "rgba(255,255,255,0.4)" : "#6b7280",
                  margin: "0 0 4px",
                }}>
                  Best Selling
                </p>

                <p style={{
                  fontSize: 22, fontWeight: 900, lineHeight: 1.15,
                  color: isDark ? "#f8fafc" : "#111827",
                  margin: 0, letterSpacing: "-0.5px",
                }}>
                  {c.label}
                </p>
              </div>

              {/* Arrow button */}
              <div style={{
                width: 40, height: 40, borderRadius: "50%", marginTop: 18,
                background: isDark ? "rgba(255,255,255,0.12)" : "#111827",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
                  stroke="#ffffff" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </div>
            </div>

            {/* Right: image */}
            <div style={{ width: "48%", flexShrink: 0, position: "relative", overflow: "hidden" }}>
              <Image
                src={c.image}
                alt={c.label}
                fill
                style={{ objectFit: "contain", objectPosition: "center bottom" }}
              />
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
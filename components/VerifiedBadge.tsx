// components/VerifiedBadge.tsx
"use client";
import { ShieldCheck } from "lucide-react";

interface Props {
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

const SIZES = {
  sm: { icon: 10, font: 9,  px: "6px 8px",  gap: 4, radius: 6  },
  md: { icon: 13, font: 11, px: "6px 10px", gap: 5, radius: 8  },
  lg: { icon: 16, font: 13, px: "8px 14px", gap: 6, radius: 10 },
};

export default function VerifiedBadge({ size = "md", showLabel = true }: Props) {
  const s = SIZES[size];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: s.gap,
      background: "linear-gradient(135deg, #0ea5e9, #2563eb)",
      color: "#ffffff", fontSize: s.font, fontWeight: 700,
      padding: s.px, borderRadius: s.radius,
      letterSpacing: "0.02em", whiteSpace: "nowrap",
      boxShadow: "0 2px 8px rgba(14,165,233,0.35)",
    }}>
      <ShieldCheck size={s.icon} strokeWidth={2.5} />
      {showLabel && "Verified"}
    </span>
  );
}

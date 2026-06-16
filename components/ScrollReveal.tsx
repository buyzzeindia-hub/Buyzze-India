// components/ScrollReveal.tsx
// Wrap any element — appear on scroll down, disappear on scroll up
"use client";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { CSSProperties, ReactNode } from "react";

type Animation = "fadeUp" | "fadeDown" | "fadeLeft" | "fadeRight" | "fadeIn" | "zoomIn";

interface Props {
  children: ReactNode;
  animation?: Animation;
  delay?: number;       // ms
  duration?: number;    // ms
  distance?: number;    // px — how far it slides
  className?: string;
  style?: CSSProperties;
  threshold?: number;   // 0-1
}

const getTransform = (animation: Animation, distance: number, visible: boolean): string => {
  if (visible) return "translate(0,0) scale(1)";
  switch (animation) {
    case "fadeUp":    return `translateY(${distance}px) scale(0.98)`;
    case "fadeDown":  return `translateY(-${distance}px) scale(0.98)`;
    case "fadeLeft":  return `translateX(${distance}px)`;
    case "fadeRight": return `translateX(-${distance}px)`;
    case "zoomIn":    return "scale(0.92)";
    case "fadeIn":
    default:          return "translateY(0) scale(1)";
  }
};

export default function ScrollReveal({
  children,
  animation = "fadeUp",
  delay = 0,
  duration = 500,
  distance = 32,
  className,
  style,
  threshold = 0.12,
}: Props) {
  const { ref, visible } = useScrollReveal(threshold);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: getTransform(animation, distance, visible),
        transition: `opacity ${duration}ms cubic-bezier(0.4,0,0.2,1) ${delay}ms,
                     transform ${duration}ms cubic-bezier(0.4,0,0.2,1) ${delay}ms`,
        willChange: "opacity, transform",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
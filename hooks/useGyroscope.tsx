"use client";
import { useEffect, useRef, useCallback } from "react";

interface GyroscopeOptions {
  maxTilt?:    number;   // Max tilt degrees (default: 10)
  perspective?: number;  // CSS perspective px (default: 800)
  smoothing?:  number;   // Lerp factor 0–1 (default: 0.12)
  scale?:      number;   // Hover scale (default: 1.03)
}

/**
 * useGyroscope<T>
 * Mobile  → real DeviceOrientation (gyroscope)
 * Desktop → mouse-move fallback
 *
 * Usage:
 *   const ref = useGyroscope<HTMLDivElement>();
 *   <div ref={ref} className="gyro-card relative"> ... </div>
 */
export function useGyroscope<T extends HTMLElement>(
  options: GyroscopeOptions = {}
) {
  const { maxTilt = 10, perspective = 800, smoothing = 0.12, scale = 1.03 } = options;

  const ref      = useRef<T>(null);
  const rafRef   = useRef<number>(0);
  const curX     = useRef(0);
  const curY     = useRef(0);
  const tgtX     = useRef(0);
  const tgtY     = useRef(0);
  const running  = useRef(false);

  const tick = useCallback(() => {
    const el = ref.current;
    if (!el) return;

    curX.current += (tgtX.current - curX.current) * smoothing;
    curY.current += (tgtY.current - curY.current) * smoothing;

    const rx = curX.current;
    const ry = curY.current;
    const dist = Math.sqrt(rx * rx + ry * ry);
    const sc = dist > 0.3 ? scale : 1;

    el.style.transform =
      `perspective(${perspective}px) rotateX(${rx}deg) rotateY(${ry}deg) scale(${sc})`;

    // Move glare
    const glare = el.querySelector<HTMLElement>(".gyro-glare");
    if (glare) {
      const nx = (ry / maxTilt + 1) / 2;
      const ny = (-rx / maxTilt + 1) / 2;
      glare.style.background = `radial-gradient(circle at ${nx * 100}% ${ny * 100}%, rgba(255,255,255,0.22) 0%, transparent 60%)`;
      glare.style.opacity = dist > 0.5 ? "1" : "0";
    }

    rafRef.current = requestAnimationFrame(tick);
  }, [smoothing, perspective, maxTilt, scale]);

  const start = useCallback(() => {
    if (running.current) return;
    running.current = true;
    ref.current?.classList.add("gyro-active");
    rafRef.current = requestAnimationFrame(tick);
  }, [tick]);

  const stop = useCallback(() => {
    tgtX.current = 0;
    tgtY.current = 0;
    setTimeout(() => {
      cancelAnimationFrame(rafRef.current);
      running.current = false;
      const el = ref.current;
      if (!el) return;
      el.style.transform = "";
      el.classList.remove("gyro-active");
      const glare = el.querySelector<HTMLElement>(".gyro-glare");
      if (glare) glare.style.opacity = "0";
    }, 350);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);

    /* ── Mobile: Gyroscope ─────────────────────────────────────────── */
    if (isMobile) {
      let baseG: number | null = null;
      let baseB: number | null = null;

      const onOrient = (e: DeviceOrientationEvent) => {
        if (e.gamma == null || e.beta == null) return;
        if (baseG === null) baseG = e.gamma;
        if (baseB === null) baseB = e.beta;
        tgtY.current = Math.max(-maxTilt, Math.min(maxTilt, (e.gamma - baseG) * 0.65));
        tgtX.current = Math.max(-maxTilt, Math.min(maxTilt, (e.beta  - baseB) * 0.45));
        start();
      };

      const attach = () => window.addEventListener("deviceorientation", onOrient);

      const onTouch = () => {
        // iOS 13+ needs permission
        if (typeof (DeviceOrientationEvent as any).requestPermission === "function") {
          (DeviceOrientationEvent as any).requestPermission()
            .then((r: string) => r === "granted" && attach())
            .catch(() => {});
        } else {
          attach();
        }
        el.removeEventListener("touchstart", onTouch);
      };

      el.addEventListener("touchstart", onTouch, { passive: true });
      el.addEventListener("touchend",   stop,    { passive: true });

      return () => {
        el.removeEventListener("touchstart", onTouch);
        el.removeEventListener("touchend",   stop);
        window.removeEventListener("deviceorientation", onOrient);
        cancelAnimationFrame(rafRef.current);
      };
    }

    /* ── Desktop: Mouse fallback ───────────────────────────────────── */
    const onMove = (e: MouseEvent) => {
      const r  = el.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width  / 2)) / (r.width  / 2);
      const dy = (e.clientY - (r.top  + r.height / 2)) / (r.height / 2);
      tgtY.current =  dx * maxTilt;
      tgtX.current = -dy * maxTilt;
      start();
    };

    el.addEventListener("mousemove",  onMove);
    el.addEventListener("mouseleave", stop);

    return () => {
      el.removeEventListener("mousemove",  onMove);
      el.removeEventListener("mouseleave", stop);
      cancelAnimationFrame(rafRef.current);
    };
  }, [maxTilt, start, stop]);

  return ref;
}

/** Drop inside any .gyro-card for the light-glare sheen */
export function GyroGlare() {
  return (
    <span
      className="gyro-glare pointer-events-none absolute inset-0 rounded-[inherit] z-10 opacity-0 transition-opacity duration-200"
      aria-hidden="true"
    />
  );
}

"use client";
import { useEffect, useState } from "react";

/**
 * SplashScreen
 * – Shows on every cold open (web + Capacitor app)
 * – Respects OS light / dark mode
 * – sessionStorage se track karta hai: ek session mein ek hi baar dikhega
 *   (Capacitor app mein hata sakte ho ye check — hamesha dikhega)
 */

const SHOW_EVERY_TIME = false; // true karo Capacitor app mein hamesha dikhane ke liye

export default function SplashScreen({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<"in" | "hold" | "out">("in");

  useEffect(() => {
    // hold phase — animations play hone ka time
    const holdTimer = setTimeout(() => setPhase("out"), 2800);
    return () => clearTimeout(holdTimer);
  }, []);

  useEffect(() => {
    if (phase === "out") {
      // exit animation ke baad parent ko signal
      const t = setTimeout(onDone, 700);
      return () => clearTimeout(t);
    }
  }, [phase, onDone]);

  return (
    <div
      className={`splash-root ${phase === "out" ? "splash-exit" : ""}`}
      aria-hidden="true"
    >
      {/* Ambient glow */}
      <div className="splash-ambient-1" />
      <div className="splash-ambient-2" />
      <div className="splash-grid" />

      {/* Center */}
      <div className="splash-center">
        <div className="splash-brand">
          {["B","u","y","Z","z","e"].map((ch, i) => (
            <span
              key={i}
              className={`splash-letter ${i >= 3 ? "splash-letter-blue" : ""}`}
              style={{ animationDelay: `${0.28 + i * 0.11}s` }}
            >
              {ch}
            </span>
          ))}
        </div>

        <div className="splash-line" />

        <p className="splash-tagline">Buy &amp; Sell Mobiles</p>
      </div>

      {/* Bottom trust */}
      <div className="splash-trust">
        <div className="splash-trust-divider" />
        <div className="splash-trust-row">
          <div className="splash-trust-dot" />
          <span className="splash-trust-text">Trusted by Indians</span>
          <div className="splash-trust-dot" />
        </div>
      </div>

      <style>{`
        /* ── tokens ─────────────────────────────────────────── */
        .splash-root {
          --bg:        #ffffff;
          --brand:     #2563eb;
          --brand-g:   rgba(37,99,235,0.14);
          --brand-d:   rgba(37,99,235,0.08);
          --primary:   #0f172a;
          --blue-txt:  #2563eb;
          --sub:       rgba(15,23,42,0.36);
          --trust-c:   rgba(15,23,42,0.26);
          --grid-c:    rgba(15,23,42,0.06);
          --dot-c:     #2563eb;
        }
        @media (prefers-color-scheme: dark) {
          .splash-root {
            --bg:       #05060a;
            --brand-g:  rgba(37,99,235,0.13);
            --brand-d:  rgba(37,99,235,0.07);
            --primary:  #f8fafc;
            --blue-txt: #60a5fa;
            --sub:      rgba(248,250,252,0.30);
            --trust-c:  rgba(248,250,252,0.20);
            --grid-c:   rgba(248,250,252,0.05);
            --dot-c:    #3b82f6;
          }
        }

        /* ── wrapper ─────────────────────────────────────────── */
        .splash-root {
          position: fixed; inset: 0; z-index: 9999;
          background: var(--bg);
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          overflow: hidden;
          font-family: 'Nunito', sans-serif;
        }
        /* grain */
        .splash-root::after {
          content: '';
          position: absolute; inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.045'/%3E%3C/svg%3E");
          pointer-events: none; opacity: 0.5; z-index: 0;
        }

        /* ── ambient ─────────────────────────────────────────── */
        .splash-ambient-1, .splash-ambient-2 {
          position: absolute; border-radius: 50%;
          pointer-events: none; z-index: 0;
          top: 50%; left: 50%;
        }
        .splash-ambient-1 {
          width: 480px; height: 480px;
          transform: translate(-50%, -55%);
          background: radial-gradient(circle, var(--brand-g) 0%, transparent 68%);
          opacity: 0;
          animation: splashFadeIn 1.2s ease 0.1s forwards;
        }
        .splash-ambient-2 {
          width: 260px; height: 260px;
          transform: translate(-50%, -54%);
          background: radial-gradient(circle, var(--brand-d) 0%, transparent 70%);
          opacity: 0;
          animation: splashFadeIn 1s ease 0.25s forwards;
        }

        /* ── grid ────────────────────────────────────────────── */
        .splash-grid {
          position: absolute; inset: 0; z-index: 0;
          pointer-events: none; opacity: 0;
          animation: splashFadeIn 1.4s ease 0.4s forwards;
          background-image:
            linear-gradient(var(--grid-c) 1px, transparent 1px),
            linear-gradient(90deg, var(--grid-c) 1px, transparent 1px);
          background-size: 56px 56px;
          mask-image: radial-gradient(ellipse 65% 55% at 50% 50%, black 0%, transparent 100%);
          -webkit-mask-image: radial-gradient(ellipse 65% 55% at 50% 50%, black 0%, transparent 100%);
        }

        /* ── center ──────────────────────────────────────────── */
        .splash-center {
          position: relative; z-index: 2;
          display: flex; flex-direction: column; align-items: center;
        }

        /* ── brand letters ───────────────────────────────────── */
        .splash-brand {
          display: flex; align-items: baseline; line-height: 1;
          padding-bottom: 4px;
        }
        .splash-letter {
          display: inline-block;
          font-family: 'Nunito', sans-serif;
          font-weight: 900;
          font-size: clamp(54px, 14vw, 72px);
          letter-spacing: -2px;
          line-height: 1;
          color: var(--primary);
          opacity: 0;
          transform: translateY(28px) scale(0.93);
          filter: blur(5px);
          animation: letterUp 0.52s cubic-bezier(0.22,1,0.36,1) forwards;
          will-change: transform, opacity, filter;
        }
        .splash-letter-blue { color: var(--blue-txt); }

        @keyframes letterUp {
          0%   { opacity:0; transform:translateY(28px) scale(0.93); filter:blur(5px); }
          55%  { filter:blur(0); }
          100% { opacity:1; transform:translateY(0) scale(1); filter:blur(0); }
        }

        /* ── underline ───────────────────────────────────────── */
        .splash-line {
          height: 3px; width: 0%; border-radius: 99px;
          margin-top: 7px;
          background: linear-gradient(90deg, var(--brand) 0%, var(--blue-txt) 100%);
          opacity: 0;
          animation: lineGrow 0.5s cubic-bezier(0.22,1,0.36,1) 1.05s forwards;
        }
        @keyframes lineGrow {
          0%   { width:0%; opacity:0; }
          8%   { opacity:1; }
          100% { width:100%; opacity:1; }
        }

        /* ── tagline ─────────────────────────────────────────── */
        .splash-tagline {
          margin-top: 16px;
          font-size: clamp(10px, 2.6vw, 12px);
          font-weight: 600;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--sub);
          opacity: 0;
          transform: translateY(8px);
          animation: riseIn 0.45s ease 1.3s forwards;
        }

        /* ── trust ───────────────────────────────────────────── */
        .splash-trust {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          padding-bottom: max(44px, env(safe-area-inset-bottom, 44px));
          display: flex; flex-direction: column;
          align-items: center; gap: 10px;
          z-index: 2;
          opacity: 0;
          transform: translateY(8px);
          animation: riseIn 0.45s ease 1.55s forwards;
        }
        .splash-trust-divider {
          width: 28px; height: 1px;
          background: var(--grid-c);
          border-radius: 99px;
        }
        .splash-trust-row {
          display: flex; align-items: center;
          justify-content: center; gap: 8px;
        }
        .splash-trust-dot {
          width: 5px; height: 5px; border-radius: 50%;
          background: var(--dot-c); opacity: 0.65; flex-shrink: 0;
        }
        .splash-trust-text {
          font-size: 10px; font-weight: 700;
          letter-spacing: 0.20em; text-transform: uppercase;
          color: var(--trust-c);
        }

        /* ── shared keyframes ────────────────────────────────── */
        @keyframes splashFadeIn { to { opacity: 1; } }
        @keyframes riseIn { to { opacity:1; transform:translateY(0); } }

        /* ── exit ────────────────────────────────────────────── */
        .splash-exit {
          animation: splashOut 0.7s cubic-bezier(0.4,0,0.6,1) forwards !important;
          pointer-events: none;
        }
        @keyframes splashOut {
          0%   { opacity:1; transform:scale(1); }
          100% { opacity:0; transform:scale(1.04); }
        }
      `}</style>
    </div>
  );
}

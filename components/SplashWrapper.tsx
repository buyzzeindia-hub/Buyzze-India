"use client";
import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";

// Dynamic import — splash sirf client side load ho
const SplashScreen = dynamic(() => import("./SplashScreen"), { ssr: false });

/**
 * Capacitor detection:
 * Jab Next.js ko Capacitor ke saath wrap karte hain,
 * window.Capacitor available hota hai.
 */
function isCapacitorApp(): boolean {
  if (typeof window === "undefined") return false;
  return !!(window as any).Capacitor;
}

/**
 * SplashWrapper rules:
 *
 * Web (browser):
 *   – Sirf pehli visit pe dikhega (sessionStorage track karta hai)
 *   – Page refresh pe nahi dikhega
 *   – New tab = dikhega
 *
 * Capacitor App:
 *   – Har cold open pe dikhega (native splash ke baad)
 *   – sessionStorage app restart pe clear hoti hai
 */
export default function SplashWrapper({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(true);
  const [appVisible, setAppVisible] = useState(false);

  useEffect(() => {
    const isApp = isCapacitorApp();

    if (!isApp) {
      // Web: check session
      const seen = sessionStorage.getItem("bzz_splash_shown");
      if (seen) {
        setShowSplash(false);
        setAppVisible(true);
        return;
      }
    }

    // Show splash
    setShowSplash(true);
    setAppVisible(false);
  }, []);

  const handleSplashDone = useCallback(() => {
    // Mark as shown for this session (web only — Capacitor app ignores this)
    if (!isCapacitorApp()) {
      sessionStorage.setItem("bzz_splash_shown", "1");
    }
    setShowSplash(false);
    // Small delay before making app fully visible (smooth feel)
    setTimeout(() => setAppVisible(true), 50);
  }, []);

  return (
    <>
      {/* Splash — unmount hone se pehle exit animation play hoti hai */}
      {showSplash && <SplashScreen onDone={handleSplashDone} />}

      {/* App content — splash ke peeche render hota hai, splash exit ke baad visible */}
      <div
        style={{
          opacity: appVisible ? 1 : 0,
          transition: "opacity 0.4s ease",
          // Jab splash chal raha ho tb scroll lock
          overflow: showSplash ? "hidden" : undefined,
          height: showSplash ? "100vh" : undefined,
        }}
      >
        {children}
      </div>
    </>
  );
}

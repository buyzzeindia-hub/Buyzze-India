"use client";

import { useEffect, useState, useRef } from "react";
import Script from "next/script";

export default function FastAuthPopup() {
  const [mounted, setMounted] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pollingStatus, setPollingStatus] = useState("");
  
  const googleBtnRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const TRUECALLER_APP_KEY = "LAq1x7b1c1e08eb3f42d2a95f96d6b6f44e75",

  useEffect(() => {
    setMounted(true);

    // Active session checks
    const isUiLoggedIn = localStorage.getItem("buyzze_logged_in") === "true";
    const hasClerkSession = document.cookie.includes("__session");
    const hasFastSession = document.cookie.includes("buyzze_fast_session");

    // Agar user logged in hai toh popup bilkul band rahega
    if (isUiLoggedIn || hasClerkSession || hasFastSession) {
      return; 
    }

    const checkMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    setIsMobile(checkMobile);

    // 🕒 TIMING LOGIC INTERFERENCE ENGINE
    const skipTimeStr = sessionStorage.getItem("buyzze_popup_skip_timestamp");
    const firstVisitDone = sessionStorage.getItem("buyzze_first_visit_done") === "true";
    let delay = 0;

    if (skipTimeStr) {
      const skipTime = parseInt(skipTimeStr, 10);
      const timePassed = Date.now() - skipTime;

      if (timePassed < 120000) {
        // Case 1: User ne skip dabaya tha aur 2 min abhi pure nahi hue (Refresh safe break)
        delay = 120000 - timePassed;
      } else {
        // Case 2: 2 min ka interval khatam ho chuka hai aur page refresh hua hai -> 3-4 sec delay
        delay = Math.floor(Math.random() * (4000 - 3000 + 1)) + 3000;
      }
    } else {
      if (!firstVisitDone) {
        // Case 3: Ekdum pehli baar website par aaya hai -> Normal random delay (4 to 10 seconds)
        delay = Math.floor(Math.random() * (10000 - 4000 + 1)) + 4000;
        sessionStorage.setItem("buyzze_first_visit_done", "true");
      } else {
        // Case 4: User ne popup ko ignore kiya/refresh kiya bina Skip dabaye -> Comes back in 3 to 4 seconds
        delay = Math.floor(Math.random() * (4000 - 3000 + 1)) + 3000;
      }
    }

    // Set active timer loop
    timerRef.current = setTimeout(() => {
      setShowPopup(true);
    }, delay);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (showPopup && (window as any).google && googleBtnRef.current) {
      initGoogleSignIn();
    }
  }, [showPopup]);

  const initGoogleSignIn = () => {
    try {
      const googleAuth = (window as any).google?.accounts?.id;
      if (!googleAuth) return;

      googleAuth.initialize({
        client_id: "53474173239-heqkmd2ht8jt8ptoor29bcilmipsjnd6.apps.googleusercontent.com",
        callback: handleGoogleResponse,
      });

      googleAuth.renderButton(googleBtnRef.current!, {
        theme: "outline",
        size: "large",
        width: 220,
        text: "continue_with",
        shape: "pill",
      });
    } catch (err) {
      console.error("Google Init Error:", err);
    }
  };

  const handleGoogleResponse = async (response: any) => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/google-onetap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: response.credential }),
      });
      
      if (res.ok) {
        localStorage.setItem("buyzze_logged_in", "true");
        setShowPopup(false);
        window.location.reload(); 
      }
    } catch (error) {
      console.error("Google Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTruecallerLogin = async () => {
    setLoading(true);
    setPollingStatus("Opening...");
    try {
      const initRes = await fetch("/api/auth/truecaller/init", { method: "POST" });
      const initData = await initRes.json();
      
      if (!initData.success) throw new Error("Init failed");
      const requestId = initData.request_id;

      const truecallerIntent = `intent://truesdk/web_verify?type=btmsheet&requestNonce=${requestId}&partnerKey=${TRUECALLER_APP_KEY}&partnerName=Buyzze&ctaColor=%232593e8&ctaTextColor=%23ffffff&btnShape=round&loginPrefix=continue&loginSuffix=login#Intent;scheme=truecaller;package=com.truecaller;end`;
      
      setShowPopup(false);
      window.location.href = truecallerIntent;

      let tickCount = 0;
      const pollInterval = setInterval(async () => {
        tickCount++;
        
        const pollRes = await fetch("/api/auth/truecaller/poll", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ requestId }),
        });
        
        const pollData = await pollRes.json();

        if (pollData.status === "verified") {
          clearInterval(pollInterval);
          localStorage.setItem("buyzze_logged_in", "true");
          window.location.reload();
          return;
        }

        if (tickCount > 60) {
          clearInterval(pollInterval);
          setLoading(false);
        }
      }, 1000);

    } catch (error) {
      console.error("Truecaller Error:", error);
      setPollingStatus("Failed. Use Google.");
      setLoading(false);
      setShowPopup(true);
    }
  };

  // 🚀 ACTION: User clicks the upper skip button
  const handleSkipAction = () => {
    setShowPopup(false);
    // Timestamp note kar lo jab skip dabaya gaya hai
    sessionStorage.setItem("buyzze_popup_skip_timestamp", Date.now().toString());

    if (timerRef.current) clearTimeout(timerRef.current);

    // Exact 2 minute (120000ms) baad popup ko active karne ka trigger loop bind karo
    timerRef.current = setTimeout(() => {
      setShowPopup(true);
    }, 120000);
  };

  if (!mounted) return null;

  return (
    <>
      <Script 
        src="https://accounts.google.com/gsi/client" 
        strategy="afterInteractive" 
        onLoad={() => {
          if (showPopup) initGoogleSignIn();
        }} 
      />

      {/* Dimmed Overlay with completely disabled backdrop closing clicks */}
      <div 
        className={`fixed inset-0 bg-black/20 z-[9998] transition-opacity duration-300 ${
          showPopup ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      ></div>

      <div 
        className={`fixed bottom-0 left-0 right-0 z-[9999] transition-transform duration-400 ease-out flex justify-center ${
          showPopup ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="w-full sm:max-w-sm bg-white rounded-t-[24px] shadow-[0_-8px_24px_rgba(0,0,0,0.15)] pt-3 pb-6 px-4 flex flex-col items-center text-center relative border-t border-gray-100">
          
          {/* Top Handle Bar */}
          <div className="w-10 h-1.5 bg-[#E5E7EB] rounded-full mb-4"></div>

          {/* 🔥 NEW: Sleek upper Skip Button text badge */}
          <button 
            onClick={handleSkipAction}
            className="absolute top-3 right-4 bg-gray-50 hover:bg-gray-100 text-gray-500 font-semibold text-[11px] px-2.5 py-1 rounded-full transition-all border border-gray-100 active:scale-95 flex items-center gap-0.5"
          >
            Skip 
            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>

          {/* MAIN CONTAINER: Flex row grid layout */}
          <div className="flex items-center justify-between w-full mt-3 mb-2 px-1">
            
            {/* LEFT SIDE: Big Logo + Branding Text */}
            <div className="w-[115px] flex flex-col items-center justify-center flex-shrink-0 gap-2">
              <img 
                src="/logo.png" 
                alt="Buyzze" 
                className="w-[65px] h-auto object-contain drop-shadow-sm"
                onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
              />
              {/* Custom Styling requested: Login Into BuYzze */}
              <p className="text-[11px] font-semibold text-gray-600 leading-tight">
                Login Into <span className="text-[#0087FF] font-bold">BuYzze</span>
              </p>
            </div>

            {/* MIDDLE: Vertical Divider Line */}
            <div className="w-[1px] h-[90px] bg-gray-200 mx-2"></div>

            {/* RIGHT SIDE: Custom Auth Control Options */}
            <div className="flex-1 flex flex-col items-center gap-3 w-full">
              
              {isMobile && (
                <button
                  onClick={handleTruecallerLogin}
                  disabled={loading}
                  className="w-full max-w-[220px] h-[40px] bg-white border border-[#0087FF] rounded-full flex items-center justify-center gap-2 hover:bg-blue-50 active:scale-[0.98] transition-all disabled:opacity-75 shadow-sm"
                >
                  {loading && pollingStatus.includes("Opening") ? (
                    <span className="text-[#0087FF] text-sm font-medium">Opening...</span>
                  ) : (
                    <>
                      <img src="/truecaller-logo.webp" alt="TC Logo" className="w-5 h-5 object-contain" />
                      <img src="/truecaller-text.webp" alt="Truecaller" className="h-[14px] object-contain" />
                    </>
                  )}
                </button>
              )}

              {/* Google Integration Target Div */}
              <div 
                ref={googleBtnRef} 
                id="google-btn-container" 
                className="w-full flex justify-center min-h-[40px]"
              ></div>
              
            </div>
          </div>

          {/* Polling Status Text Loader */}
          {pollingStatus && !showPopup && (
            <p className="text-[12px] font-medium text-blue-500 mt-2 animate-pulse">
              {pollingStatus}
            </p>
          )}

          {/* Locked Footer */}
          <div className="mt-4 text-[10px] text-gray-400 flex items-center justify-center gap-1.5 w-full">
            <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            Secured by Buyzze
          </div>

        </div>
      </div>
    </>
  );
}
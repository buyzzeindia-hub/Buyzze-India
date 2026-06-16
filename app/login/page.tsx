"use client";

import { useState, useEffect, useRef } from "react";
import { useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { DotLottiePlayer } from "@dotlottie/react-player";
import "@dotlottie/react-player/dist/index.css";
import { Loader2 } from "lucide-react";
import Script from "next/script"; // ✅ Added for Google One-Tap Client Script loading
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const { signIn, isLoaded, setActive } = useSignIn();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // ── ✅ POPUP FILE AUTH STATES INTEGRATION ──
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [fastLoading, setFastLoading] = useState(false);
  const [pollingStatus, setPollingStatus] = useState("");
  const googleBtnRef = useRef<HTMLDivElement>(null);

  const TRUECALLER_APP_KEY = process.env.NEXT_PUBLIC_TRUECALLER_APP_KEY!;

  useEffect(() => {
    setMounted(true);
    const checkMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    setIsMobile(checkMobile);
  }, []);

  useEffect(() => {
    if (mounted && (window as any).google && googleBtnRef.current) {
      initGoogleSignIn();
    }
  }, [mounted]);

  const initGoogleSignIn = () => {
    try {
      const googleAuth = (window as any).google?.accounts?.id;
      if (!googleAuth) return;

      googleAuth.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
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
    setFastLoading(true);
    try {
      const res = await fetch("/api/auth/google-onetap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: response.credential }),
      });
      
      if (res.ok) {
        localStorage.setItem("buyzze_logged_in", "true");
        window.location.href = "/"; 
      }
    } catch (error) {
      console.error("Google Error:", error);
    } finally {
      setFastLoading(false);
    }
  };

  const handleTruecallerLogin = async () => {
    setFastLoading(true);
    setPollingStatus("Opening...");
    try {
      const initRes = await fetch("/api/auth/truecaller/init", { method: "POST" });
      const initData = await initRes.json();
      
      if (!initData.success) throw new Error("Init failed");
      const requestId = initData.request_id;

      const truecallerIntent = `intent://truesdk/web_verify?type=btmsheet&requestNonce=${requestId}&partnerKey=${TRUECALLER_APP_KEY}&partnerName=Buyzze&ctaColor=%232593e8&ctaTextColor=%23ffffff&btnShape=round&loginPrefix=continue&loginSuffix=login#Intent;scheme=truecaller;package=com.truecaller;end`;
      
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
          window.location.href = "/";
          return;
        }

        if (tickCount > 60) {
          clearInterval(pollInterval);
          setFastLoading(false);
        }
      }, 1000);

    } catch (error) {
      console.error("Truecaller Error:", error);
      setPollingStatus("Failed. Use Google.");
      setFastLoading(false);
    }
  };

  // ── Clerk Email Login Handler ──
  const handleLogin = async () => {
    if (!isLoaded) return;
    setLoading(true);
    setError("");

    try {
      const result = await signIn!.create({
        identifier: email,
        password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        setSuccess(true);
        setTimeout(() => { 
          window.location.href = "/"; 
        }, 2000);
      } else {
        setError("Login incomplete. Please try again.");
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.longMessage || err.errors?.[0]?.message || "Login failed.");
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col lg:flex-row overflow-hidden font-sans">
      
      {/* Google GSI Client Script Injection */}
      <Script 
        src="https://accounts.google.com/gsi/client" 
        strategy="afterInteractive" 
        onLoad={initGoogleSignIn} 
      />

      {/* Left Side */}
      <motion.div
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="lg:w-1/2 bg-gray-50/50 dark:bg-gray-800/20 flex flex-col items-center justify-center p-12 border-b lg:border-b-0 lg:border-r border-gray-100 dark:border-gray-800"
      >
        <div className="w-full flex flex-col items-center text-center">
          <h2 className="text-5xl md:text-6xl text-blue-600 font-black tracking-tighter mb-2">BuYzze</h2>
          <p className="text-gray-400 text-[10px] tracking-[0.6em] uppercase font-bold mb-6">Premium Trading</p>
          <div className="w-full max-w-[340px]">
            <DotLottiePlayer src="/login-anim.lottie" autoplay loop />
          </div>
          <p className="text-gray-500 mt-8 max-w-sm text-sm font-medium leading-relaxed">
            Your gateway to the best mobile deals. Sign in to continue your journey.
          </p>
        </div>
      </motion.div>

      {/* Right Side */}
      <div className="lg:w-1/2 flex items-center justify-center p-8 md:p-16 bg-white dark:bg-gray-900">
        <AnimatePresence mode="wait">

          {/* SUCCESS */}
          {success && (
            <motion.div key="success" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="fixed inset-0 z-[100] bg-white dark:bg-[#05080d] flex flex-col items-center justify-center"
            >
              <div className="w-80 h-80 md:w-[450px] md:h-[450px]">
                <DotLottiePlayer src="/success.lottie" autoplay loop={false} />
              </div>
              <motion.h1 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1, transition: { delay: 0.5 } }}
                className="text-4xl font-medium tracking-tight text-blue-600 mt-4"
              >
                Welcome Back!
              </motion.h1>
            </motion.div>
          )}

          {/* LOGIN FORM */}
          {!success && (
            <motion.div key="login" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-md"
            >
              <div className="mb-10">
                <h1 className="text-5xl font-black text-gray-900 dark:text-white tracking-tight leading-none mb-2">
                  Welcome<br />Back
                </h1>
                <p className="text-blue-600 text-[10px] font-black uppercase tracking-[0.3em] mt-3">
                  Sign in to BuYzze
                </p>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="mb-6 p-4 bg-red-50 dark:bg-red-900/10 text-red-600 text-xs font-bold uppercase rounded-2xl border border-red-100 text-center"
                  >{error}</motion.div>
                )}
              </AnimatePresence>

              {/* ── ✅ EXACT POPUP OPTION BUTTONS CONTAINER ── */}
              <div className="flex flex-col items-center gap-3 w-full mb-6">
                {isMobile && (
                  <button
                    onClick={handleTruecallerLogin}
                    disabled={fastLoading}
                    className="w-full max-w-[220px] h-[40px] bg-white border border-[#0087FF] rounded-full flex items-center justify-center gap-2 hover:bg-blue-50 active:scale-[0.98] transition-all disabled:opacity-75 shadow-sm"
                  >
                    {fastLoading && pollingStatus.includes("Opening") ? (
                      <span className="text-[#0087FF] text-sm font-medium">Opening...</span>
                    ) : (
                      <>
                        <img src="/truecaller-logo.webp" alt="TC Logo" className="w-5 h-5 object-contain" />
                        <img src="/truecaller-text.webp" alt="Truecaller" className="h-[14px] object-contain" />
                      </>
                    )}
                  </button>
                )}

                {/* Google Injection Anchor Target Div */}
                <div 
                  ref={googleBtnRef} 
                  id="google-btn-container" 
                  className="w-full flex justify-center min-h-[40px]"
                ></div>
                
                {pollingStatus && !fastLoading && (
                  <p className="text-[12px] font-medium text-blue-500 mt-1 animate-pulse">
                    {pollingStatus}
                  </p>
                )}
              </div>

              {/* Divider layout grid line */}
              <div className="flex items-center gap-4 mb-6">
                <div className="h-px flex-1 bg-gray-200 dark:bg-gray-800"></div>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">Or login with email</span>
                <div className="h-px flex-1 bg-gray-200 dark:bg-gray-800"></div>
              </div>

              <div className="space-y-5">
                {/* Email */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest ml-1">Email</label>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                    className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 focus:bg-white dark:focus:bg-gray-800 focus:border-blue-500 outline-none text-sm font-semibold text-gray-900 dark:text-white transition-all"
                  />
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest ml-1">Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                    className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 focus:bg-white dark:focus:bg-gray-800 focus:border-blue-500 outline-none text-sm font-semibold text-gray-900 dark:text-white transition-all"
                  />
                </div>

                <button
                  onClick={handleLogin}
                  disabled={loading || !email || !password}
                  className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-black text-xs tracking-[0.2em] uppercase shadow-xl shadow-blue-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {loading ? <><Loader2 className="animate-spin" size={18} /> Signing In...</> : "Enter Account →"}
                </button>
              </div>

              <div className="mt-10 text-center pt-8 border-t border-gray-100 dark:border-gray-800">
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                  New User?{" "}
                  <Link href="/signup" className="text-blue-600 font-black hover:underline">Create Account</Link>
                </p>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
"use client";

import { useState } from "react";
import { useSignUp } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import { DotLottiePlayer } from "@dotlottie/react-player";
import "@dotlottie/react-player/dist/index.css";
import { Loader2 } from "lucide-react";
import Link from "next/link";

type Step = "signup" | "verify" | "success";

export default function SignupPage() {
  const { signUp, isLoaded, setActive } = useSignUp();

  const [step, setStep] = useState<Step>("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ✅ STEP 1: Clerk mein account banao
  const handleSignup = async () => {
    if (!isLoaded) return;
    setLoading(true);
    setError("");

    try {
      await signUp!.create({
        emailAddress: email,
        password,
        firstName: name.split(" ")[0],
        lastName: name.split(" ").slice(1).join(" ") || "",
      });

      await signUp!.prepareEmailAddressVerification({ strategy: "email_code" });
      setStep("verify");
      setLoading(false);
    } catch (err: any) {
      setError(err.errors?.[0]?.longMessage || err.errors?.[0]?.message || "Signup failed.");
      setLoading(false);
    }
  };

  // ✅ STEP 2: Email verify + Supabase profile save
  const handleVerify = async () => {
    if (!isLoaded || !signUp || code.length < 6) return;
    setLoading(true);
    setError("");

    try {
      const result = await signUp.attemptEmailAddressVerification({ code });

      if (result.status === "complete") {
        // ✅ Session activate karo pehle
        await setActive({ session: result.createdSessionId });

        // ✅ Supabase mein profile save karo
        try {
          const res = await fetch("/api/create-profile", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: result.createdUserId,
              full_name: name.trim(),
              email: email.trim().toLowerCase(),
            }),
          });

          if (!res.ok) {
            const d = await res.json();
            console.error("❌ Profile save failed:", d.error);
          } else {
            console.log("✅ Profile saved to Supabase");
          }
        } catch (syncErr) {
          // Profile save fail ho toh bhi login hone do — non-blocking
          console.error("❌ Profile sync error:", syncErr);
        }

        setStep("success");
        setTimeout(() => { window.location.href = "/"; }, 2000);
      } else {
        setError("Verification incomplete. Try again.");
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.longMessage || err.errors?.[0]?.message || "Invalid code.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col lg:flex-row overflow-hidden font-sans">

      {/* Left Side — UI same */}
      <motion.div
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="lg:w-1/2 bg-gray-50/50 dark:bg-gray-800/20 flex flex-col items-center justify-center p-12 border-b lg:border-b-0 lg:border-r border-gray-100 dark:border-gray-800"
      >
        <div className="w-full flex flex-col items-center text-center">
          <h2 className="text-5xl md:text-6xl text-blue-600 font-black tracking-tighter mb-2">BuYzze</h2>
          <p className="text-gray-400 text-[10px] tracking-[0.6em] uppercase font-bold mb-6">Start Your Journey</p>
          <div className="w-full max-w-[340px]">
            <DotLottiePlayer src="/login-anim.lottie" autoplay loop />
          </div>
          <p className="text-gray-500 mt-8 max-w-sm text-sm font-medium leading-relaxed">
            Create an account to access the future of professional trading and community tools.
          </p>
        </div>
      </motion.div>

      {/* Right Side */}
      <div className="lg:w-1/2 flex items-center justify-center p-8 md:p-16 bg-white dark:bg-gray-900 overflow-y-auto">
        <AnimatePresence mode="wait">

          {/* SUCCESS */}
          {step === "success" && (
            <motion.div key="success" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="fixed inset-0 z-[100] bg-white dark:bg-[#05080d] flex flex-col items-center justify-center"
            >
              <div className="w-80 h-80 md:w-[450px] md:h-[450px]">
                <DotLottiePlayer src="/success.lottie" autoplay loop={false} />
              </div>
              <motion.h1 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1, transition: { delay: 0.5 } }}
                className="text-4xl font-medium tracking-tight text-blue-600 mt-4"
              >
                Welcome to Buyzze!
              </motion.h1>
              <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.3em] mt-4 animate-pulse">
                Setting up your profile...
              </p>
            </motion.div>
          )}

          {/* VERIFY */}
          {step === "verify" && (
            <motion.div key="verify" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="w-full max-w-md"
            >
              <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight mb-2">Verify Email</h1>
              <p className="text-gray-500 text-sm mb-1">6-digit code bheja gaya:</p>
              <p className="text-blue-600 font-black text-sm mb-8">{email}</p>

              <AnimatePresence>
                {error && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="mb-6 p-4 bg-red-50 dark:bg-red-900/10 text-red-600 text-xs font-bold uppercase rounded-2xl border border-red-100 text-center"
                  >{error}</motion.div>
                )}
              </AnimatePresence>

              <input
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                placeholder="0  0  0  0  0  0"
                maxLength={6}
                className="w-full px-6 py-5 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 focus:border-blue-500 outline-none font-black text-center text-2xl tracking-[0.5em] text-gray-900 dark:text-white mb-6 transition-all"
              />

              <button onClick={handleVerify} disabled={loading || code.length < 6}
                className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-black text-xs tracking-[0.2em] uppercase shadow-xl shadow-blue-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {loading ? <><Loader2 className="animate-spin" size={18} /> Verifying...</> : "Verify & Continue →"}
              </button>

              <div className="flex justify-between mt-6">
                <button onClick={() => { setStep("signup"); setError(""); setCode(""); }}
                  className="text-[10px] text-gray-400 font-bold uppercase tracking-widest hover:underline"
                >← Back</button>
                <button onClick={async () => { setError(""); await signUp?.prepareEmailAddressVerification({ strategy: "email_code" }); }}
                  className="text-[10px] text-blue-600 font-bold uppercase tracking-widest hover:underline"
                >Resend Code</button>
              </div>
            </motion.div>
          )}

          {/* SIGNUP FORM */}
          {step === "signup" && (
            <motion.div key="signup" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }}
              className="w-full max-w-md"
            >
              <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight mb-2">Create Account</h1>
              <p className="text-gray-500 text-sm mb-8">Enter your details to join BuYzze.</p>

              <AnimatePresence>
                {error && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="mb-6 p-4 bg-red-50 dark:bg-red-900/10 text-red-600 text-xs font-bold uppercase rounded-2xl border border-red-100 text-center"
                  >{error}</motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest ml-1">Full Name</label>
                  <input placeholder="e.g. Shubham Pandit" value={name} onChange={(e) => setName(e.target.value)}
                    className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 focus:border-blue-500 outline-none text-sm font-semibold text-gray-900 dark:text-white transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest ml-1">Email</label>
                  <input type="email" placeholder="e.g. email@example.com" value={email} onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 focus:border-blue-500 outline-none text-sm font-semibold text-gray-900 dark:text-white transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest ml-1">Password</label>
                  <input type="password" placeholder="Min 8 characters" value={password} onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 focus:border-blue-500 outline-none text-sm font-semibold text-gray-900 dark:text-white transition-all"
                  />
                </div>

                <div id="clerk-captcha" />

                <button onClick={handleSignup} disabled={loading || !email || !password || !name}
                  className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-black text-xs tracking-[0.2em] uppercase shadow-xl shadow-blue-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-3 mt-2"
                >
                  {loading ? <><Loader2 className="animate-spin" size={18} /> Creating Account...</> : "Create Account →"}
                </button>
              </div>

              <div className="mt-8 text-center pt-6 border-t border-gray-100 dark:border-gray-800">
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                  Already have an account?{" "}
                  <Link href="/login" className="text-blue-600 font-black hover:underline">Sign In</Link>
                </p>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
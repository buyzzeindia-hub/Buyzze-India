"use client";

import { useState } from "react";
import { useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { DotLottiePlayer } from "@dotlottie/react-player";
import "@dotlottie/react-player/dist/index.css";
import { Loader2 } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const { signIn, isLoaded, setActive } = useSignIn();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

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
        // 2 second delay tak user animation dekh sake, uske baad direct homepage par redirect
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

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col lg:flex-row overflow-hidden font-sans">

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
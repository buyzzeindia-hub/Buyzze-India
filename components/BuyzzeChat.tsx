// Full copy-paste code for BuyzzeChat.tsx
"use client";
import FloatingNav from "./FloatingNav";
import { DotLottiePlayer } from "@dotlottie/react-player";
import { useBuyzzeAuth } from "@/hooks/useBuyzzeAuth";

export default function Page() {
  const { user, isLoaded } = useBuyzzeAuth();

  // Show a clean loading state until auth is loaded
  if (!isLoaded || !user) {
    return (
        <div className="relative min-h-screen">
          <FloatingNav />
          <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-140px)]">
              <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        </div>
    );
  }

  // Greeting logic
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";
  const name = user?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "there";

  return (
    <div className="relative min-h-screen flex flex-col">
      {/* ── Desktop/Global Header ── */}
      <div className="w-full flex items-center justify-between p-6 px-8 border-b border-gray-100 dark:border-gray-800">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Buyzze AI Hunt</h1>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-full text-white text-sm font-semibold shadow-md active:scale-95 transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            Ask for Deals
          </button>
      </div>

      {/* ── Main Content Area ── */}
      <main className="flex-1 max-w-7xl mx-auto p-6 flex flex-col items-center justify-center min-h-[calc(100vh-160px)]">
        <div className="flex flex-col items-center justify-center text-center p-8 w-full max-w-xl mx-auto">
          
          <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-6 shadow-inner">
            <DotLottiePlayer src="/ai.lottie" autoplay loop className="w-16 h-16" />
          </div>
          
          <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2">{greeting}, {name}!</h2>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-10 max-w-[320px]">
            I'm ZZE-AI, your smart trading companion. I'm getting ready to help you hunt the best deals.
          </p>
          
          <div className="w-full bg-blue-50/50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 rounded-2xl p-8 relative overflow-hidden shadow-sm">
            <div className="text-blue-600 dark:text-blue-400 mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight mb-2">Coming Soon 🚀</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium leading-relaxed max-w-[360px] mx-auto">
              Our AI chat is currently in the lab. We're training our models to give you accurate pricing, negotiation tips, and scam protection!
            </p>
          </div>

        </div>
      </main>

      {/* ── Navigation ── */}
      <FloatingNav />
    </div>
  );
}
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLocation } from "@/features/location/context/LocationContext";
import { DotLottiePlayer } from "@dotlottie/react-player";
import { useUser } from "@clerk/nextjs"; // ✅ Clerk
import BuyzzeChat from "@/components/BuyzzeChat";

export default function FloatingNav() {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [locInput, setLocInput] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showAI, setShowAI] = useState(false);

  // ✅ Clerk se session check — supabase.auth.getSession() replace
  const { isSignedIn, isLoaded } = useUser();

  const { selectedCity, setSelectedCity, detectLocation, setIsNearbyActive } = useLocation();

  // Location suggestions — same as before
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (locInput.length < 3) { setSuggestions([]); return; }
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${locInput}&countrycodes=in&limit=5`);
        const data = await res.json();
        setSuggestions(data || []);
      } catch (err) { console.error(err); }
    }, 500);
    return () => clearTimeout(timer);
  }, [locInput]);

  const openAIChat = () => setShowAI(true);

  // ✅ Clerk load hone tak wait, agar logged in nahi → hide
  if (!isLoaded || !isSignedIn) return null;

  return (
    <>
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] w-[85%] max-w-[340px]">
        <div className="bg-white/90 dark:bg-[#0f172a]/95 backdrop-blur-3xl border border-gray-200 dark:border-gray-800 shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-full px-8 py-2 flex items-center justify-between transition-colors duration-300">

          {/* Chats — same */}
          <Link href="/chat" className="flex flex-col items-center group">
            <div className="w-10 h-10 flex items-center justify-center">
              <DotLottiePlayer src="/Chat.lottie" autoplay loop className="w-8 h-8 group-active:scale-90 transition-transform" />
            </div>
            <span className="text-[8px] font-bold uppercase text-gray-500 dark:text-gray-400">Chats</span>
          </Link>

          {/* ZZE-AI — same */}
          <button onClick={openAIChat} className="relative -top-6 scale-110">
            <div className="w-15 h-15 rounded-full bg-blue-100 shadow-2xl flex items-center justify-center border-4 border-white dark:border-[#05080d] active:scale-95 transition-all overflow-hidden">
              <DotLottiePlayer src="/ai.lottie" autoplay loop className="w-12 h-12" />
            </div>
            <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] font-black text-blue-600 dark:text-blue-400">
              ZZE-AI
            </span>
          </button>

          {/* Location — same */}
          <button onClick={() => setShowModal(true)} className="flex flex-col items-center group">
            <div className="w-10 h-10 flex items-center justify-center">
              <DotLottiePlayer src="/location1.lottie" autoplay loop className="w-10 h-10 group-active:scale-90 transition-transform" />
            </div>
            <span className="text-[8px] font-bold uppercase text-gray-500 dark:text-gray-400 max-w-[55px] truncate">
              {selectedCity || "Unknown"}
            </span>
          </button>
        </div>
      </div>

      {/* LOCATION MODAL — bilkul same */}
      {showModal && (
        <div className="fixed inset-0 z-[110] bg-black/40 dark:bg-black/80 backdrop-blur-md flex items-end justify-center p-4">
          <div className="bg-white dark:bg-[#0f172a] w-full max-w-sm rounded-[2.5rem] p-7 shadow-2xl border border-gray-100 dark:border-gray-800 animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-black uppercase tracking-tighter text-gray-900 dark:text-white">Choose City</h3>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-xs text-gray-500 dark:text-gray-400">✕</button>
            </div>
            <button
              onClick={() => { detectLocation(); setShowModal(false); }}
              className="w-full mb-4 py-4 bg-blue-600 text-white font-black rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              Auto Detect GPS
            </button>
            <div className="relative">
              <input
                type="text"
                placeholder="Search city..."
                className="w-full bg-gray-50 dark:bg-[#05080d] p-4 rounded-xl outline-none border border-gray-200 dark:border-gray-800 focus:border-blue-600 mb-2 text-sm text-gray-900 dark:text-white"
                value={locInput}
                onChange={(e) => setLocInput(e.target.value)}
              />
              <div className="max-h-48 overflow-y-auto scrollbar-hide">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setSelectedCity(s.display_name.split(',')[0]);
                      setIsNearbyActive(false);
                      setShowModal(false);
                    }}
                    className="w-full text-left p-4 hover:bg-blue-600/10 text-xs font-bold rounded-lg mb-1 border-b border-gray-50 dark:border-gray-900 text-gray-700 dark:text-white"
                  >
                    {s.display_name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI MODAL — same */}
      <BuyzzeChat isOpen={showAI} onClose={() => setShowAI(false)} />
    </>
  );
}
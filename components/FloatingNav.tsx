"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useLocation } from "@/features/location/context/LocationContext";
import { DotLottiePlayer } from "@dotlottie/react-player";
import { useBuyzzeAuth } from "@/hooks/useBuyzzeAuth"; // Updated to use Unified Auth Hook
import BuyzzeChat from "@/components/BuyzzeChat";
import { Plus } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────
type SearchEntry = [string, string, string, string, string];
type TownList = string[];
type TownEntry = [string, string, string, string, string, string];

// ── Normalize for search ───────────────────────────────────────
function normalize(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[-_]/g, " ")
    .trim();
}

// ── Skeleton ──────────────────────────────────────────────────
function Skeleton() {
  return (
    <div>
      {[1, 2, 3].map(i => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 20px" }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: "#f3f4f6", flexShrink: 0, animation: "skpulse 1.4s ease infinite" }} />
          <div style={{ flex: 1 }}>
            <div style={{ height: 12, borderRadius: 6, background: "#f3f4f6", width: "55%", marginBottom: 6, animation: "skpulse 1.4s ease infinite" }} />
            <div style={{ height: 10, borderRadius: 6, background: "#f3f4f6", width: "35%", animation: "skpulse 1.4s ease infinite" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function FloatingNav() {
  const { user, isLoaded } = useBuyzzeAuth(); // Connected to custom unified auth
  const {
    selectedCity, setSelectedCity,
    detectLocation, setIsNearbyActive, locating,
  } = useLocation();

  const [showModal, setShowModal]               = useState(false);
  const [locInput, setLocInput]                 = useState("");
  const [showAI, setShowAI]                     = useState(false);

  // Search state
  const [searchIndex, setSearchIndex]           = useState<SearchEntry[]>([]);
  const [townIndex, setTownIndex]               = useState<TownEntry[]>([]);
  const [districts, setDistricts]               = useState<SearchEntry[]>([]);
  const [townResults, setTownResults]           = useState<TownEntry[]>([]);
  const [searching, setSearching]               = useState(false);

  // Step-2 town selection
  const [selectedDistrict, setSelectedDistrict] = useState<SearchEntry | null>(null);
  const [towns, setTowns]                       = useState<TownList>([]);
  const [loadingTowns, setLoadingTowns]         = useState(false);
  const townCache                               = useRef<Record<string, TownList>>({});

  // ── Load indexes on mount ──────────────────────────────────
  useEffect(() => {
    fetch("/data/locations/search_index.json")
      .then(r => r.json())
      .then((d: SearchEntry[]) => setSearchIndex(d))
      .catch(() => {});
    fetch("/data/locations/popular_towns.json")
      .then(r => r.json())
      .then((d: TownEntry[]) => setTownIndex(d))
      .catch(() => {});
  }, []);

  // ── Instant search ─────────────────────────────────────────
  useEffect(() => {
    if (selectedDistrict) return;
    const q = normalize(locInput);
    if (q.length < 2) { setDistricts([]); setTownResults([]); setSearching(false); return; }
    setSearching(true);
    const t = setTimeout(() => {
      const words = q.split(" ").filter(Boolean);
      const matchAll = (fields: string[]) =>
        words.every(w => fields.some(f => f.includes(w)));

      const dRes = searchIndex
        .filter(e => matchAll([e[0], normalize(e[2])]))
        .sort((a, b) => (a[0].startsWith(words[0]) ? 0 : 1) - (b[0].startsWith(words[0]) ? 0 : 1) || a[0].localeCompare(b[0]))
        .slice(0, 4);
      const tRes = townIndex
        .filter(e => matchAll([e[0], normalize(e[2]), normalize(e[3])]))
        .sort((a, b) => (a[0].startsWith(words[0]) ? 0 : 1) - (b[0].startsWith(words[0]) ? 0 : 1) || a[0].localeCompare(b[0]))
        .slice(0, 6);
      setDistricts(dRes);
      setTownResults(tRes);
      setSearching(false);
    }, 150);
    return () => clearTimeout(t);
  }, [locInput, searchIndex, townIndex, selectedDistrict]);

  // ── Modal helpers ──
  const resetSearch = useCallback(() => {
    setLocInput("");
    setDistricts([]);
    setTownResults([]);
    setSelectedDistrict(null);
    setTowns([]);
  }, []);

  const closeModal = useCallback(() => {
    setShowModal(false);
    resetSearch();
  }, [resetSearch]);

  const openModal = useCallback(() => {
    setShowModal(true);
    resetSearch();
  }, [resetSearch]);

  // ── Lazy load towns for a district ────────────────────────
  const selectDistrict = useCallback(async (entry: SearchEntry) => {
    setSelectedDistrict(entry);
    setLoadingTowns(true);
    setTowns([]);
    const key = `${entry[3]}/${entry[4]}`;
    if (townCache.current[key]) {
      setTowns(townCache.current[key]);
      setLoadingTowns(false);
      return;
    }
    try {
      const res  = await fetch(`/data/locations/${entry[3]}/${entry[4]}.json`);
      const data: TownList = await res.json();
      townCache.current[key] = Array.isArray(data) ? data : [];
      setTowns(townCache.current[key]);
    } catch {
      setTowns([]);
    } finally {
      setLoadingTowns(false);
    }
  }, []);

  // ── Select town from district list (step 2) ───────────────
  const selectTown = useCallback((town: string | null) => {
    if (!selectedDistrict) return;
    const full = town && town !== selectedDistrict[1]
      ? `${town}, ${selectedDistrict[1]}, ${selectedDistrict[2]}`
      : `${selectedDistrict[1]}, ${selectedDistrict[2]}`;
    setSelectedCity(full);
    setIsNearbyActive(false);
    setShowModal(false);
    resetSearch();
  }, [selectedDistrict, setSelectedCity, setIsNearbyActive, resetSearch]);

  // ── Select town directly from search results ───────────────
  const selectTownDirect = useCallback((entry: TownEntry) => {
    setSelectedCity(`${entry[1]}, ${entry[2]}, ${entry[3]}`);
    setIsNearbyActive(false);
    setShowModal(false);
    resetSearch();
  }, [setSelectedCity, setIsNearbyActive, resetSearch]);

  // ── Listen for header location bar tap ────────────────────
  useEffect(() => {
    window.addEventListener("openLocationDrawer", openModal);
    return () => window.removeEventListener("openLocationDrawer", openModal);
  }, [openModal]);

  // Updated layout visibility check to intercept both custom fast-auth sessions and clerk
  if (!isLoaded || !user) return null;

  return (
    <>
      <style>{`
        @keyframes skpulse { 0%,100%{opacity:1} 50%{opacity:0.45} }
        @keyframes locFadeIn { from{opacity:0} to{opacity:1} }
        @keyframes locSheetUp { from{transform:translateY(100%)} to{transform:translateY(0)} }
        .loc-row:active { background: #f3f4f6 !important; }
      `}</style>

      {/* ── Navbar ── */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] w-[85%] max-w-[340px]">
        <div className="bg-white/90 dark:bg-[#0f172a]/95 backdrop-blur-3xl border border-gray-200 dark:border-gray-800 shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-full px-6 py-2 flex items-center justify-between transition-colors duration-300">

          {/* Mobile */}
          <div className="flex md:hidden w-full items-center justify-between">
            <Link href="/chat" className="flex flex-col items-center group">
              <div className="w-10 h-10 flex items-center justify-center">
                <DotLottiePlayer src="/Chat.lottie" autoplay loop className="w-8 h-8 group-active:scale-90 transition-transform" />
              </div>
              <span className="text-[8px] font-bold uppercase text-gray-500 dark:text-gray-400">Chats</span>
            </Link>

            <button onClick={() => setShowAI(true)} className="relative -top-6 scale-110">
              <div className="w-15 h-15 rounded-full bg-blue-100 shadow-2xl flex items-center justify-center border-4 border-white dark:border-[#05080d] active:scale-95 transition-all overflow-hidden">
                <DotLottiePlayer src="/ai.lottie" autoplay loop className="w-12 h-12" />
              </div>
              <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] font-black text-blue-600 dark:text-blue-400">ZZE-AI</span>
            </button>

            <Link href="/sell" className="flex flex-col items-center group">
              <div className="w-10 h-10 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center group-active:scale-90 transition-transform shadow-md shadow-blue-200 dark:shadow-blue-900">
                  <Plus size={16} className="text-white" />
                </div>
              </div>
              <span className="text-[8px] font-bold uppercase text-gray-500 dark:text-gray-400">Sell</span>
            </Link>
          </div>

          {/* Desktop */}
          <div className="hidden md:flex w-full items-center justify-between">
            <Link href="/chat" className="flex flex-col items-center group">
              <div className="w-10 h-10 flex items-center justify-center">
                <DotLottiePlayer src="/Chat.lottie" autoplay loop className="w-8 h-8 group-active:scale-90 transition-transform" />
              </div>
              <span className="text-[8px] font-bold uppercase text-gray-500 dark:text-gray-400">Chats</span>
            </Link>

            <button onClick={() => setShowAI(true)} className="relative -top-6 scale-110">
              <div className="w-15 h-15 rounded-full bg-blue-100 shadow-2xl flex items-center justify-center border-4 border-white dark:border-[#05080d] active:scale-95 transition-all overflow-hidden">
                <DotLottiePlayer src="/ai.lottie" autoplay loop className="w-12 h-12" />
              </div>
              <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] font-black text-blue-600 dark:text-blue-400">ZZE-AI</span>
            </button>

            <Link href="/sell" className="flex flex-col items-center group">
              <div className="w-10 h-10 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center group-active:scale-90 transition-transform shadow-md">
                  <Plus size={16} className="text-white" />
                </div>
              </div>
              <span className="text-[8px] font-bold uppercase text-gray-500 dark:text-gray-400">Sell</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ── Mobile Location Bottom Sheet ── */}
      {showModal && (
        <>
          {/* Overlay */}
          <div
            className="md:hidden fixed inset-0 z-[200]"
            style={{ background: "rgba(0,0,0,0.45)", animation: "locFadeIn 0.2s ease" }}
            onClick={closeModal}
          />

          {/* Sheet */}
          <div
            className="md:hidden fixed left-0 right-0 bottom-0 z-[210]"
            style={{
              background: "#fff",
              borderRadius: "20px 20px 0 0",
              boxShadow: "0 -8px 40px rgba(0,0,0,0.15)",
              animation: "locSheetUp 0.3s cubic-bezier(0.4,0,0.2,1)",
              maxHeight: "82vh",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Handle */}
            <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 4px" }}>
              <div style={{ width: 36, height: 4, borderRadius: 2, background: "#e5e7eb" }} />
            </div>

            {/* Header row */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 20px 12px" }}>
              {selectedDistrict ? (
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <button
                    onClick={() => { setSelectedDistrict(null); setTowns([]); }}
                    style={{ background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex", alignItems: "center" }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2.5"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
                  </button>
                  <div>
                    <p style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", margin: 0 }}>{selectedDistrict[1]}</p>
                    <p style={{ fontSize: 11, color: "#9ca3af", margin: "1px 0 0" }}>{selectedDistrict[2]} · Select area or use entire district</p>
                  </div>
                </div>
              ) : (
                <div>
                  <p style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", margin: 0 }}>Your Location</p>
                  {user && (
                    <p style={{ fontSize: 11, color: "#9ca3af", margin: "1px 0 0" }}>
                      {user.full_name || user.email?.split("@")[0] || "User"}
                    </p>
                  )}
                </div>
              )}
              <button
                onClick={closeModal}
                style={{ width: 32, height: 32, borderRadius: "50%", background: "#f3f4f6", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            {/* ── STEP 1: Search ── */}
            {!selectedDistrict && (
              <>
                {/* Search input */}
                <div style={{ padding: "0 16px 10px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#f8fafc", borderRadius: 14, padding: "12px 16px", border: "1.5px solid #e5e7eb" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                    <input
                      type="search"
                      autoComplete="off"
                      autoCapitalize="off"
                      spellCheck={false}
                      placeholder="Search city, town or district…"
                      value={locInput}
                      onChange={e => setLocInput(e.target.value)}
                      style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: 14, color: "#111827", fontFamily: "inherit" }}
                    />
                    {locInput && (
                      <button
                        onClick={() => { setLocInput(""); setDistricts([]); setTownResults([]); }}
                        style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      </button>
                    )}
                  </div>
                </div>

                {/* GPS */}
                <div style={{ padding: "0 16px 8px" }}>
                  <button
                    onClick={() => { detectLocation(); closeModal(); }}
                    style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "11px 16px", borderRadius: 14, background: "#eff6ff", border: "1.5px solid #bfdbfe", cursor: "pointer" }}
                  >
                    <div style={{ width: 34, height: 34, borderRadius: 10, background: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg>
                    </div>
                    <div style={{ textAlign: "left" }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: "#1d4ed8", margin: 0 }}>Use my current location</p>
                      <p style={{ fontSize: 11, color: "#6b7280", margin: "1px 0 0" }}>Auto-detect via GPS</p>
                    </div>
                  </button>
                </div>

                {/* Divider */}
                {!locInput && (
                  <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 20px 6px" }}>
                    <div style={{ flex: 1, height: 1, background: "#f3f4f6" }} />
                    <span style={{ fontSize: 11, color: "#d1d5db", fontWeight: 500 }}>or search manually</span>
                    <div style={{ flex: 1, height: 1, background: "#f3f4f6" }} />
                  </div>
                )}

                {/* Current location */}
                {selectedCity && !locInput && (
                  <div style={{ margin: "0 16px 8px", padding: "10px 14px", background: "#f8fafc", borderRadius: 12, border: "1px solid #e5e7eb" }}>
                    <p style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 3px" }}>Current Location</p>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" style={{ flexShrink: 0 }}><path d="M12 2a7 7 0 0 1 7 7c0 5.25-7 13-7 13S5 14.25 5 9a7 7 0 0 1 7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>
                      <p style={{ fontSize: 12, fontWeight: 600, color: "#111827", margin: 0 }}>{selectedCity}</p>
                    </div>
                  </div>
                )}

                {/* Results */}
                <div style={{ flex: 1, overflowY: "auto", padding: "4px 0 20px" }}>
                  {searching ? (
                    <Skeleton />
                  ) : (districts.length > 0 || townResults.length > 0) ? (
                    <>
                      {/* Districts */}
                      {districts.length > 0 && (
                        <>
                          <p style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.1em", margin: 0, padding: "8px 20px 4px" }}>Districts</p>
                          {districts.map((entry, i) => (
                            <button key={i} className="loc-row"
                              onClick={() => selectDistrict(entry)}
                              style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "10px 20px", background: "transparent", border: "none", borderBottom: "1px solid #f9fafb", cursor: "pointer", textAlign: "left" }}>
                              <div style={{ width: 34, height: 34, borderRadius: 10, background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><path d="M12 2a7 7 0 0 1 7 7c0 5.25-7 13-7 13S5 14.25 5 9a7 7 0 0 1 7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>
                              </div>
                              <div style={{ minWidth: 0, flex: 1 }}>
                                <p style={{ fontSize: 14, fontWeight: 600, color: "#111827", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{entry[1]}</p>
                                <p style={{ fontSize: 11, color: "#9ca3af", margin: "1px 0 0" }}>{entry[2]}</p>
                              </div>
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="2"><polyline points="9,18 15,12 9,6"/></svg>
                            </button>
                          ))}
                        </>
                      )}

                      {/* Towns */}
                      {townResults.length > 0 && (
                        <>
                          <p style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.1em", margin: 0, padding: "8px 20px 4px" }}>Towns & Cities</p>
                          {townResults.map((entry, i) => (
                            <button key={i} className="loc-row"
                              onClick={() => selectTownDirect(entry)}
                              style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "10px 20px", background: "transparent", border: "none", borderBottom: "1px solid #f9fafb", cursor: "pointer", textAlign: "left" }}>
                              <div style={{ width: 34, height: 34, borderRadius: 10, background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><rect x="3" y="10" width="18" height="11" rx="1"/><path d="M9 21V10M15 21V10M3 14h18M7 10V7a5 5 0 0 1 10 0v3"/></svg>
                              </div>
                              <div style={{ minWidth: 0, flex: 1 }}>
                                <p style={{ fontSize: 14, fontWeight: 600, color: "#111827", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{entry[1]}</p>
                                <p style={{ fontSize: 11, color: "#9ca3af", margin: "1px 0 0" }}>{entry[2]}, {entry[3]}</p>
                              </div>
                            </button>
                          ))}
                        </>
                      )}
                    </>
                  ) : locInput.length >= 2 ? (
                    <div style={{ textAlign: "center", padding: "24px 20px" }}>
                      <p style={{ fontSize: 13, color: "#9ca3af", margin: 0 }}>No results for "{locInput}"</p>
                    </div>
                  ) : null}
                </div>
              </>
            )}

            {/* ── STEP 2: Town selection ── */}
            {selectedDistrict && (
              <div style={{ flex: 1, overflowY: "auto", padding: "0 0 20px" }}>
                {/* Use entire district */}
                <button
                  className="loc-row"
                  onClick={() => selectTown(null)}
                  style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "12px 20px", background: "#eff6ff", border: "none", borderBottom: "2px solid #bfdbfe", cursor: "pointer", textAlign: "left" }}
                >
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><path d="M12 2a7 7 0 0 1 7 7c0 5.25-7 13-7 13S5 14.25 5 9a7 7 0 0 1 7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "#1d4ed8", margin: 0 }}>Use entire district</p>
                    <p style={{ fontSize: 11, color: "#6b7280", margin: "1px 0 0" }}>All products in {selectedDistrict[1]}</p>
                  </div>
                </button>

                {loadingTowns ? (
                  <Skeleton />
                ) : towns.length > 0 ? (
                  <>
                    <div style={{ padding: "10px 20px 4px" }}>
                      <p style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.1em", margin: 0 }}>
                        Villages & Areas ({towns.length})
                      </p>
                    </div>
                    {towns.map((town, i) => (
                      <button key={i} className="loc-row"
                        onClick={() => selectTown(town)}
                        style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "10px 20px", background: "transparent", border: "none", borderBottom: "1px solid #f9fafb", cursor: "pointer", textAlign: "left" }}>
                        <div style={{ width: 34, height: 34, borderRadius: 10, background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><rect x="3" y="10" width="18" height="11" rx="1"/><path d="M9 21V10M15 21V10M3 14h18M7 10V7a5 5 0 0 1 10 0v3"/></svg>
                        </div>
                        <p style={{ fontSize: 13, fontWeight: 500, color: "#111827", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{town}</p>
                      </button>
                    ))}
                  </>
                ) : (
                  <div style={{ textAlign: "center", padding: "24px 20px" }}>
                    <p style={{ fontSize: 13, color: "#9ca3af", margin: 0 }}>No area data available</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {/* AI Panel Desktop */}
      <div
        style={{ position: "fixed", top: 80, bottom: 100, right: showAI ? 24 : -440, width: 420, zIndex: 9999, transition: "right 0.4s cubic-bezier(0.34,1.1,0.64,1)", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)", borderRadius: 24, overflow: "hidden", border: "1px solid rgba(255,255,255,0.1)", pointerEvents: showAI ? "auto" : "none" }}
        className="hidden md:block"
      >
        <BuyzzeChat isOpen={showAI} onClose={() => setShowAI(false)} isDesktop={true} isFloating={true} />
      </div>

      {/* AI Panel Mobile */}
      <div className="block md:hidden">
        <BuyzzeChat isOpen={showAI} onClose={() => setShowAI(false)} isDesktop={false} isFloating={false} />
      </div>
    </>
  );
}
"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useBuyzzeAuth } from "@/hooks/useBuyzzeAuth"; 
import SearchBar from "./SearchBar";
import { useLocation } from "@/features/location/context/LocationContext";
import { MapPin, ChevronDown, Navigation, Search, X, Loader2, ChevronRight, Plus } from "lucide-react";

type SearchEntry = [string, string, string, string, string];
type TownList    = string[];
type TownEntry   = [string, string, string, string, string, string];

function normalize(str: string): string {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().replace(/[-_]/g, " ").trim();
}

export default function Header() {
  const router = useRouter();
  const { user, isLoaded } = useBuyzzeAuth(); 
  const { selectedCity, setSelectedCity, detectLocation, setIsNearbyActive, locating } = useLocation();

  const [open, setOpen]                         = useState(false);
  const [locInput, setLocInput]                 = useState("");
  const [searching, setSearching]               = useState(false);
  const [searchIndex, setSearchIndex]           = useState<SearchEntry[]>([]);
  const [townIndex, setTownIndex]               = useState<TownEntry[]>([]);
  const [districts, setDistricts]               = useState<SearchEntry[]>([]);
  const [townResults, setTownResults]           = useState<TownEntry[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState<SearchEntry | null>(null);
  const [towns, setTowns]                       = useState<TownList>([]);
  const [loadingTowns, setLoadingTowns]         = useState(false);
  const townCache                               = useRef<Record<string, TownList>>({});
  const dropRef                                 = useRef<HTMLDivElement>(null);

  // ── Hydration-Safe Local Storage Auth Sync ──
  const [hasFastAuthToken, setHasFastAuthToken] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setHasFastAuthToken(localStorage.getItem("buyzze_logged_in") === "true");
    }
  }, [user]);

  const isUserLoggedIn = user || hasFastAuthToken;

  const resetSearch = useCallback(() => {
    setLocInput("");
    setDistricts([]);
    setTownResults([]);
    setSelectedDistrict(null);
    setTowns([]);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setOpen(false);
        resetSearch();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [resetSearch]);

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

  const selectTown = useCallback((town: string | null) => {
    if (!selectedDistrict) return;
    const full = town && town !== selectedDistrict[1]
      ? `${town}, ${selectedDistrict[1]}, ${selectedDistrict[2]}`
      : `${selectedDistrict[1]}, ${selectedDistrict[2]}`;
    setSelectedCity(full);
    setIsNearbyActive(false);
    setOpen(false);
    resetSearch();
  }, [selectedDistrict, setSelectedCity, setIsNearbyActive, resetSearch]);

  const selectTownDirect = useCallback((entry: TownEntry) => {
    setSelectedCity(`${entry[1]}, ${entry[2]}, ${entry[3]}`);
    setIsNearbyActive(false);
    setOpen(false);
    resetSearch();
  }, [setSelectedCity, setIsNearbyActive, resetSearch]);

  const handleDetect = useCallback(() => {
    detectLocation();
    setOpen(false);
    resetSearch();
  }, [detectLocation, resetSearch]);

  const cityLabel = selectedCity || "Set location";

  // Avatar initial letter resolving safely
  const getInitial = () => {
    if (user?.email) return user.email.charAt(0).toUpperCase();
    if (user?.full_name) return user.full_name.charAt(0).toUpperCase();
    return "U";
  };

  return (
    <>
      <header className="sticky top-0 z-[100] bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 h-16 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between gap-3">

          {/* Logo */}
          <Link href="/" className="cursor-pointer shrink-0 flex items-center gap-2">
            <div className="logo-bounce">
              <Image src="/logo.png" alt="Buyzze" width={38} height={38} priority style={{ borderRadius: 10 }} />
            </div>
            <span className="text-xl font-black text-blue-600 tracking-tighter hidden sm:block">BuYzze</span>
            <style>{`
              .logo-bounce{animation:logoBounceIn 0.7s cubic-bezier(0.34,1.6,0.64,1) forwards}
              .logo-bounce:hover{animation:logoWiggle 0.5s cubic-bezier(0.34,1.6,0.64,1)}
              @keyframes logoBounceIn{0%{transform:translateY(-40px) scale(0.5) rotate(-15deg);opacity:0}60%{transform:translateY(4px) scale(1.1) rotate(3deg);opacity:1}80%{transform:translateY(-2px) scale(0.97) rotate(-1deg)}100%{transform:translateY(0) scale(1) rotate(0deg);opacity:1}}
              @keyframes logoWiggle{0%{transform:rotate(0deg) scale(1)}25%{transform:rotate(-8deg) scale(1.1)}50%{transform:rotate(6deg) scale(1.08)}75%{transform:rotate(-4deg) scale(1.05)}100%{transform:rotate(0deg) scale(1)}}
              @keyframes locReveal{from{opacity:0;transform:translateX(-8px)}to{opacity:1;transform:translateX(0)}}
              .loc-reveal{animation:locReveal 0.4s cubic-bezier(0.4,0,0.2,1) both}
              @keyframes dot1{0%,80%,100%{transform:translateY(0);opacity:0.3}40%{transform:translateY(-4px);opacity:1}}
              @keyframes dot2{0%,80%,100%{transform:translateY(0);opacity:0.3}40%{transform:translateY(-4px);opacity:1}}
              @keyframes dot3{0%,80%,100%{transform:translateY(0);opacity:0.3}40%{transform:translateY(-4px);opacity:1}}
              .dot1{animation:dot1 1.2s 0s infinite}.dot2{animation:dot2 1.2s 0.2s infinite}.dot3{animation:dot3 1.2s 0.4s infinite}
              @keyframes locDrop{from{opacity:0;transform:translateY(-6px) scale(0.98)}to{opacity:1;transform:translateY(0) scale(1)}}
              .loc-dd:hover{background:rgba(0,0,0,0.04)}
            `}</style>
          </Link>

          {/* Search bar */}
          <div className="flex-1 max-w-2xl">
            <SearchBar />
          </div>

          {/* PC right */}
          <div className="hidden md:flex items-center gap-3 shrink-0">

            {/* Location dropdown */}
            <div ref={dropRef} className="relative">
              <button
                onClick={() => setOpen(o => !o)}
                className="flex items-center gap-1.5 hover:opacity-75 transition-opacity"
              >
                <MapPin size={14} className="text-blue-500 dark:text-blue-400 shrink-0" />
                <span
                  key={locating ? "locating" : cityLabel}
                  className={`text-[13px] font-semibold text-gray-800 dark:text-gray-100 whitespace-nowrap ${!locating ? "loc-reveal" : ""}`}
                  style={{ maxWidth: 240, overflow: "hidden", textOverflow: "ellipsis", display: "block" }}
                >
                  {locating ? (
                    <span className="inline-flex items-center gap-[3px] h-[14px]">
                      <span className="text-[11px] text-gray-400 mr-1">Detecting</span>
                      <span className="dot1 inline-block w-1 h-1 rounded-full bg-blue-500" />
                      <span className="dot2 inline-block w-1 h-1 rounded-full bg-blue-500" />
                      <span className="dot3 inline-block w-1 h-1 rounded-full bg-blue-500" />
                    </span>
                  ) : cityLabel}
                </span>
                <ChevronDown size={12} className={`text-gray-400 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
              </button>

              {/* Dropdown panel */}
              {open && (
                <div
                  className="absolute right-0 top-[calc(100%+12px)] w-[340px] bg-white dark:bg-[#0f172a] rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden z-[200]"
                  style={{ animation: "locDrop 0.18s cubic-bezier(0.4,0,0.2,1)", maxHeight: 460, display: "flex", flexDirection: "column" }}
                >
                  {/* STEP 1 */}
                  {!selectedDistrict && (
                    <>
                      {selectedCity && (
                        <div className="flex items-center gap-2 px-4 pt-3 pb-2.5 border-b border-gray-100 dark:border-gray-800">
                          <MapPin size={12} className="text-blue-500 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider">Current</p>
                            <p className="text-[12px] font-bold text-gray-800 dark:text-gray-100 truncate">{selectedCity}</p>
                          </div>
                        </div>
                      )}

                      <button onClick={handleDetect} disabled={locating}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors border-b border-gray-100 dark:border-gray-800 disabled:opacity-50">
                        {locating
                          ? <Loader2 size={14} className="text-blue-500 animate-spin shrink-0" />
                          : <Navigation size={14} className="text-blue-500 shrink-0" />}
                        <div className="text-left">
                          <p className="text-[12px] font-bold text-blue-600 dark:text-blue-400">{locating ? "Detecting…" : "Use my current location"}</p>
                          <p className="text-[10px] text-gray-400">GPS accurate</p>
                        </div>
                      </button>

                      <div className="px-3 pt-2.5 pb-2">
                        <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 rounded-xl px-3 py-2 border border-gray-200 dark:border-gray-700 focus-within:border-blue-400 transition-colors">
                          <Search size={12} className="text-gray-400 shrink-0" />
                          <input
                            autoFocus
                            type="text"
                            placeholder="Search city, town or district…"
                            className="flex-1 bg-transparent outline-none text-[13px] text-gray-800 dark:text-gray-100 placeholder:text-gray-400"
                            value={locInput}
                            onChange={e => setLocInput(e.target.value)}
                          />
                          {locInput && (
                            <button onClick={() => { setLocInput(""); setDistricts([]); setTownResults([]); }}>
                              <X size={11} className="text-gray-400" />
                            </button>
                          )}
                          {searching && <Loader2 size={11} className="text-gray-400 animate-spin shrink-0" />}
                        </div>
                      </div>

                      <div className="overflow-y-auto flex-1 pb-2">
                        {searching ? (
                          [1, 2, 3].map(i => (
                            <div key={i} className="flex items-center gap-3 px-4 py-2.5">
                              <div className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-800 shrink-0 animate-pulse" />
                              <div className="flex-1">
                                <div className="h-3 rounded bg-gray-100 dark:bg-gray-800 w-3/5 mb-1.5 animate-pulse" />
                                <div className="h-2 rounded bg-gray-100 dark:bg-gray-800 w-2/5 animate-pulse" />
                              </div>
                            </div>
                          ))
                        ) : (districts.length > 0 || townResults.length > 0) ? (
                          <>
                            {districts.length > 0 && (
                              <>
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest px-4 pt-2 pb-1">Districts</p>
                                {districts.map((entry, i) => (
                                  <button key={i} className="loc-dd w-full flex items-center gap-3 px-4 py-2 transition-colors text-left"
                                    onClick={() => selectDistrict(entry)}>
                                    <div className="w-7 h-7 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center shrink-0">
                                      <MapPin size={11} className="text-gray-400 dark:text-gray-500" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <p className="text-[13px] font-semibold text-gray-800 dark:text-gray-100 truncate">{entry[1]}</p>
                                      <p className="text-[10px] text-gray-400 truncate">{entry[2]}</p>
                                    </div>
                                    <ChevronRight size={11} className="text-gray-300 shrink-0" />
                                  </button>
                                ))}
                              </>
                            )}
                            {townResults.length > 0 && (
                              <>
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest px-4 pt-2 pb-1">Towns & Cities</p>
                                {townResults.map((entry, i) => (
                                  <button key={i} className="loc-dd w-full flex items-center gap-3 px-4 py-2 transition-colors text-left"
                                    onClick={() => selectTownDirect(entry)}>
                                    <div className="w-7 h-7 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center shrink-0">
                                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><rect x="3" y="10" width="18" height="11" rx="1"/><path d="M9 21V10M15 21V10M3 14h18M7 10V7a5 5 0 0 1 10 0v3"/></svg>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <p className="text-[13px] font-semibold text-gray-800 dark:text-gray-100 truncate">{entry[1]}</p>
                                      <p className="text-[10px] text-gray-400 truncate">{entry[2]}, {entry[3]}</p>
                                    </div>
                                  </button>
                                ))}
                              </>
                            )}
                          </>
                        ) : locInput.length >= 2 ? (
                          <p className="text-[12px] text-gray-400 text-center py-4">No results for "{locInput}"</p>
                        ) : (
                          <p className="text-[11px] text-gray-300 dark:text-gray-600 text-center py-3">Type to search any city, town or district</p>
                        )}
                      </div>
                    </>
                  )}

                  {/* STEP 2 */}
                  {selectedDistrict && (
                    <>
                      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-gray-100 dark:border-gray-800">
                        <button
                          onClick={() => { setSelectedDistrict(null); setTowns([]); }}
                          className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-gray-600 dark:text-gray-400"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
                        </button>
                        <div className="min-w-0">
                          <p className="text-[13px] font-bold text-gray-800 dark:text-gray-100 truncate">{selectedDistrict[1]}</p>
                          <p className="text-[10px] text-gray-400">{selectedDistrict[2]}</p>
                        </div>
                      </div>

                      <div className="overflow-y-auto flex-1 pb-2">
                        <button
                          className="loc-dd w-full flex items-center gap-3 px-4 py-2.5 transition-colors text-left border-b border-blue-50 dark:border-blue-900/20"
                          onClick={() => selectTown(null)}
                        >
                          <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
                            <MapPin size={11} className="text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <p className="text-[12px] font-bold text-blue-600 dark:text-blue-400">Use entire district</p>
                            <p className="text-[10px] text-gray-400">All products in {selectedDistrict[1]}</p>
                          </div>
                        </button>

                        {loadingTowns ? (
                          [1, 2, 3, 4].map(i => (
                            <div key={i} className="flex items-center gap-3 px-4 py-2.5">
                              <div className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-800 shrink-0 animate-pulse" />
                              <div className="flex-1">
                                <div className="h-3 rounded bg-gray-100 dark:bg-gray-800 w-2/3 mb-1 animate-pulse" />
                              </div>
                            </div>
                          ))
                        ) : towns.length > 0 ? (
                          <>
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest px-4 pt-2 pb-1">Villages & Areas ({towns.length})</p>
                            {towns.map((town, i) => (
                              <button key={i} className="loc-dd w-full flex items-center gap-3 px-4 py-2 transition-colors text-left"
                                onClick={() => selectTown(town)}>
                                <div className="w-7 h-7 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center shrink-0">
                                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><rect x="3" y="10" width="18" height="11" rx="1"/><path d="M9 21V10M15 21V10M3 14h18M7 10V7a5 5 0 0 1 10 0v3"/></svg>
                                </div>
                                <p className="text-[13px] font-medium text-gray-800 dark:text-gray-100 truncate">{town}</p>
                              </button>
                            ))}
                          </>
                        ) : (
                          <p className="text-[12px] text-gray-400 text-center py-4">No area data available</p>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* ✅ STRICT PROFILE/LOGIN REPLACEMENT (PC) */}
            {!isLoaded ? (
              <div className="h-9 w-24 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-lg" />
            ) : isUserLoggedIn ? (
              <Link href="/profile"
                className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold border-2 border-white shadow-md hover:scale-105 transition-transform">
                {getInitial()}
              </Link>
            ) : (
              <a href="/login"
                className="px-5 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 transition flex items-center justify-center">
                Login
              </a>
            )}
          </div>

          {/* ✅ STRICT PROFILE/LOGIN REPLACEMENT (Mobile) */}
          <div className="flex md:hidden items-center gap-2 shrink-0">
            <Link href="/sell" className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-xl text-[12px] font-bold">
              <Plus size={13} />Sell
            </Link>
            {!isLoaded ? (
              <div className="h-8 w-8 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-full" />
            ) : isUserLoggedIn ? (
              <Link href="/profile"
                className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold border-2 border-white shadow-md hover:scale-105 transition-transform">
                {getInitial()}
              </Link>
            ) : (
              <a href="/login"
                className="px-3 py-1.5 bg-blue-600 text-white rounded-lg font-bold text-[12px] flex items-center justify-center">
                Login
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Mobile location sub-bar */}
      <div
        className="md:hidden sticky top-16 z-[99] bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800"
        onClick={() => window.dispatchEvent(new CustomEvent("openLocationDrawer"))}
      >
        <div className="flex items-center gap-1.5 px-3 py-2 cursor-pointer active:bg-gray-50 dark:active:bg-gray-800 transition-colors">
          <MapPin size={12} className="text-blue-500 shrink-0" />
          <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 shrink-0 uppercase tracking-wide">Deliver to</span>
          {locating ? (
            <span className="flex items-center gap-1 ml-1">
              <span className="text-[11px] font-bold text-gray-700 dark:text-gray-200">Detecting</span>
              <span className="flex gap-[3px] ml-0.5">
                <span className="inline-block w-1 h-1 rounded-full bg-blue-500" style={{ animation: "mldot 1.2s 0s infinite" }} />
                <span className="inline-block w-1 h-1 rounded-full bg-blue-500" style={{ animation: "mldot 1.2s 0.2s infinite" }} />
                <span className="inline-block w-1 h-1 rounded-full bg-blue-500" style={{ animation: "mldot 1.2s 0.4s infinite" }} />
              </span>
            </span>
          ) : (
            <span key={selectedCity}
              className="text-[12px] font-bold text-gray-800 dark:text-gray-100 truncate flex-1 ml-0.5"
              style={{ animation: selectedCity ? "mlreveal 0.35s ease both" : "none" }}>
              {selectedCity || "Set your location"}
            </span>
          )}
          <ChevronDown size={11} className="text-gray-400 shrink-0 ml-auto" />
        </div>
        <style>{`
          @keyframes mldot{0%,80%,100%{transform:translateY(0);opacity:.3}40%{transform:translateY(-3px);opacity:1}}
          @keyframes mlreveal{from{opacity:0;transform:translateX(-5px)}to{opacity:1;transform:translateX(0)}}
        `}</style>
      </div>
    </>
  );
}
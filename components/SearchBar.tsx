"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, X, ArrowLeft, TrendingUp, Clock, Smartphone, Delete } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

// ─── Constants ────────────────────────────────────────────────────────────────
const TRENDING = [
  "iPhone 15", "Samsung S24", "OnePlus 12",
  "Google Pixel 8", "Nothing Phone 2", "Redmi Note 13",
];
const MAX_RECENT = 6;
const RECENT_KEY = "buyzze_recent_searches";

// ─── Styles (injected once) ───────────────────────────────────────────────────
const STYLES = `
  @keyframes sbFadeUp {
    from { opacity:0; transform:translateY(10px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes sbOverlayIn {
    from { opacity:0; }
    to   { opacity:1; }
  }
  @keyframes sbSlideDown {
    from { opacity:0; transform:translateY(-8px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes sbPop {
    0%   { transform:scale(0.85); opacity:0; }
    65%  { transform:scale(1.04); }
    100% { transform:scale(1);    opacity:1; }
  }
  @keyframes sbPulse {
    0%,100% { opacity:1; }
    50%     { opacity:0.45; }
  }
  @keyframes sbSpin {
    to { transform:rotate(360deg); }
  }
  .sb-overlay-in   { animation: sbOverlayIn 0.22s ease both; }
  .sb-slide-down   { animation: sbSlideDown 0.22s cubic-bezier(.22,.68,0,1.1) both; }
  .sb-fade-up      { animation: sbFadeUp 0.28s cubic-bezier(.22,.68,0,1.1) both; }
  .sb-pop          { animation: sbPop 0.25s cubic-bezier(.22,.68,0,1.2) both; }
  .sb-spinner      { animation: sbSpin 0.75s linear infinite; }
  .sb-pulse        { animation: sbPulse 1.4s ease-in-out infinite; }
  .sb-input:focus  { box-shadow: 0 0 0 3px rgba(37,99,235,0.18); }
  .sb-suggestion:hover .sb-suggestion-icon { color: #2563eb; }
  .trending-chip:hover { transform: translateY(-1px) scale(1.03); }
  .trending-chip { transition: all 0.18s cubic-bezier(.22,.68,0,1.2); }
`;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getRecent(): string[] {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]"); }
  catch { return []; }
}
function saveRecent(query: string) {
  try {
    const prev = getRecent().filter(q => q.toLowerCase() !== query.toLowerCase());
    localStorage.setItem(RECENT_KEY, JSON.stringify([query, ...prev].slice(0, MAX_RECENT)));
  } catch {}
}
function removeRecent(query: string) {
  try {
    const updated = getRecent().filter(q => q !== query);
    localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
  } catch {}
}

/** Bold-highlights matching substring in suggestion */
function Highlighted({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <span>{text}</span>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <span>{text}</span>;
  return (
    <span>
      {text.slice(0, idx)}
      <span className="text-blue-600 dark:text-blue-400 font-black">{text.slice(idx, idx + query.length)}</span>
      {text.slice(idx + query.length)}
    </span>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function SearchBar() {
  const [query,       setQuery]       = useState("");
  const [isFocused,   setIsFocused]   = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [recent,      setRecent]      = useState<string[]>([]);
  const [loading,     setLoading]     = useState(false);
  const [activeIdx,   setActiveIdx]   = useState(-1);   // keyboard nav

  const router   = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Load recent on open
  useEffect(() => { if (isFocused) setRecent(getRecent()); }, [isFocused]);

  // Suggestion fetch (300ms debounce)
  useEffect(() => {
    setActiveIdx(-1);
    if (query.trim().length < 2) { setSuggestions([]); setLoading(false); return; }
    setLoading(true);
    const t = setTimeout(async () => {
      const { data } = await supabase
        .from("products")
        .select("title, brand")
        .or(`title.ilike.%${query}%,brand.ilike.%${query}%,model.ilike.%${query}%`)
        .limit(8);
      if (data) {
        const titles = Array.from(new Set(data.map((i: any) => i.title))).slice(0, 6) as string[];
        setSuggestions(titles);
      }
      setLoading(false);
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  // Lock body scroll when overlay open
  useEffect(() => {
    document.body.style.overflow = isFocused ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isFocused]);

  const open  = () => { setIsFocused(true);  setTimeout(() => inputRef.current?.focus(), 50); };
  const close = useCallback(() => {
    setIsFocused(false);
    setQuery("");
    setSuggestions([]);
    setActiveIdx(-1);
    inputRef.current?.blur();
  }, []);

  const handleSearch = useCallback((val: string) => {
    const q = val.trim();
    if (!q) return;
    saveRecent(q);
    setRecent(getRecent());
    inputRef.current?.blur();
    setIsFocused(false);
    setQuery("");
    setSuggestions([]);
    router.push(`/search?q=${encodeURIComponent(q)}`);
  }, [router]);

  const handleDeleteRecent = (q: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeRecent(q);
    setRecent(getRecent());
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const list = query.length >= 2 ? suggestions : recent;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx(i => Math.min(i + 1, list.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx(i => Math.max(i - 1, -1));
    } else if (e.key === "Enter") {
      if (activeIdx >= 0 && list[activeIdx]) handleSearch(list[activeIdx]);
      else handleSearch(query);
    } else if (e.key === "Escape") {
      close();
    }
  };

  const hasSuggestions = suggestions.length > 0;
  const showRecent     = query.length < 2 && recent.length > 0;
  const showTrending   = query.length < 2;

  return (
    <>
      <style>{STYLES}</style>

      {/* ── Collapsed bar (always visible in header) ────────────────────── */}
      <div className="relative w-full" onClick={open}>
        <div className={`relative flex items-center bg-gray-100 dark:bg-zinc-800 rounded-2xl border-2 transition-all duration-200 cursor-text
          ${isFocused
            ? "border-blue-600 bg-white dark:bg-zinc-900 sb-input"
            : "border-transparent hover:border-gray-200 dark:hover:border-zinc-700"
          }`}>
          {/* Search icon — animates when focused */}
          <div className={`absolute left-4 transition-all duration-200 ${isFocused ? "text-blue-600 scale-110" : "text-gray-400"}`}>
            <Search size={18} />
          </div>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search mobiles, brands..."
            value={query}
            onFocus={() => setIsFocused(true)}
            onChange={e => { setQuery(e.target.value); }}
            onKeyDown={handleKeyDown}
            className="w-full bg-transparent pl-12 pr-12 py-3 text-sm md:text-[15px] outline-none text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 font-medium"
            autoComplete="off"
          />
          {/* Clear button */}
          {query && (
            <button onClick={e => { e.stopPropagation(); setQuery(""); setSuggestions([]); inputRef.current?.focus(); }}
              className="absolute right-4 w-6 h-6 rounded-full bg-gray-200 dark:bg-zinc-700 flex items-center justify-center text-gray-500 hover:bg-gray-300 dark:hover:bg-zinc-600 hover:text-gray-800 transition-all sb-pop">
              <X size={13} />
            </button>
          )}
          {/* Loading spinner */}
          {loading && !query.length && (
            <div className="absolute right-4 w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full sb-spinner" />
          )}
        </div>

        {/* ── Inline dropdown (desktop only, when NOT fullscreen) ───────── */}
        {isFocused && (
          <div
            className="hidden md:block absolute top-full left-0 right-0 mt-2 bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-2xl z-[200] overflow-hidden sb-slide-down"
            style={{ maxHeight: "70vh", overflowY: "auto" }}
            onMouseDown={e => e.preventDefault()}
          >
            <DropdownContent
              query={query}
              suggestions={suggestions}
              recent={recent}
              loading={loading}
              activeIdx={activeIdx}
              hasSuggestions={hasSuggestions}
              showRecent={showRecent}
              showTrending={showTrending}
              onSearch={handleSearch}
              onDeleteRecent={handleDeleteRecent}
            />
          </div>
        )}
      </div>

      {/* ── Mobile fullscreen overlay ────────────────────────────────────── */}
      {isFocused && (
        <div
          ref={overlayRef}
          className="md:hidden fixed inset-0 z-[300] flex flex-col sb-overlay-in"
          style={{ background: "var(--sb-bg, white)" }}
        >
          {/* Overlay bg — respects dark mode */}
          <style>{`
            :root { --sb-bg: white; }
            .dark { --sb-bg: #05080d; }
          `}</style>

          {/* ── Mobile Header ── */}
          <div className="flex items-center gap-3 px-4 pt-safe-top pt-4 pb-3 border-b border-gray-100 dark:border-zinc-800 bg-white dark:bg-[#05080d]">
            <button
              onClick={close}
              className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-gray-600 dark:text-gray-300 active:scale-90 transition-transform flex-shrink-0"
            >
              <ArrowLeft size={18} />
            </button>

            {/* Mobile search input */}
            <div className="flex-1 relative">
              <Search size={16} className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${query ? "text-blue-600" : "text-gray-400"}`} />
              <input
                autoFocus
                type="text"
                placeholder="Search mobiles, brands..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full bg-gray-100 dark:bg-zinc-800 pl-10 pr-10 py-2.5 rounded-xl text-[15px] font-medium text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 outline-none border-2 border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-900 transition-all"
              />
              {query && (
                <button onClick={() => { setQuery(""); setSuggestions([]); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-gray-300 dark:bg-zinc-600 flex items-center justify-center text-gray-600 dark:text-gray-300 transition-all">
                  <X size={11} />
                </button>
              )}
            </div>

            {query && (
              <button onClick={() => handleSearch(query)}
                className="flex-shrink-0 bg-blue-600 text-white text-[13px] font-bold px-4 py-2.5 rounded-xl active:scale-95 transition-all shadow-md shadow-blue-500/30">
                Search
              </button>
            )}
          </div>

          {/* ── Mobile Dropdown Content ── */}
          <div className="flex-1 overflow-y-auto px-4 py-4 bg-white dark:bg-[#05080d]">
            <DropdownContent
              query={query}
              suggestions={suggestions}
              recent={recent}
              loading={loading}
              activeIdx={activeIdx}
              hasSuggestions={hasSuggestions}
              showRecent={showRecent}
              showTrending={showTrending}
              onSearch={handleSearch}
              onDeleteRecent={handleDeleteRecent}
              mobile
            />
          </div>
        </div>
      )}

      {/* ── Desktop backdrop ─────────────────────────────────────────────── */}
      {isFocused && (
        <div
          className="hidden md:block fixed inset-0 z-[199]"
          onClick={close}
        />
      )}
    </>
  );
}

// ─── Shared Dropdown Content ──────────────────────────────────────────────────
function DropdownContent({
  query, suggestions, recent, loading, activeIdx,
  hasSuggestions, showRecent, showTrending,
  onSearch, onDeleteRecent, mobile = false,
}: {
  query: string;
  suggestions: string[];
  recent: string[];
  loading: boolean;
  activeIdx: number;
  hasSuggestions: boolean;
  showRecent: boolean;
  showTrending: boolean;
  onSearch: (q: string) => void;
  onDeleteRecent: (q: string, e: React.MouseEvent) => void;
  mobile?: boolean;
}) {
  return (
    <div className="py-2">

      {/* ── Loading state ── */}
      {loading && (
        <div className="flex items-center gap-3 px-4 py-4">
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full sb-spinner flex-shrink-0" />
          <span className="text-[13px] text-gray-400 font-medium sb-pulse">Searching phones…</span>
        </div>
      )}

      {/* ── Suggestions ── */}
      {!loading && hasSuggestions && (
        <div>
          <SectionLabel icon={<Search size={11}/>} label="Suggestions" />
          {suggestions.map((item, i) => (
            <SuggestionRow
              key={item}
              icon={<Smartphone size={15} className="text-gray-400 flex-shrink-0 sb-suggestion-icon transition-colors" />}
              label={<Highlighted text={item} query={query} />}
              active={activeIdx === i}
              delay={i * 40}
              onClick={() => onSearch(item)}
            />
          ))}
          {/* Direct search option */}
          <SuggestionRow
            icon={<Search size={15} className="text-blue-500 flex-shrink-0" />}
            label={
              <span className="text-gray-600 dark:text-gray-300 font-semibold text-[13px]">
                Search for <span className="text-blue-600 dark:text-blue-400 font-black">"{query}"</span>
              </span>
            }
            active={activeIdx === suggestions.length}
            delay={suggestions.length * 40}
            onClick={() => onSearch(query)}
          />
        </div>
      )}

      {/* ── No results ── */}
      {!loading && query.length >= 2 && !hasSuggestions && (
        <div className="px-5 py-6 text-center sb-fade-up">
          <div className="w-12 h-12 bg-gray-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Search size={20} className="text-gray-400" />
          </div>
          <p className="text-[13px] font-bold text-gray-600 dark:text-gray-300 mb-1">No phones found for</p>
          <p className="text-blue-600 dark:text-blue-400 font-black text-[15px]">"{query}"</p>
          <button
            onClick={() => onSearch(query)}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-bold px-5 py-2 rounded-xl transition-all active:scale-95 shadow-md shadow-blue-500/25">
            Search anyway
          </button>
        </div>
      )}

      {/* ── Recent Searches ── */}
      {!loading && showRecent && (
        <div className={hasSuggestions ? "" : "mt-1"}>
          <div className="flex items-center justify-between px-4 mb-1">
            <SectionLabel icon={<Clock size={11}/>} label="Recent" inline />
            <button
              onClick={() => { try { localStorage.removeItem(RECENT_KEY); } catch {} }}
              className="text-[10px] text-gray-400 hover:text-red-500 font-semibold transition-colors">
              Clear
            </button>
          </div>
          {recent.map((item, i) => (
            <SuggestionRow
              key={item}
              icon={<Clock size={15} className="text-gray-400 flex-shrink-0" />}
              label={<span className="text-gray-700 dark:text-gray-200 font-semibold text-[13px]">{item}</span>}
              active={activeIdx === i}
              delay={i * 35}
              onClick={() => onSearch(item)}
              trailing={
                <button
                  onClick={(e) => onDeleteRecent(item, e)}
                  className="w-6 h-6 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all opacity-0 group-hover:opacity-100">
                  <X size={12} />
                </button>
              }
            />
          ))}
        </div>
      )}

      {/* ── Trending Searches ── */}
      {!loading && showTrending && (
        <div className={`${(showRecent || hasSuggestions) ? "mt-3 pt-3 border-t border-gray-100 dark:border-zinc-800" : "mt-1"} px-4`}>
          <SectionLabel icon={<TrendingUp size={11}/>} label="Trending" />
          <div className="flex flex-wrap gap-2 mt-2 mb-1">
            {TRENDING.map((item, i) => (
              <button
                key={item}
                onClick={() => onSearch(item)}
                className="trending-chip sb-pop px-3.5 py-1.5 bg-gray-100 dark:bg-zinc-800 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 text-gray-700 dark:text-gray-200 text-[12px] font-bold rounded-full border border-gray-200 dark:border-zinc-700 hover:border-blue-600 hover:shadow-md hover:shadow-blue-500/20"
                style={{ animationDelay: `${i * 45}ms` }}
              >
                🔥 {item}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Empty (no query, no recent) ── */}
      {!loading && !showRecent && query.length < 2 && (
        <div className="px-4 py-3 text-center">
          <p className="text-[12px] text-gray-400 font-medium">Start typing to search phones…</p>
        </div>
      )}
    </div>
  );
}

// ─── Small sub-components ─────────────────────────────────────────────────────
function SectionLabel({ icon, label, inline }: { icon:React.ReactNode; label:string; inline?:boolean }) {
  if (inline) return null; // handled by parent row
  return (
    <div className="flex items-center gap-1.5 px-4 py-2 mb-0.5">
      <span className="text-blue-600 dark:text-blue-400">{icon}</span>
      <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">{label}</span>
    </div>
  );
}

function SuggestionRow({ icon, label, active, delay, onClick, trailing }: {
  icon: React.ReactNode;
  label: React.ReactNode;
  active: boolean;
  delay?: number;
  onClick: () => void;
  trailing?: React.ReactNode;
}) {
  return (
    <div
      onClick={onClick}
      className={`sb-suggestion group flex items-center gap-3 px-4 py-3 cursor-pointer transition-all duration-150 sb-fade-up
        ${active
          ? "bg-blue-50 dark:bg-blue-900/25 border-l-2 border-blue-500"
          : "hover:bg-gray-50 dark:hover:bg-zinc-800/70 border-l-2 border-transparent"
        }`}
      style={{ animationDelay: `${delay ?? 0}ms` }}
    >
      <span className={`transition-colors ${active ? "text-blue-500" : ""}`}>{icon}</span>
      <span className="flex-1 min-w-0 font-semibold text-[13px] text-gray-700 dark:text-gray-200 truncate">{label}</span>
      {trailing}
      {/* Arrow hint */}
      <span className={`text-[10px] text-gray-300 dark:text-zinc-600 font-bold transition-opacity ${active ? "opacity-100" : "opacity-0 group-hover:opacity-50"}`}>
        ↗
      </span>
    </div>
  );
}
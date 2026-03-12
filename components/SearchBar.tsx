"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, X, ArrowLeft, TrendingUp, Clock } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  // Suggestions Fetching Logic
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.trim().length < 2) {
        setSuggestions([]);
        return;
      }
      const { data } = await supabase
        .from("products")
        .select("title")
        .or(`title.ilike.%${query}%, brand.ilike.%${query}%, model.ilike.%${query}%`)
        .limit(6);

      if (data) {
        const unique = Array.from(new Set(data.map((i: any) => i.title))).slice(0, 6);
        setSuggestions(unique);
      }
    };
    const timer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSearch = (searchVal: string) => {
    if (!searchVal.trim()) return;
    
    // 1. Dismiss Keyboard
    inputRef.current?.blur();
    // 2. Close Overlay
    setIsFocused(false);
    // 3. Navigate to Search Page
    router.push(`/search?q=${encodeURIComponent(searchVal)}`);
  };

  return (
    <div className="relative w-full">
      {/* Search Input Box */}
      <div className="relative z-[110]">
        <input
          ref={inputRef}
          type="text"
          placeholder="Search mobiles, brands..."
          value={query}
          onFocus={() => setIsFocused(true)}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch(query)}
          className="w-full bg-gray-100 dark:bg-zinc-800 px-5 py-2.5 rounded-xl pl-12 outline-none border-2 border-transparent focus:border-blue-600 focus:bg-white dark:focus:bg-zinc-900 transition-all text-sm md:text-base"
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        {query && (
           <X 
            onClick={() => setQuery("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer" 
            size={18} 
           />
        )}
      </div>

      {/* Full Screen Overlay */}
      {isFocused && (
        <div className="fixed inset-0 bg-white dark:bg-[#05080d] z-[105] flex flex-col pt-20 animate-in fade-in duration-200">
          <div className="max-w-2xl mx-auto w-full px-6">
            
            {/* Mobile Header */}
            <div className="flex items-center gap-4 mb-8 md:hidden">
                <ArrowLeft onClick={() => setIsFocused(false)} className="text-gray-600" />
                <span className="font-bold text-lg">Search Products</span>
            </div>

            {/* Suggestions logic */}
            {query.length === 0 ? (
              <div className="space-y-6">
                <div>
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-4 flex items-center gap-2">
                    <TrendingUp size={14} /> Trending Searches
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {["iPhone 15", "Samsung S24", "OnePlus 12", "Google Pixel", "MacBook"].map(item => (
                      <button 
                        key={item} 
                        onClick={() => { setQuery(item); handleSearch(item); }}
                        className="px-4 py-2 bg-gray-100 dark:bg-zinc-800 rounded-full text-xs font-bold hover:bg-blue-600 hover:text-white transition"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                {suggestions.map((item, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => handleSearch(item)} 
                    className="flex items-center gap-4 p-4 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl cursor-pointer group transition-all"
                  >
                    <Clock size={16} className="text-gray-400" />
                    <span className="font-bold text-gray-700 dark:text-gray-200 group-hover:text-blue-600">{item}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
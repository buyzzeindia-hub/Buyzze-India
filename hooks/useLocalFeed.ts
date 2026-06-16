// hooks/useLocalFeed.ts
// ─────────────────────────────────────────────────────────────
// Location-aware product feed algorithm
//
// HOW IT WORKS (invisible to user):
//   1. User ke city/state se match karo (products table mein city/state column)
//   2. Agar city match mile → highest priority
//   3. Same state ke products → medium priority  
//   4. Freshly listed (last 7 days) → bonus score
//   5. Results naturally mixed karke return karo — feels organic
//
// USER EXPERIENCE:
//   - User ko lagta hai "ye toh mere aas paas ke products hain"
//   - Koi "Near You" badge nahi, koi special section nahi
//   - Bas feed mein naturally local products upar aate hain
// ─────────────────────────────────────────────────────────────

"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useLocation } from "@/features/location/context/LocationContext";

export interface FeedProduct {
  id: number;
  title: string;
  price: number;
  images: string[];
  city: string;
  state: string;
  condition: string;
  brand: string;
  ram: string;
  storage: string;
  created_at: string;
  owner_id: string;
  _score?: number; // internal, not shown to user
}

interface UseLocalFeedOptions {
  limit?: number;       // total products to return (default 40)
  category?: string;    // optional filter
  excludeId?: number;   // exclude current product (for similar section)
}

export function useLocalFeed(options: UseLocalFeedOptions = {}) {
  const { limit = 40, category, excludeId } = options;
  const { location } = useLocation(); // city string from LocationContext

  const [products, setProducts] = useState<FeedProduct[]>([]);
  const [loading, setLoading]   = useState(true);
  const [city, setCity]         = useState("");
  const [state, setState]       = useState("");

  // Extract city from LocationContext (it stores city name as string)
  useEffect(() => {
    if (!location) return;
    setCity(location.trim());
    // state will come from product reverse geocode stored in DB
  }, [location]);

  const fetchFeed = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch more than needed so we can score + sort
      let query = supabase
        .from("products")
        .select("id, title, price, images, city, state, condition, brand, ram, storage, created_at, owner_id")
        .order("created_at", { ascending: false })
        .limit(200);

      if (excludeId) query = query.neq("id", excludeId);
      if (category)  query = query.eq("category", category);

      const { data, error } = await query;
      if (error || !data) return;

      const now = Date.now();
      const userCity  = city.toLowerCase().trim();

      // ── SCORING ALGORITHM ──────────────────────────────────
      const scored = data.map((p: any) => {
        let score = 0;
        const pCity  = (p.city  || "").toLowerCase().trim();
        const pState = (p.state || "").toLowerCase().trim();

        // 1. Same city → biggest boost (feels hyper-local)
        if (userCity && pCity && pCity === userCity) {
          score += 100;
        }
        // 2. City partial match (e.g. "Varanasi" in "Varanasi Cantonment")
        else if (userCity && pCity && (pCity.includes(userCity) || userCity.includes(pCity))) {
          score += 60;
        }
        // 3. Same state → medium boost
        else if (pState && pState.length > 0) {
          score += 20;
        }

        // 4. Freshness bonus — newer products score higher
        const ageMs   = now - new Date(p.created_at).getTime();
        const ageDays = ageMs / (1000 * 60 * 60 * 24);
        if (ageDays <= 1)  score += 30;
        else if (ageDays <= 3)  score += 20;
        else if (ageDays <= 7)  score += 10;
        else if (ageDays <= 14) score += 5;

        // 5. Has images → slight boost (better quality listing)
        if (Array.isArray(p.images) && p.images.length > 0) score += 5;

        // 6. Small random jitter so feed never looks exactly the same
        score += Math.random() * 8;

        return { ...p, _score: score };
      });

      // Sort by score descending
      scored.sort((a: any, b: any) => b._score - a._score);

      // Take top N, remove internal score before setting state
      const result = scored.slice(0, limit).map(({ _score, ...p }: any) => p);
      setProducts(result);
    } catch (err) {
      console.error("useLocalFeed error:", err);
    } finally {
      setLoading(false);
    }
  }, [city, limit, category, excludeId]);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  return { products, loading, refetch: fetchFeed };
}

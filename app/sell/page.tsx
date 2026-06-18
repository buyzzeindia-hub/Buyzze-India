"use client";

import { useState, useEffect } from "react";
import ProductForm from "@/features/products/components/ProductForm";
import { useRouter } from "next/navigation";
import { useBuyzzeAuth } from "@/hooks/useBuyzzeAuth";
import { supabase } from "@/lib/supabaseClient";
import { Phone, Lock } from "lucide-react";

export default function SellPage() {
  const router = useRouter();
  const { user, isLoaded } = useBuyzzeAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  const [localUserId, setLocalUserId] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [limitExceeded, setLimitExceeded] = useState(false);

  // ── 1. Unified ID Syncing ──
  useEffect(() => {
    if (user?.id) {
      setLocalUserId(user.id);
    } else if (typeof window !== "undefined") {
      const isLogged = localStorage.getItem("buyzze_logged_in") === "true";
      if (isLogged) {
        let fastId = localStorage.getItem("buyzze_fast_id");
        setLocalUserId(fastId || null);
      } else if (isLoaded) {
         router.push("/login");
      }
    }
  }, [user, isLoaded, router]);

  // ── 2. Strict Verification & Limit Checks ──
  useEffect(() => {
    if (!localUserId) return; 

    const checkUserStatus = async () => {
      setIsChecking(true);
      try {
        // Strict Database Check for Verification
        const { data: profile } = await supabase
          .from("profiles")
          .select("is_phone_verified")
          .eq("id", localUserId)
          .single();

        const verified = profile?.is_phone_verified === true;
        setIsVerified(verified);

        // Check Weekly Limit (Only if verified)
        if (verified) {
          const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
          
          // 🔴 Safe DB Count: handles both user_id or owner_id
          const { count } = await supabase
            .from("products")
            .select("*", { count: "exact", head: true })
            .or(`user_id.eq.${localUserId},owner_id.eq.${localUserId}`)
            .gte("created_at", sevenDaysAgo);

          if (count !== null && count >= 2) {
            setLimitExceeded(true);
          }
        }
      } catch (err) {
        console.error("Error checking user status:", err);
      } finally {
        setIsChecking(false);
      }
    };

    checkUserStatus();
  }, [localUserId]);

  // ── 3. Submit Logic ──
  const submit = async (data: any) => {
    setIsProcessing(true);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    
    const res = await fetch("/api/products/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...data,
        user_id: localUserId,
        expires_at: expiresAt.toISOString(),
      }),
    });

    const result = await res.json();
    if (!res.ok) throw new Error(result.error || "Failed to save listing");

    setIsProcessing(false);
    router.push("/dashboard");
  };

  // ── UI: Loading State ──
  if (!isLoaded || isChecking || !localUserId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0a0a0a]">
         <div className="text-sm font-medium text-gray-400 animate-pulse tracking-wide">Loading...</div>
      </div>
    );
  }

  // ── UI: Verification Required ──
  if (!isVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0a0a0a] p-4">
         <div className="max-w-sm w-full bg-white dark:bg-[#121212] p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 text-center">
            <div className="mb-5 text-gray-400 dark:text-gray-500 flex justify-center">
               <Phone className="w-6 h-6" strokeWidth={1.5} />
            </div>
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-2 tracking-tight">Verification Required</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8 text-sm leading-relaxed">
              Please go to your profile and verify your phone number first to start selling.
            </p>
            <button 
              onClick={() => router.push('/profile')}
              className="w-full py-2.5 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 text-sm font-medium rounded-xl transition-colors"
            >
               Go to Profile
            </button>
            <button 
              onClick={() => router.push('/')} 
              className="mt-4 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
               Cancel
            </button>
         </div>
      </div>
    )
  }

  // ── UI: Limit Exceeded ──
  if (limitExceeded) {
     return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0a0a0a] p-4">
         <div className="max-w-sm w-full bg-white dark:bg-[#121212] p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 text-center">
            <div className="mb-5 text-gray-400 dark:text-gray-500 flex justify-center">
               <Lock className="w-6 h-6" strokeWidth={1.5} />
            </div>
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-2 tracking-tight">Limit Reached</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8 text-sm leading-relaxed">
              You have used your 2 free listings for this week. Please wait a few days to list a new device.
            </p>
            <button 
              onClick={() => router.push('/dashboard')} 
              className="w-full py-2.5 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 text-sm font-medium rounded-xl transition-colors"
            >
               Return to Dashboard
            </button>
         </div>
      </div>
    )
  }

  // ── UI: Normal Sell Form ──
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] text-neutral-900 dark:text-white pb-20 pt-6 md:pt-10">
      <div className="w-full px-4 md:px-8">
        
        {isProcessing && (
          <div className="max-w-[90rem] mx-auto mb-6 p-4 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 rounded-2xl text-center font-medium animate-pulse tracking-wide text-sm">
            Processing & Optimizing Assets...
          </div>
        )}

        <div className={isProcessing ? "opacity-40 pointer-events-none transition-opacity duration-300" : "opacity-100 transition-opacity duration-300"}>
          <ProductForm
            onSubmit={submit}
            onComplete={() => router.push("/dashboard")}
          />
        </div>
        
      </div>
    </div>
  );
}
export const dynamic = 'force-dynamic';
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

  // ── 2. Strict Verification & Bulletproof Limit Checks ──
  useEffect(() => {
    if (!localUserId) return; 

    const checkUserStatus = async () => {
      setIsChecking(true);
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("is_phone_verified")
          .eq("id", localUserId)
          .single();

        const verified = profile?.is_phone_verified === true;
        setIsVerified(verified);

        if (verified) {
          const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
          
          // 🔴 FAIL-SAFE LIMIT CHECK: Pehle owner_id try karo, agar column na ho toh user_id try karo
          let exactCount = 0;
          let { count: countOwner, error: errOwner } = await supabase
            .from("products")
            .select("*", { count: "exact", head: true })
            .eq("owner_id", localUserId)
            .gte("created_at", sevenDaysAgo);

          if (errOwner) {
            let { count: countUser } = await supabase
              .from("products")
              .select("*", { count: "exact", head: true })
              .eq("user_id", localUserId)
              .gte("created_at", sevenDaysAgo);
            exactCount = countUser || 0;
          } else {
            exactCount = countOwner || 0;
          }

          // Agar 2 ya usse zyada listing ho gayi hai is week, block!
          if (exactCount >= 2) {
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
    
    try {
      const res = await fetch("/api/products/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          user_id: localUserId, // Tumhari API yahi use karti hai
          expires_at: expiresAt.toISOString(),
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to save listing");
      
      router.push("/dashboard");
    } catch(err) {
      console.error(err);
      alert("Error saving product!");
    } finally {
      setIsProcessing(false);
    }
  };

  // ── UI: Loading State ──
  if (!isLoaded || isChecking || !localUserId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0a0a0a]">
         <div className="text-sm font-medium text-gray-400 animate-pulse tracking-wide">Checking your account limits...</div>
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
         </div>
      </div>
    )
  }

  // ── UI: Limit Exceeded (Popup Logic Working Here!) ──
  if (limitExceeded) {
     return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0a0a0a] p-4">
         <div className="max-w-sm w-full bg-white dark:bg-[#121212] p-8 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 text-center transform transition-all">
            <div className="mb-5 text-red-500 bg-red-50 dark:bg-red-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
               <Lock className="w-7 h-7" strokeWidth={2} />
            </div>
            <h2 className="text-xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">Weekly Limit Reached</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8 text-sm leading-relaxed">
              You have already listed <strong>2 devices</strong> in the last 7 days. Please wait a few days to list a new device.
            </p>
            <button 
              onClick={() => router.push('/dashboard')} 
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors shadow-md shadow-blue-500/20"
            >
               Go to Dashboard
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
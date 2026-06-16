"use client";

import { useState } from "react";
import ProductForm from "@/features/products/components/ProductForm";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

export default function SellPage() {
  const router = useRouter();
  const { user } = useUser(); 
  const [isProcessing, setIsProcessing] = useState(false);

  // Original submit logic
  const submit = async (data: any) => {
    setIsProcessing(true);

    let finalData = { ...data };
    
    // API route se insert
    const res = await fetch("/api/products/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...finalData,
        user_id: user?.id,
      }),
    });

    const result = await res.json();
    if (!res.ok) throw new Error(result.error || "Failed to save listing");

    setIsProcessing(false);
    router.push("/dashboard");
  };

  return (
    // 1. Removed strict max-w-2xl to let the inner form expand
    // 2. Removed the extra outer box container so the ProductForm shines purely
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#05080d] text-neutral-900 dark:text-white pb-20 pt-6 md:pt-10">
      <div className="w-full px-4 md:px-8">
        
        {isProcessing && (
          <div className="max-w-[90rem] mx-auto mb-6 p-4 bg-blue-600/10 border border-blue-600/20 text-blue-500 rounded-2xl text-center font-medium animate-pulse tracking-wide">
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
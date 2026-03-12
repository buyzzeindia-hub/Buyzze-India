"use client";

import { useState } from "react";
import ProductForm from "@/features/products/components/ProductForm";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs"; // ✅ Clerk

export default function SellPage() {
  const router = useRouter();
  const { user } = useUser(); // ✅ Clerk se user lo
  const [isProcessing, setIsProcessing] = useState(false);

  const compressImage = async (file: File): Promise<File> => {
    // ... (aapka compression logic)
    return file; 
  };

  const submit = async (data: any) => {
    setIsProcessing(true);

    // Image compression — same as before
    let finalData = { ...data };
    if (data.images) {
      finalData.images = await Promise.all(
        data.images.map((img: File) => compressImage(img))
      );
    }

    // ✅ API route se insert — RLS bypass, secure
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
    <div className="min-h-screen bg-[#05080d] text-white pb-20">
      <div className="max-w-2xl mx-auto px-4 pt-10">
        {/* Header — bilkul same */}
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter border-l-4 border-blue-600 pl-4 inline-block">
            Post Your Ad
          </h1>
          <p className="text-gray-500 text-sm mt-2 ml-5">
            Fill in the details to list your smartphone
          </p>
        </div>

        {/* Form Container — bilkul same */}
        <div className="bg-[#0f172a] border border-gray-800 rounded-[2.5rem] p-6 md:p-10 shadow-2xl overflow-hidden">
          {isProcessing && (
            <div className="mb-6 p-4 bg-blue-600/20 text-blue-400 rounded-2xl text-center font-bold animate-pulse">
              Processing & Optimizing Images...
            </div>
          )}

          <div className={isProcessing ? "opacity-40 pointer-events-none" : "opacity-100"}>
            <ProductForm
              onSubmit={submit}
              onComplete={() => router.push("/dashboard")}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
"use client";
export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ProductForm from "@/features/products/components/ProductForm";
import { supabase } from "@/lib/supabaseClient";

export default function EditSellPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id;

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!productId) return;
    async function fetchProduct() {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .single();
      
      if (!error) setProduct(data);
      setLoading(false);
    }
    fetchProduct();
  }, [productId]);

  const handleUpdate = async (formData: any) => {
    const { error } = await supabase
      .from("products")
      .update({
        ...formData,
        price: Number(formData.price) // Numeric safety
      })
      .eq("id", productId);

    if (error) throw error;
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center dark:bg-[#05080d]">
        <div className="animate-pulse font-black text-blue-600 tracking-widest uppercase">Fetching Details...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#05080d] py-12 px-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-black mb-8 uppercase tracking-tighter dark:text-white">Edit Your <span className="text-blue-600">Ad</span></h1>
        
        {/* initialValues mein product pass karne se saare fields auto-fill ho jayenge */}
        <ProductForm 
          initialValues={product} 
          onSubmit={handleUpdate} 
          onComplete={() => router.push(`/products/${productId}`)} 
        />
      </div>
    </div>
  );
}
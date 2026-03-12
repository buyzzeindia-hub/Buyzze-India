"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import ProductForm from "@/features/products/components/ProductForm";

export default function EditSellPage() {
  const params = useParams();
  const router = useRouter();
  const productId = Number(params.id);

  const [userId, setUserId] = useState<string | null>(null);
  const [initialValues, setInitialValues] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
    });
  }, []);

  useEffect(() => {
    if (!userId || !productId) return;
    supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .eq("user_id", userId)
      .single()
      .then(({ data }) => {
        if (data) setInitialValues(data);
      });
  }, [userId, productId]);

  const handleSubmit = async (formData: any) => {
    const { error } = await supabase
      .from("products")
      .update(formData)
      .eq("id", productId);
    if (error) throw error;
  };

  return (
    <ProductForm
      initialValues={initialValues ?? undefined}
      onSubmit={handleSubmit}
      onComplete={() => router.push("/profile")}
    />
  );
}
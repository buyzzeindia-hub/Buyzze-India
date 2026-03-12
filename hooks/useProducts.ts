"use client";

import { useEffect, useState } from "react";
import { productService } from "@/services/supabase.products";

export function useProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = async () => {
    setLoading(true);
    const { data, error } = await productService.getAll();

    if (error) {
      setError(error.message);
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  };

  const updateProduct = async (id: number, payload: any) => {
    const { error } = await productService.update(id, payload);
    if (error) throw error;
    await fetchAll();
  };

  const deleteProduct = async (id: number) => {
    const { error } = await productService.remove(id);
    if (error) throw error;
    await fetchAll();
  };

  useEffect(() => {
    fetchAll();
  }, []);

  return {
    products,
    loading,
    error,
    fetchAll,
    updateProduct,
    deleteProduct,
  };
}

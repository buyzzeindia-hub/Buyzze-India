"use client";
export const dynamic = 'force-dynamic';
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useUser } from "@clerk/nextjs"; // ✅ Clerk
import { getCatalogProductById } from "@/features/catalog/services/catalog.service";
import { ProductDetail } from "@/features/catalog/components/ProductDetail";

export default function ProductDetailPage() {
  const params = useParams();
  const productId = Number(params.id);

  const { user, isLoaded } = useUser(); // ✅ Clerk
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!productId || !isLoaded) return;

    const loadData = async () => {
      try {
        const productRes = await getCatalogProductById(productId);
        setProduct(productRes);
      } catch (error) {
        console.error("Error loading product:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [productId, isLoaded]);

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0a0c10] pt-10">
        <div className="max-w-6xl mx-auto px-4 py-8 animate-pulse">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-6">
              <div className="aspect-square bg-gray-200 dark:bg-gray-800 rounded-[2.5rem]" />
              <div className="flex gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-16 h-16 bg-gray-100 dark:bg-gray-800/50 rounded-2xl" />
                ))}
              </div>
            </div>
            <div className="space-y-6">
              <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded-xl w-3/4" />
              <div className="space-y-2">
                <div className="h-4 bg-gray-100 dark:bg-gray-800/50 rounded w-full" />
                <div className="h-4 bg-gray-100 dark:bg-gray-800/50 rounded w-5/6" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) return <div className="p-8 text-center font-bold">Product not found</div>;

  return <ProductDetail product={product} userId={user?.id ?? null} />;
}
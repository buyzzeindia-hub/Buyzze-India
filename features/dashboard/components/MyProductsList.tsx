"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { getChatCountForProduct } from "../services/chatCount.service";
import { MessageSquare, ExternalLink, Edit3, Trash2, CheckCircle } from "lucide-react";

export function MyProductsList({ products: initialProducts, userId }: { products: any[]; userId: string }) {
  const router = useRouter();
  // Fallback to [] taaki length check crash na kare
  const [products, setProducts] = useState<any[]>(initialProducts || []);
  const [chatCounts, setChatCounts] = useState<Record<number, number>>({});
  const [loadingId, setLoadingId] = useState<string | number | null>(null);

  // Sync state if props change
  useEffect(() => {
    setProducts(initialProducts || []);
  }, [initialProducts]);

  useEffect(() => {
    async function loadCounts() {
      const counts: Record<number, number> = {};
      for (const p of products) {
        counts[p.id] = await getChatCountForProduct(p.id, userId);
      }
      setChatCounts(counts);
    }
    if (products.length > 0) loadCounts();
  }, [products, userId]);

  // ── 1. Mark as Sold Logic (Fixed) ──
  const markAsSold = async (productId: string | number) => {
    const ok = confirm("Are you sure you want to mark this as sold? This cannot be undone.");
    if (!ok) return;

    setLoadingId(`sold-${productId}`);
    try {
      // 🔴 Bug fix: Sirf 'id' se update karo, user_id/owner_id column conflict se bacho
      const { error } = await supabase
        .from("products")
        .update({ status: "sold" })
        .eq("id", productId);

      if (error) throw error;

      // Update UI instantly without reloading
      setProducts(products.map(p => p.id === productId ? { ...p, status: "sold" } : p));
    } catch (err) {
      console.error("Error marking as sold:", err);
      alert("Something went wrong!");
    } finally {
      setLoadingId(null);
    }
  };

  // ── 2. Delete Logic ──
  const deleteProduct = async (product: any) => {
    const ok = confirm("This will permanently delete the product. Continue?");
    if (!ok) return;

    setLoadingId(product.id);
    try {
      const res = await fetch("/api/products/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: product.id }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to delete");
        return;
      }

      // Update UI instantly
      setProducts(products.filter(p => p.id !== product.id));
    } catch (err) {
      alert("Failed to delete");
    } finally {
      setLoadingId(null);
    }
  };

  if (!products || products.length === 0) return (
    <p className="text-center py-10 text-gray-400 font-bold uppercase tracking-widest text-xs">
      No Listings Found
    </p>
  );

  return (
    <div className="space-y-4">
      {products.map((p) => {
        const isSold = p.status === "sold";
        const isExpired = p.status === "expired" || (p.expires_at && new Date(p.expires_at).getTime() < Date.now());

        return (
          <div
            key={p.id}
            className={`group rounded-3xl p-6 flex flex-col md:flex-row justify-between items-center border transition-all shadow-sm ${
              isSold || isExpired
                ? "bg-gray-100 dark:bg-gray-900 border-gray-200 dark:border-gray-800 opacity-80"
                : "bg-gray-50/50 dark:bg-gray-800/30 border-transparent hover:border-blue-500/20 hover:bg-white dark:hover:bg-gray-800 hover:shadow-xl"
            }`}
          >
            <div className="flex flex-col items-center md:items-start mb-4 md:mb-0">
              <div className="flex items-center gap-3">
                <p className={`text-lg font-black tracking-tight ${isSold || isExpired ? "text-gray-500 line-through decoration-2" : "text-gray-900 dark:text-white"}`}>
                  {p.title}
                </p>
                {/* Status Badges */}
                {isSold && (
                  <span className="bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-wider">Sold Out</span>
                )}
                {isExpired && !isSold && (
                  <span className="bg-gray-500 text-white text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-wider">Expired</span>
                )}
              </div>
              <p className={`font-black text-sm mt-1 ${isSold || isExpired ? "text-gray-400" : "text-blue-600"}`}>
                ₹ {p.price?.toLocaleString("en-IN")}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Chat button */}
              <button
                onClick={() => router.push(`/chat?productId=${p.id}`)}
                className="p-3 bg-white dark:bg-gray-900 rounded-xl text-blue-600 shadow-sm relative transition-colors"
              >
                <MessageSquare size={18} />
                {chatCounts[p.id] > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 w-4 h-4 rounded-full text-[10px] text-white flex items-center justify-center font-bold animate-pulse">
                    {chatCounts[p.id]}
                  </span>
                )}
              </button>

              {/* View button */}
              <button
                onClick={() => router.push(`/products/${p.id}`)}
                className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl text-gray-500 transition-colors"
              >
                <ExternalLink size={18} />
              </button>

              {/* Mark as Sold button */}
              {!(isSold || isExpired) && (
                <button
                  onClick={() => markAsSold(p.id)}
                  disabled={loadingId === `sold-${p.id}`}
                  title="Mark as Sold"
                  className="p-3 hover:bg-green-50 dark:hover:bg-green-500/10 rounded-xl text-green-500 transition-colors disabled:opacity-30"
                >
                  {loadingId === `sold-${p.id}` ? (
                    <span className="w-[18px] h-[18px] border-2 border-green-500 border-t-transparent rounded-full animate-spin block" />
                  ) : (
                    <CheckCircle size={18} />
                  )}
                </button>
              )}

              {/* Edit button */}
              {!(isSold || isExpired) && (
                <button
                  onClick={() => router.push(`/sell/edit/${p.id}`)}
                  className="p-3 hover:bg-orange-50 dark:hover:bg-orange-500/10 rounded-xl text-orange-500 transition-colors"
                >
                  <Edit3 size={18} />
                </button>
              )}

              {/* Delete button */}
              <button
                onClick={() => deleteProduct(p)}
                disabled={loadingId === p.id}
                className="p-3 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl text-red-500 transition-colors disabled:opacity-30"
              >
                {loadingId === p.id ? (
                  <span className="w-[18px] h-[18px] border-2 border-red-500 border-t-transparent rounded-full animate-spin block" />
                ) : (
                  <Trash2 size={18} />
                )}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
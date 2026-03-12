"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getChatCountForProduct } from "../services/chatCount.service";
import { MessageSquare, ExternalLink, Edit3, Trash2 } from "lucide-react";

export function MyProductsList({ products, userId }: { products: any[]; userId: string }) {
  const router = useRouter();
  const [chatCounts, setChatCounts] = useState<Record<number, number>>({});
  const [loadingId, setLoadingId] = useState<number | null>(null);

  useEffect(() => {
    async function loadCounts() {
      const counts: Record<number, number> = {};
      for (const p of products) {
        counts[p.id] = await getChatCountForProduct(p.id, userId);
      }
      setChatCounts(counts);
    }
    if (products.length) loadCounts();
  }, [products, userId]);

  const deleteProduct = async (product: any) => {
    const ok = confirm("This will permanently delete the product. Continue?");
    if (!ok) return;

    setLoadingId(product.id);
    try {
      // ✅ API route se delete — server pe owner check + images delete + RLS bypass
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

      window.location.reload();
    } catch (err) {
      alert("Failed to delete");
    } finally {
      setLoadingId(null);
    }
  };

  if (!products.length) return (
    <p className="text-center py-10 text-gray-400 font-bold uppercase tracking-widest text-xs">
      No Listings Found
    </p>
  );

  return (
    <div className="space-y-4">
      {products.map((p) => (
        <div
          key={p.id}
          className="group bg-gray-50/50 dark:bg-gray-800/30 rounded-3xl p-6 flex flex-col md:flex-row justify-between items-center border border-transparent hover:border-blue-500/20 hover:bg-white dark:hover:bg-gray-800 transition-all shadow-sm hover:shadow-xl"
        >
          <div className="flex flex-col items-center md:items-start mb-4 md:mb-0">
            <p className="text-lg font-black text-gray-900 dark:text-white tracking-tight">{p.title}</p>
            <p className="text-blue-600 font-black text-sm">₹ {p.price.toLocaleString()}</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Chat button */}
            <button
              onClick={() => router.push(`/chat?productId=${p.id}`)}
              className="p-3 bg-white dark:bg-gray-900 rounded-xl text-blue-600 shadow-sm relative"
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

            {/* Edit button */}
            <button
              onClick={() => router.push(`/sell/edit/${p.id}`)}
              className="p-3 hover:bg-green-50 dark:hover:bg-green-500/10 rounded-xl text-green-600 transition-colors"
            >
              <Edit3 size={18} />
            </button>

            {/* ✅ Delete — API route se */}
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
      ))}
    </div>
  );
}
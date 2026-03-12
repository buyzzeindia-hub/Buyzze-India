"use client";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs"; // ✅ Clerk
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";

export default function WishlistPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isLoaded } = useUser(); // ✅ Clerk
  const router = useRouter();

  // ✅ Fetch Wishlist via API route
  useEffect(() => {
    if (!isLoaded) return;

    if (!user) {
      router.push("/login");
      return;
    }

    const fetchWishlist = async () => {
      try {
        // ✅ API se favorites fetch karo (sirf ids)
        const res = await fetch("/api/favorites");
        const data = await res.json();

        if (!data.favorites || data.favorites.length === 0) {
          setLoading(false);
          return;
        }

        const ids = data.favorites.map((f: any) => f.product_id);

        // ✅ Products public read hain — direct Supabase se fetch sahi hai
        const { data: products } = await supabase
          .from("products")
          .select("id, title, price, images, city")
          .in("id", ids);

        const merged = data.favorites.map((f: any) => ({
          product_id: f.product_id,
          created_at: f.created_at,
          product: products?.find((p: any) => p.id === f.product_id),
        }));

        setItems(merged.filter((i: any) => i.product));
      } catch (err) {
        console.error("Wishlist fetch error:", err);
      }

      setLoading(false);
    };

    fetchWishlist();
  }, [isLoaded, user]);

  // ✅ Remove — API route se
  const removeFromWishlist = async (productId: number) => {
    // Optimistic UI
    setItems(prev => prev.filter(i => i.product_id !== productId));

    await fetch("/api/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product_id: productId }),
    });
  };

  if (!isLoaded || loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-white rounded-2xl border p-3">
              <div className="aspect-square bg-gray-200 rounded-xl mb-3" />
              <div className="h-4 bg-gray-200 rounded mb-2" />
              <div className="h-5 bg-gray-300 rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 min-h-screen">

      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl md:text-5xl font-black">Your Wishlist</h1>
        <p className="text-gray-500 mt-2">{items.length} saved items</p>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-24">
          <div className="text-6xl mb-5">🤍</div>
          <h2 className="text-2xl font-bold">Wishlist Empty</h2>
          <Link href="/" className="inline-block mt-6 px-6 py-3 bg-black text-white rounded-xl">
            Browse Products
          </Link>
        </div>
      ) : (
        <motion.div layout className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          <AnimatePresence>
            {items.map(item => (
              <motion.div
                key={item.product_id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="group bg-white rounded-2xl border overflow-hidden shadow-sm hover:shadow-lg transition"
              >
                {/* Image */}
                <div className="relative aspect-square overflow-hidden bg-gray-100">
                  <img
                    src={item.product.images?.[0] || "/placeholder.png"}
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                  />
                  <button
                    onClick={() => removeFromWishlist(item.product_id)}
                    className="absolute top-3 right-3 w-10 h-10 bg-white rounded-full shadow flex items-center justify-center hover:scale-110"
                  >
                    ❤️
                  </button>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="text-sm font-bold line-clamp-2 min-h-[40px]">
                    {item.product.title}
                  </h3>
                  <p className="text-blue-600 font-extrabold text-lg mt-2">
                    ₹{item.product.price?.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    📍 {item.product.city || "India"}
                  </p>
                  <button
                    onClick={() => removeFromWishlist(item.product_id)}
                    className="mt-4 w-full text-xs py-2 border rounded-lg hover:bg-gray-50"
                  >
                    Remove
                  </button>
                  <Link
                    href={`/products/${item.product.id}`}
                    className="block mt-2 w-full text-center py-2 bg-black text-white rounded-lg text-sm"
                  >
                    View
                  </Link>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
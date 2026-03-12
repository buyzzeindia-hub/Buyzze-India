"use client";
import { useEffect, useState, useCallback } from "react";
import { useUser } from "@clerk/nextjs"; // ✅ Clerk
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";

export default function FavoriteButton({
  productId,
  size = "md",
}: {
  productId: number;
  size?: "sm" | "md" | "lg";
}) {
  const [loading, setLoading] = useState(false);
  const [isFav, setIsFav] = useState(false);
  const [showToast, setShowToast] = useState<"added" | "removed" | null>(null);
  const router = useRouter();
  const { user, isLoaded } = useUser(); // ✅ Clerk

  // ✅ Favorite status check on load
  useEffect(() => {
    if (!isLoaded || !user) return;

    const load = async () => {
      try {
        const res = await fetch("/api/favorites");
        if (!res.ok) return;
        const data = await res.json();
        const exists = data.favorites?.some((f: any) => f.product_id === productId);
        setIsFav(!!exists);
      } catch (err) {
        console.error("Favorite check error:", err);
      }
    };

    load();
  }, [isLoaded, user, productId]);

  const triggerToast = useCallback((type: "added" | "removed") => {
    setShowToast(type);
    setTimeout(() => setShowToast(null), 2000);
  }, []);

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      router.push("/login");
      return;
    }

    setLoading(true);
    try {
      // ✅ API route se toggle — service_role use karega
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: productId }),
      });

      const data = await res.json();
      if (data.success) {
        const added = data.action === "added";
        setIsFav(added);
        triggerToast(added ? "added" : "removed");
      }
    } catch (err) {
      console.error("Favorite toggle error:", err);
    } finally {
      setLoading(false);
    }
  };

  const sizeMap = {
    sm: { btn: "w-7 h-7", icon: 13 },
    md: { btn: "w-9 h-9", icon: 16 },
    lg: { btn: "w-11 h-11", icon: 20 },
  };
  const { btn, icon } = sizeMap[size];

  return (
    <>
      <button
        onClick={toggleFavorite}
        disabled={loading}
        className={`
          absolute top-2.5 right-2.5 z-30 ${btn} rounded-full
          flex items-center justify-center
          transition-all duration-200
          ${isFav
            ? "bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 shadow-md shadow-red-500/10"
            : "bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm border border-gray-100 dark:border-zinc-700 shadow-md"
          }
          hover:scale-110 active:scale-90
          disabled:opacity-60 disabled:cursor-not-allowed
        `}
        aria-label={isFav ? "Remove from wishlist" : "Add to wishlist"}
      >
        {loading ? (
          <div
            className="rounded-full border-2 border-blue-500 border-t-transparent animate-spin"
            style={{ width: icon - 4, height: icon - 4 }}
          />
        ) : (
          <Heart
            size={icon}
            className={`transition-all duration-300 ${
              isFav
                ? "fill-red-500 text-red-500 scale-110"
                : "text-gray-400 dark:text-gray-500"
            }`}
          />
        )}
      </button>

      {/* Toast — same UI */}
      {showToast && (
        <div className={`
          fixed bottom-24 left-1/2 -translate-x-1/2 z-[200]
          flex items-center gap-2 px-4 py-2.5 rounded-2xl shadow-xl
          text-[12px] font-semibold text-white
          animate-in slide-in-from-bottom-4 fade-in duration-300
          ${showToast === "added"
            ? "bg-gradient-to-r from-red-500 to-pink-500"
            : "bg-gradient-to-r from-gray-600 to-gray-700"
          }
        `}>
          <Heart size={14} className={showToast === "added" ? "fill-white text-white" : "text-white"} />
          {showToast === "added" ? "Added to Wishlist!" : "Removed from Wishlist"}
        </div>
      )}
    </>
  );
}
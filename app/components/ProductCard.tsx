"use client";
import Link from "next/link";
import Image from "next/image";
import { MapPin } from "lucide-react";
import FavoriteButton from "@/components/FavoriteButton";

export default function ProductCard({ product }: { product: any }) {
  const postedDate = new Date(product.created_at).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });

  return (
    <div className="relative group h-full">
      {/* Favorite Button */}
      <FavoriteButton productId={product.id} />

      <Link
        href={`/products/${product.id}`}
        className="group bg-white dark:bg-zinc-900 rounded-xl overflow-hidden border border-gray-200 dark:border-zinc-800 shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:hover:shadow-[0_8px_30px_rgb(255,255,255,0.1)] hover:-translate-y-1 transition-all duration-300 flex flex-col h-full"
      >
        {/* IMAGE AREA */}
        <div className="relative w-full h-48 sm:h-56 md:h-64 overflow-hidden bg-gray-50 dark:bg-zinc-800">
          <Image
            src={product.images?.[0] || "/placeholder-phone.webp"}
            alt={product.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 768px) 50vw, 33vw"
            priority={false}
          />
          
          {/* CONDITION BADGE - Fixed to Yellow BG & Black Text for all options */}
          {product.condition && (
            <div className="absolute top-2 left-2 backdrop-blur-md bg-yellow-400 text-black text-[10px] font-bold px-2.5 py-1 rounded shadow-sm uppercase tracking-wider z-10">
              {product.condition}
            </div>
          )}
        </div>

        {/* CONTENT AREA */}
        <div className="p-3 flex flex-col flex-grow">
          <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
            ₹ {product.price.toLocaleString("en-IN")}
          </p>

          <h3 className="text-sm text-gray-700 dark:text-zinc-300 mt-1 line-clamp-1 group-hover:text-blue-600 transition font-medium">
            {product.title}
          </h3>

          <div className="mt-auto pt-3 flex items-center justify-between border-t border-gray-50 dark:border-zinc-800/50">
            <div className="flex items-center text-gray-500 dark:text-zinc-500 text-[10px] sm:text-[11px] uppercase tracking-tight truncate pr-2">
              <MapPin size={12} className="mr-1 flex-shrink-0" />
              <span className="truncate">
                {product.city}, {product.state}
              </span>
            </div>

            <span className="bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 text-[10px] font-medium px-2 py-0.5 rounded">
              {postedDate}
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}
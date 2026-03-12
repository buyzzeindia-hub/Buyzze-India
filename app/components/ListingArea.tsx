"use client";
import { useState } from "react";
import ProductCard from "./ProductCard";

interface Props {
  products: any[];
  loading: boolean;
  title: string;
}

export default function ListingArea({ products, loading, title }: Props) {
  const [showAll, setShowAll] = useState(false);
  const INITIAL = 10;
  const displayed = showAll ? products : products.slice(0, INITIAL);

  return (
    <section className="max-w-7xl mx-auto px-4 mt-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-0.5 h-5 bg-blue-600 rounded-full" />
          <h2 className="text-[16px] font-bold text-gray-900 dark:text-white">{title}</h2>
          {!loading && products.length > 0 && (
            <span className="text-[12px] text-gray-400">({products.length})</span>
          )}
        </div>
        {!loading && !showAll && products.length > INITIAL && (
          <button
            onClick={() => setShowAll(true)}
            className="text-[12px] font-medium text-blue-600 hover:text-blue-700"
          >
            View all
          </button>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="rounded-xl overflow-hidden bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800">
              <div className="h-44 md:h-48 bg-gray-100 dark:bg-zinc-800 animate-pulse" />
              <div className="p-3 space-y-2">
                <div className="h-2.5 bg-gray-100 dark:bg-zinc-700 rounded animate-pulse w-1/3" />
                <div className="h-3 bg-gray-100 dark:bg-zinc-700 rounded animate-pulse" />
                <div className="h-3 bg-gray-100 dark:bg-zinc-700 rounded animate-pulse w-3/4" />
                <div className="h-4 bg-gray-100 dark:bg-zinc-700 rounded animate-pulse w-2/5 mt-1" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="py-20 text-center bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
          <p className="text-gray-400 font-medium text-[14px]">No products found</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {displayed.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
          {!showAll && products.length > INITIAL && (
            <div className="text-center mt-7">
              <button
                onClick={() => setShowAll(true)}
                className="px-7 py-2.5 rounded-lg border border-gray-300 dark:border-zinc-600 text-[13px] font-medium text-gray-600 dark:text-gray-300 hover:border-blue-500 hover:text-blue-600 transition-colors bg-white dark:bg-zinc-900"
              >
                Load more ({products.length - INITIAL} more)
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}

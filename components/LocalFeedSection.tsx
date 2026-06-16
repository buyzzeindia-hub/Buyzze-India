// components/LocalFeedSection.tsx
// ─────────────────────────────────────────────────────────────
// Drop-in replacement for any product grid on home page
// Uses useLocalFeed internally — no "Near You" badge, feels organic
// ─────────────────────────────────────────────────────────────
"use client";

import { useLocalFeed } from "@/hooks/useLocalFeed";
import ProductCard from "@/components/ProductCard";

interface Props {
  title?: string;
  limit?: number;
  category?: string;
}

export default function LocalFeedSection({
  title,
  limit = 40,
  category,
}: Props) {
  const { products, loading } = useLocalFeed({ limit, category });

  if (loading) return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="aspect-[3/4] rounded-2xl bg-gray-100 dark:bg-gray-900 animate-pulse" />
      ))}
    </div>
  );

  if (!products.length) return null;

  return (
    <section>
      {title && (
        <h2 className="text-lg font-black mb-4 tracking-tight">{title}</h2>
      )}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

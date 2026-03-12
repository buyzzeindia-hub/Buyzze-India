"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type Props = {
  productId: string | number;
  brand: string;
  category: string;
  price: number;
  city: string;
  state: string;
};

export function SimilarProducts({
  productId,
  brand,
  category,
  price,
  city,
  state
}: Props) {
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSimilar = async () => {
      setLoading(true);
      try {
        const { data } = await supabase
          .from("products")
          .select("*")
          .neq("id", productId)
          .limit(100);

        if (data) {
          const filtered = data
            .map((p: any) => {
              let score = 0;

              if (p.city?.toLowerCase() === city?.toLowerCase()) {
                score += 10;
              } else if (p.state?.toLowerCase() === state?.toLowerCase()) {
                score += 5;
              }

              const productPrice = Number(p.price);
              const targetPrice = Number(price);
              const diff = Math.abs(productPrice - targetPrice);
              if (diff <= targetPrice * 0.3) score += 5;

              if (p.brand?.toLowerCase() === brand?.toLowerCase()) score += 3;

              return { ...p, relevanceScore: score };
            })
            .filter((p: any) => p.relevanceScore > 0)
            .sort((a: any, b: any) => b.relevanceScore - a.relevanceScore)
            .slice(0, 10);

          setItems(filtered);
        }
      } catch (error) {
        console.error("Similar Products Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSimilar();
  }, [productId, brand, price, city, state]);

  if (loading) return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {[1, 2, 3, 4, 5].map(i => <div key={i} className="aspect-[3/4] bg-gray-100 dark:bg-gray-900 animate-pulse rounded-[2rem]" />)}
    </div>
  );

  if (!items.length) return (
    <div className="py-10 text-center border-t dark:border-gray-800">
      <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">No similar products found in your area</p>
    </div>
  );

  return (
    <section className="space-y-8">
      <div className="flex flex-col space-y-1">
        <h2 className="text-2xl font-black uppercase tracking-tighter">
          Products Near <span className="text-blue-600">{city}</span>
        </h2>
        <div className="h-1 w-20 bg-blue-600 rounded-full"></div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => {
              router.push(`/products/${item.id}`);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="group bg-white dark:bg-[#0f172a] border dark:border-gray-800 rounded-[2.2rem] overflow-hidden cursor-pointer hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
          >
            <div className="aspect-square bg-gray-50 dark:bg-[#1e293b] p-4 flex items-center justify-center relative">
              <img src={item.images?.[0]} className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-700" alt="" />
              
              <div className="absolute top-3 left-3 flex gap-1">
                {item.city?.toLowerCase() === city?.toLowerCase() && (
                  <span className="bg-green-500 text-[7px] font-black text-white px-2 py-1 rounded-full uppercase tracking-tighter shadow-lg">In Your City</span>
                )}
                {item.brand?.toLowerCase() === brand?.toLowerCase() && (
                  <span className="bg-blue-600 text-[7px] font-black text-white px-2 py-1 rounded-full uppercase tracking-tighter shadow-lg">Same Brand</span>
                )}
              </div>
            </div>

            <div className="p-5">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[8px] font-black text-blue-600 uppercase tracking-widest">{item.brand}</span>
                <span className="text-[8px] font-bold text-gray-400 uppercase">{item.city}</span>
              </div>
              <h3 className="text-sm font-bold line-clamp-1 dark:text-gray-200 mb-2">{item.title}</h3>
              <p className="text-xl font-black text-gray-900 dark:text-white tracking-tighter">₹{Number(item.price).toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
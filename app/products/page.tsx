export const dynamic = 'force-dynamic';

import { supabase }   from "@/lib/supabaseClient";
import Link from "next/link";

export default async function ProductsPage() {
  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("PRODUCT FETCH ERROR:", error);
    return <p className="text-red-600">Failed to load products.</p>;
  }

  return (
    <div style={{ padding: 30 }}>
      <h1 style={{ fontSize: 28, fontWeight: "bold", marginBottom: 20 }}>
        All Products
      </h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: 20,
        }}
      >
        {products?.map((item: any) => (
          <Link href={`/products/${item.id}`} key={item.id}>
            <div
              style={{
                border: "1px solid #ddd",
                padding: 15,
                borderRadius: 8,
                cursor: "pointer",
              }}
            >
              <h2 style={{ fontWeight: "bold" }}>{item.title}</h2>
              <p>₹ {item.price}</p>
              <p>{item.city}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

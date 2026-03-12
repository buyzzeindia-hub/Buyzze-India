import { supabase } from "@/lib/supabaseClient";

export const getSimilarProducts = async ({
  productId,
  brand,
  category,
  price,
}: {
  productId: number;
  brand: string;
  category: string;
  price: number;
}) => {
  const min = price * 0.75;
  const max = price * 1.25;

  const { data } = await supabase
    .from("products")
    .select("id, title, price, images")
    .eq("brand", brand)
    .eq("category", category)
    .neq("id", productId)
    .gte("price", min)
    .lte("price", max)
    .limit(10);

  return data ?? [];
};

import { supabase } from "@/lib/supabaseClient";

export const getDashboardData = async (userId: string) => {
  const { data: products } = await supabase
    .from("products")
    .select("id, title, price, created_at")
    .eq("owner_id", userId)
    .order("created_at", { ascending: false });

  return {
    products: products ?? [],
    totalProducts: products?.length ?? 0,
  };
};

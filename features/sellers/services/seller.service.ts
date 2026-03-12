import { supabase } from "@/lib/supabaseClient";

export const getSellerInfo = async (sellerId: string) => {
  // 1️⃣ Get seller profile (SAFE)
  const { data: profile } = await supabase
    .from("profiles")
    .select("name")
    .eq("id", sellerId)
    .maybeSingle(); // ✅ SAFE (no crash)

  // 2️⃣ Count seller products (SAFE)
  const { count } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq("owner_id", sellerId);

  return {
    name: profile?.name || "Seller",
    isVerified: (count ?? 0) > 1,
  };
};

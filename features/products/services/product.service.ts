import { supabase } from "@/lib/supabaseClient";

export const productService = {

  // ✅ Read — public data, direct Supabase OK
  getAll: async () => {
    return await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
  },

  // ✅ Create — API route se (service_role server pe)
  create: async (data: any) => {
    const res = await fetch("/api/products/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Listing save nahi hui");
    }
    return await res.json();
  },

  // ✅ Update — API route se (sirf owner kar sakta hai)
  update: async (id: number, data: any) => {
    const res = await fetch("/api/products/update", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...data }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Update fail hua");
    }
    return await res.json();
  },
};
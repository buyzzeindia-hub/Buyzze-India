import { supabase } from "@/lib/supabaseClient";

export const productService = {
  async getAll() {
    return supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
  },

  async getById(id: number) {
    return supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();
  },

  async create(payload: any) {
    return supabase.from("products").insert(payload).select().single();
  },

  async update(id: number, payload: any) {
    return supabase
      .from("products")
      .update(payload)
      .eq("id", id)
      .select()
      .single();
  },

  async remove(id: number) {
    return supabase.from("products").delete().eq("id", id);
  },
};

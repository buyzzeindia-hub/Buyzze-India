import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase environment variables missing.");
}

// ✅ Sirf PUBLIC client — browser mein use hoga (read-only public data)
// SECRET key yahan KABHI nahi aayegi
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
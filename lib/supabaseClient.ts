import { createClient } from "@supabase/supabase-js";

// ✅ Fallback strings takki Cloudflare Next.js build time par crash na kare
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder_anon_key";

// ✅ Sirf PUBLIC client — browser mein use hoga (read-only public data)
// SECRET key yahan KABHI nahi aayegi
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
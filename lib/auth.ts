"use server";

import { auth as clerkAuth, currentUser as clerkCurrentUser } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

// Database likhne/padhne ke liye admin client (Kyuki ye server side file hai)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

/**
 * 1. GET CURRENT USER ID (Fast)
 * Ye dono (Clerk + Fast Auth) mein se kisi bhi user ki ID nikal kar dega
 */
export async function getUserId(): Promise<string | null> {
  // Pehle check karo ki kya user Fast Auth (Google/Truecaller) se aaya hai?
  const cookieStore = await cookies();
  const fastSessionId = cookieStore.get("buyzze_fast_session")?.value;
  
  if (fastSessionId) {
    return fastSessionId;
  }

  // Agar nahi, toh check karo ki kya Clerk (Manual) se login hai?
  const { userId } = await clerkAuth();
  return userId;
}

/**
 * 2. GET FULL USER OBJECT
 * Poori user details fetch karega, dono sources ko ek format mein merge karke
 */
export async function getUser() {
  const cookieStore = await cookies();
  const fastSessionId = cookieStore.get("buyzze_fast_session")?.value;

  // Case A: User Fast Auth se aaya hai (Data Supabase me hai)
  if (fastSessionId) {
    const { data: user } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("id", fastSessionId)
      .single();
      
    if (user) {
      return { 
        ...user, 
        auth_source: "fast_auth" 
      };
    }
  }

  // Case B: User Clerk se aaya hai
  const { userId } = await clerkAuth();
  if (userId) {
    const clerkUser = await clerkCurrentUser();
    
    // Clerk user ko Supabase profile jaisa shape de rahe hain taaki frontend confuse na ho
    return {
      id: clerkUser?.id,
      full_name: `${clerkUser?.firstName || ""} ${clerkUser?.lastName || ""}`.trim(),
      email: clerkUser?.primaryEmailAddress?.emailAddress,
      avatar_url: clerkUser?.imageUrl,
      is_phone_verified: false, // Default
      auth_source: "clerk"
    };
  }

  return null; // Koi login nahi hai
}

/**
 * 3. CHECK IF LOGGED IN
 * Route protection (jaise /sell ya /chat) ke liye kaam aayega
 */
export async function isAuthenticated(): Promise<boolean> {
  const userId = await getUserId();
  return !!userId;
}
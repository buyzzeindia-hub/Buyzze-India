"use client";

import { useUser as useClerkUser, useClerk } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { getUser } from "@/lib/auth"; 

export function useBuyzzeAuth() {
  const { isLoaded: isClerkLoaded, user: clerkUser } = useClerkUser();
  const { signOut: clerkSignOut } = useClerk();
  const [fastUser, setFastUser] = useState<any>(null);
  const [isFastLoaded, setIsFastLoaded] = useState(false);

  useEffect(() => {
    async function loadFastUser() {
      try {
        const data = await getUser();
        if (data && data.auth_source === 'fast_auth') {
          setFastUser(data);
        }
      } catch (err) {
        console.error("Fast user load error", err);
      } finally {
        setIsFastLoaded(true);
      }
    }
    loadFastUser();
  }, []);

  const isLoaded = isClerkLoaded && isFastLoaded;

  let mergedUser = null;
  if (clerkUser) {
    mergedUser = {
      id: clerkUser.id,
      full_name: clerkUser.fullName || "User",
      email: clerkUser.primaryEmailAddress?.emailAddress || "",
      avatar_url: clerkUser.imageUrl,
      auth_source: "clerk"
    };
  } else if (fastUser) {
    mergedUser = fastUser; 
  }

  // 🔥 FIX 2: Logout function ko completely sync aur bug-free kar diya
  const logout = async () => {
    try {
      // 1. Server se cookie delete karo
      await fetch("/api/auth/logout", { method: "POST" });
      
      // 2. Client se localStorage turant clear karo taaki Header loop me na fase
      if (typeof window !== "undefined") {
        localStorage.removeItem("buyzze_logged_in");
        localStorage.removeItem("buyzze_fast_id");
      }

      // 3. Clerk ko strictly batao ki logout hoke kahan jana hai (No more 404 errors!)
      if (clerkUser) {
        await clerkSignOut({ redirectUrl: "/login" });
      } else {
        window.location.href = "/login";
      }
    } catch (err) {
      console.error("Logout Error:", err);
      window.location.href = "/login";
    }
  };

  return { isLoaded, user: mergedUser, logout };
}
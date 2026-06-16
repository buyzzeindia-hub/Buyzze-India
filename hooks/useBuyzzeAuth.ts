"use client";

import { useUser as useClerkUser, useClerk } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { getUser } from "@/lib/auth"; // Ye tumhari auth.ts file hai jo pichle step me update ki thi

export function useBuyzzeAuth() {
  const { isLoaded: isClerkLoaded, user: clerkUser } = useClerkUser();
  const { signOut: clerkSignOut } = useClerk();
  const [fastUser, setFastUser] = useState<any>(null);
  const [isFastLoaded, setIsFastLoaded] = useState(false);

  useEffect(() => {
    async function loadFastUser() {
      try {
        // Direct Next.js Server Action call
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

  // Dono auth (Clerk + Fast) ka data ek single format mein merge kar rahe hain
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
    mergedUser = fastUser; // Google/Truecaller user from database
  }

  // Unified Logout function
  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      if (clerkUser) await clerkSignOut();
    } catch (err) {
      console.error(err);
    } finally {
      window.location.href = "/login";
    }
  };

  return { isLoaded, user: mergedUser, logout };
}
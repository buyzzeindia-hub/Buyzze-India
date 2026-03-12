"use client";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs"; // ✅ Clerk
import SearchBar from "./SearchBar";

export default function Header() {
  const router = useRouter();

  // ✅ Clerk se user check — supabase.auth.getSession() replace
  const { user, isLoaded } = useUser();

  return (
    <header className="sticky top-0 z-[100] bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 h-16 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between gap-4">
        {/* Logo — same */}
        <div
          onClick={() => router.push("/")}
          className="text-2xl font-black cursor-pointer text-blue-600 tracking-tighter shrink-0"
        >
          BuYzze
        </div>

        {/* Search Bar — same */}
        <div className="flex-1 max-w-2xl">
          <SearchBar />
        </div>

        {/* Auth Buttons — UI exactly same, sirf Clerk data */}
        <div className="flex items-center gap-3 shrink-0">
          {!isLoaded ? (
            // Loading skeleton — same as before
            <div className="h-9 w-24 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-lg"></div>
          ) : user ? (
            // Logged in — profile avatar, same UI
            <button
              onClick={() => router.push("/profile")}
              className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold border-2 border-white shadow-md"
            >
              {user.emailAddresses[0]?.emailAddress?.charAt(0).toUpperCase()}
            </button>
          ) : (
            // Not logged in — Login button, same UI
            <button
              onClick={() => router.push("/login")}
              className="px-5 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 transition"
            >
              Login
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useUser, useClerk } from "@clerk/nextjs";
import { supabase } from "@/lib/supabaseClient";
import { getDashboardData } from "@/features/dashboard/services/dashboard.service";
import { Loader2, LogOut, Package, User, Mail, Calendar, ChevronRight, Heart } from "lucide-react";
import { motion } from "framer-motion";

type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  created_at?: string;
};

export default function ProfilePage() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [totalProducts, setTotalProducts] = useState(0);
  const [recentAds, setRecentAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [wishlistCount, setWishlistCount] = useState(0); // ✅ Wishlist count

  useEffect(() => {
    if (!isLoaded || !user) return;

    const loadData = async () => {
      try {
        const { data: profileData, error } = await supabase
          .from("profiles")
          .select("id, full_name, email, created_at")
          .eq("id", user.id)
          .maybeSingle();

        if (error) {
          console.error("Profile fetch error:", error.message);
        } else if (profileData) {
          setProfile(profileData);
        }

        const dashboard = await getDashboardData(user.id);
        if (dashboard) {
          setTotalProducts(dashboard.totalProducts || 0);
          setRecentAds(dashboard.recentAds || []);
        }

        // ✅ Wishlist count fetch
        const favRes = await fetch("/api/favorites");
        const favData = await favRes.json();
        if (favData.success) {
          setWishlistCount(favData.favorites?.length || 0);
        }

      } catch (err) {
        console.error("Error loading profile:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, isLoaded]);

  const handleLogout = async () => {
    await signOut();
    window.location.href = "/login";
  };

  if (!isLoaded || loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white dark:bg-gray-950">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1 }}
          className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-gray-500">Please <Link href="/login" className="text-blue-600 font-bold">login</Link> first.</p>
      </div>
    );
  }

  const displayName = profile?.full_name || user.firstName || "User";
  const displayEmail = profile?.email || user.emailAddresses[0]?.emailAddress || "";
  const avatarLetter = displayName.charAt(0).toUpperCase();
  const joinedDate = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-IN", { month: "long", year: "numeric" })
    : "Recently";

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-gray-950 font-sans">

      {/* Background Orbs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-5%] w-[400px] h-[400px] bg-blue-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[10%] right-[-5%] w-[300px] h-[300px] bg-indigo-500/5 blur-[100px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-10 space-y-6">

        {/* Avatar + Name Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-900 rounded-[2rem] p-8 border border-gray-100 dark:border-gray-800 shadow-sm text-center"
        >
          <div className="w-20 h-20 rounded-full bg-blue-600 text-white flex items-center justify-center text-3xl font-black mx-auto mb-4 shadow-lg shadow-blue-500/20">
            {avatarLetter}
          </div>

          <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
            {displayName}
          </h1>
          <p className="text-gray-400 text-sm mt-1">{displayEmail}</p>

          <div className="flex justify-center gap-8 mt-6 pt-6 border-t border-gray-50 dark:border-gray-800">
            <div className="text-center">
              <p className="text-2xl font-black text-blue-600">{totalProducts}</p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Listings</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-black text-red-500">{wishlistCount}</p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Wishlist</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-black text-gray-900 dark:text-white">{joinedDate}</p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Joined</p>
            </div>
          </div>
        </motion.div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}
          className="bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-gray-50 dark:border-gray-800">
            <h2 className="text-xs font-black uppercase tracking-widest text-gray-400">Account Info</h2>
          </div>

          <div className="divide-y divide-gray-50 dark:divide-gray-800">
            <div className="flex items-center gap-4 px-6 py-4">
              <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
                <User size={16} className="text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Full Name</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{displayName}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 px-6 py-4">
              <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
                <Mail size={16} className="text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{displayEmail}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 px-6 py-4">
              <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
                <Calendar size={16} className="text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Member Since</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">{joinedDate}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }}
          className="bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-gray-50 dark:border-gray-800">
            <h2 className="text-xs font-black uppercase tracking-widest text-gray-400">Quick Actions</h2>
          </div>

          <div className="divide-y divide-gray-50 dark:divide-gray-800">
            <Link href="/dashboard" className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
              <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
                <Package size={16} className="text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-gray-900 dark:text-white">My Listings</p>
                <p className="text-[10px] text-gray-400">{totalProducts} active listings</p>
              </div>
              <ChevronRight size={16} className="text-gray-300" />
            </Link>

            {/* ✅ Wishlist Button */}
            <Link href="/wishlist" className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
              <div className="w-9 h-9 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center shrink-0">
                <Heart size={16} className="text-red-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-gray-900 dark:text-white">My Wishlist</p>
                <p className="text-[10px] text-gray-400">{wishlistCount} saved items</p>
              </div>
              <ChevronRight size={16} className="text-gray-300" />
            </Link>

            <Link href="/sell" className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
              <div className="w-9 h-9 rounded-xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center shrink-0">
                <Package size={16} className="text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-gray-900 dark:text-white">Add New Listing</p>
                <p className="text-[10px] text-gray-400">Sell your device</p>
              </div>
              <ChevronRight size={16} className="text-gray-300" />
            </Link>
          </div>
        </motion.div>

        {/* Logout Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 0.3 } }}
          whileTap={{ scale: 0.98 }}
          onClick={handleLogout}
          className="w-full py-4 bg-red-50 dark:bg-red-900/10 text-red-600 rounded-2xl font-black text-xs tracking-widest uppercase border border-red-100 dark:border-red-900/20 flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"
        >
          <LogOut size={16} />
          Logout
        </motion.button>

      </div>
    </div>
  );
}
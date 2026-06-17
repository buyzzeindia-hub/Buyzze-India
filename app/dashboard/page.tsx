"use client";

import { useEffect, useState } from "react";
import { useClerk } from "@clerk/nextjs";
import { useBuyzzeAuth } from "@/hooks/useBuyzzeAuth";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { getDashboardData } from "@/features/dashboard/services/dashboard.service";
import { UserInfoCard } from "@/features/dashboard/components/UserInfoCard";
import { StatsCards } from "@/features/dashboard/components/StatsCards";
import { MyProductsList } from "@/features/dashboard/components/MyProductsList";
import { LayoutDashboard, Plus, LogOut } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const router = useRouter();
  
  const { user, isLoaded } = useBuyzzeAuth();
  const { signOut } = useClerk();
  
  const [localUserId, setLocalUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState(true);

  // Unified ID Syncing
  useEffect(() => {
    if (user?.id) {
      setLocalUserId(user.id);
    } else if (typeof window !== "undefined") {
      const isLogged = localStorage.getItem("buyzze_logged_in") === "true";
      if (isLogged) {
        let fastId = localStorage.getItem("buyzze_fast_id");
        if (!fastId) {
          fastId = "fast_user_" + Math.random().toString(36).substr(2, 10);
          localStorage.setItem("buyzze_fast_id", fastId);
        }
        setLocalUserId(fastId);
      }
    }
  }, [user]);

  // Auth Guard & Data Init Loop
  useEffect(() => {
    if (!isLoaded) return;

    const isLoggedLocal = typeof window !== "undefined" && localStorage.getItem("buyzze_logged_in") === "true";

    if (!user && !isLoggedLocal) {
      router.replace("/login");
      return;
    }

    if (localUserId) {
      initData(localUserId);
    }
  }, [isLoaded, user, router, localUserId]);

  async function initData(uid: string) {
    const { data: profileData } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", uid)
      .single();

    if (profileData) setProfile(profileData);

    const dashboard = await getDashboardData(uid);
    setProducts(dashboard.products);
    setTotalProducts(dashboard.totalProducts);
    setLoading(false);
  }

  const handleLogout = async () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("buyzze_logged_in");
      localStorage.removeItem("buyzze_fast_id");
      document.cookie = "buyzze_fast_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    }
    await signOut();
    router.push("/login");
  };

  if (!isLoaded || loading) return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] text-gray-900 dark:text-gray-100 font-sans transition-colors duration-300">

      {/* Classic Minimal Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-blue-600 p-1.5 rounded-lg flex items-center justify-center">
              <LayoutDashboard className="text-white w-4 h-4" />
            </div>
            <span className="text-lg font-bold tracking-tight">
              Dashboard
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-500 transition-colors"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 space-y-8">
        
        {/* Header Section */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Welcome back, {profile?.full_name?.split(" ")[0] || user?.firstName || "Merchant"}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Here's an overview of your marketplace activity today.
            </p>
          </motion.div>
          
          <Link href="/sell">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm flex items-center gap-2 transition-colors w-full sm:w-auto justify-center"
            >
              <Plus size={16} /> New Listing
            </motion.button>
          </Link>
        </header>

        {/* Dashboard Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          
          {/* Left Column: User Info */}
          <div className="lg:col-span-4">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}>
              <UserInfoCard user={user} profileName={profile?.full_name} />
            </motion.div>
          </div>
          
          {/* Right Column: Stats & Products List */}
          <div className="lg:col-span-8 space-y-6 lg:space-y-8">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.2 }}>
              <StatsCards totalProducts={totalProducts} />
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.3 }}
              className="bg-white dark:bg-[#121212] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden"
            >
              <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                <h3 className="text-base font-semibold tracking-tight">Active Listings</h3>
              </div>
              <div className="p-6">
                {localUserId && <MyProductsList products={products} userId={localUserId} />}
              </div>
            </motion.div>
          </div>

        </div>
      </main>
    </div>
  );
}
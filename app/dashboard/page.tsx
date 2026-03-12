"use client";

import { useEffect, useState } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
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
  const { user, isLoaded, isSignedIn } = useUser();
  const { signOut } = useClerk();
  const [profile, setProfile] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      router.replace("/login");
      return;
    }

    async function init() {
      const userId = user!.id;

      // Supabase se profile fetch karo
      const { data: profileData } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", userId)
        .single();

      if (profileData) setProfile(profileData);

      const dashboard = await getDashboardData(userId);
      setProducts(dashboard.products);
      setTotalProducts(dashboard.totalProducts);
      setLoading(false);
    }

    init();
  }, [isLoaded, isSignedIn, router, user]);

  const handleLogout = async () => {
    await signOut();
    router.push("/login");
  };

  if (!isLoaded || loading) return (
    <div className="h-screen w-full flex items-center justify-center bg-white dark:bg-gray-950">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1 }}
        className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full"
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-gray-950 transition-colors duration-500 font-sans relative overflow-hidden">

      {/* Background Orbs — same */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-5%] w-[400px] h-[400px] bg-blue-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[10%] right-[-5%] w-[300px] h-[300px] bg-indigo-500/5 blur-[100px] rounded-full" />
      </div>

      {/* Navbar — same UI, logout updated */}
      <nav className="relative z-50 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-xl shadow-lg shadow-blue-500/20">
              <LayoutDashboard className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-black tracking-tighter">
              BuYzze <span className="text-blue-600">.</span>
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="p-2.5 rounded-xl text-gray-400 hover:text-red-500 transition-all"
          >
            <LogOut size={20} />
          </button>
        </div>
      </nav>

      {/* Main Content — bilkul same */}
      <main className="relative z-10 max-w-7xl mx-auto p-6 md:p-10 space-y-10">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">
              Hello, {profile?.full_name?.split(" ")[0] || user?.firstName || "Merchant"}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 font-medium">
              Manage your elite marketplace activity.
            </p>
          </motion.div>
          <Link href="/sell">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-blue-600 text-white px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-blue-500/25 flex items-center gap-2"
            >
              <Plus size={18} /> Add New Listing
            </motion.button>
          </Link>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4">
            <UserInfoCard user={user} profileName={profile?.full_name} />
          </div>
          <div className="lg:col-span-8 space-y-8">
            <StatsCards totalProducts={totalProducts} />
            <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-xl overflow-hidden">
              <div className="px-8 py-6 border-b border-gray-50 dark:border-gray-800">
                <h3 className="text-lg font-black uppercase tracking-tight">My Listings</h3>
              </div>
              <div className="p-6">
                <MyProductsList products={products} userId={user!.id} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

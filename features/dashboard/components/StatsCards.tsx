"use client";

import { Package, TrendingUp } from "lucide-react";

export function StatsCards({ totalProducts }: { totalProducts: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      <div className="group bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-lg hover:border-blue-500/30 transition-all">
        <div className="flex justify-between items-start mb-4">
          <div className="p-3 bg-blue-50 dark:bg-blue-500/10 rounded-2xl text-blue-600 group-hover:scale-110 transition-transform">
            <Package size={24} />
          </div>
          <TrendingUp size={16} className="text-green-500" />
        </div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Total Listings</p>
        <p className="text-4xl font-black text-gray-900 dark:text-white mt-1">{totalProducts}</p>
      </div>

      <div className="bg-blue-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-blue-500/20 flex flex-col justify-center">
        <h4 className="text-lg font-black tracking-tight italic">BuYzze Elite</h4>
        <p className="text-blue-100 text-[10px] font-bold uppercase tracking-widest mt-1">Verified Merchant Status</p>
      </div>
    </div>
  );
}
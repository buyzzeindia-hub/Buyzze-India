"use client";

import { Package, TrendingUp, Award } from "lucide-react";

export function StatsCards({ totalProducts }: { totalProducts: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
      {/* Card 1: Total Listings */}
      <div className="bg-white dark:bg-[#121212] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col justify-between transition-all hover:shadow-md">
        <div className="flex justify-between items-start mb-4">
          <div className="p-2.5 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700/50 text-gray-600 dark:text-gray-300">
            <Package size={20} />
          </div>
          <div className="flex items-center gap-1 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-500/10 px-2.5 py-1 rounded-md text-xs font-semibold">
            <TrendingUp size={14} />
            <span>Active</span>
          </div>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Listings</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{totalProducts}</p>
        </div>
      </div>

      {/* Card 2: Merchant Status */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-6 rounded-2xl shadow-sm border border-blue-500 flex flex-col justify-between relative overflow-hidden transition-all hover:shadow-md">
        {/* Subtle background decoration */}
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="p-2.5 bg-white/10 rounded-xl border border-white/20 text-white w-max mb-4 backdrop-blur-sm">
          <Award size={20} />
        </div>
        <div className="relative z-10">
          <h4 className="text-xl font-bold text-white tracking-tight">BuYzze Elite</h4>
          <p className="text-blue-100 text-sm font-medium mt-1">Verified Merchant Status</p>
        </div>
      </div>
    </div>
  );
}
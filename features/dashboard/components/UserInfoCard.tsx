"use client";

import { User, Mail, ShieldCheck } from "lucide-react";

export function UserInfoCard({ user, profileName }: { user: any; profileName?: string }) {
  return (
    <div className="bg-white dark:bg-[#121212] rounded-2xl p-6 md:p-8 border border-gray-200 dark:border-gray-800 shadow-sm">
      {/* Header section */}
      <div className="flex items-center gap-3 mb-6 pb-5 border-b border-gray-100 dark:border-gray-800/60">
        <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
          <User size={24} />
        </div>
        <div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-white tracking-tight">Account Profile</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Your personal details</p>
        </div>
      </div>
      
      {/* Info Rows */}
      <div className="space-y-6">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 font-medium">
            <ShieldCheck size={16} className="text-gray-400 dark:text-gray-500" />
            <span>Full Name</span>
          </div>
          <p className="text-base font-semibold text-gray-900 dark:text-white pl-6">
            {profileName || user?.user_metadata?.full_name || "User"}
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 font-medium">
            <Mail size={16} className="text-gray-400 dark:text-gray-500" />
            <span>Email Address</span>
          </div>
          <p className="text-base font-semibold text-gray-900 dark:text-white pl-6 break-all">
            {user?.email || "No email provided"}
          </p>
        </div>
      </div>
    </div>
  );
}
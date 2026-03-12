"use client";

import { User, Mail, ShieldCheck } from "lucide-react";

export function UserInfoCard({ user, profileName }: { user: any; profileName?: string }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/40 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-5">
        <User size={120} />
      </div>
      <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 mb-8">Account Profile</h3>
      
      <div className="space-y-6 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600">
            <ShieldCheck size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Full Name</p>
            <p className="text-lg font-black text-gray-900 dark:text-white">{profileName || user.user_metadata?.full_name || "User"}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400">
            <Mail size={22} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email Address</p>
            <p className="text-sm font-bold text-gray-600 dark:text-gray-300">{user.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
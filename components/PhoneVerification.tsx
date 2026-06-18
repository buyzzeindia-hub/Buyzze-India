"use client";

import { Lock } from "lucide-react";
import Link from "next/link";

interface Props {
  onVerified?: () => void; // Optional agar tumhe modal close karna ho
}

export function PhoneVerification({ onVerified }: Props) {
  return (
    <div className="w-full bg-white dark:bg-[#121212] p-8 rounded-2xl text-center border border-gray-100 dark:border-gray-800 shadow-xl">
      {/* Lock Icon */}
      <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
        <Lock className="text-blue-600" size={32} />
      </div>

      <h3 className="text-lg font-blue text-blue-600 dark:text-white mb-2">
        Verify Number via Truecaller 
      </h3>
      
      <p className="text-sm text-gray-500 mb-8 leading-relaxed">
        Please complete your number verification via the Truecaller app. 
        Once verified, your profile will be updated automatically.
      </p>

      <div className="space-y-4">
        {/* Home Page Link */}
        <Link 
          href="/" 
          className="block w-full py-3 bg-gray-900 dark:bg-gray-800 text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition-all"
        >
          Back to Home
        </Link>
        
        {/* Optional Close button agar modal band karna ho */}
        {onVerified && (
          <button 
            onClick={onVerified}
            className="w-full text-xs font-semibold text-gray-400 hover:text-gray-600 transition-colors"
          >
            Close
          </button>
        )}
      </div>
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import { getSellerInfo } from "../services/seller.service";

export function SellerMiniCard({ sellerId }: { sellerId: string }) {
  const [seller, setSeller] = useState<{
    name: string;
    isVerified: boolean;
  } | null>(null);

  useEffect(() => {
    let mounted = true;

    getSellerInfo(sellerId)
      .then((data) => {
        if (mounted) setSeller(data);
      })
      .catch(() => {
        // 🔒 Fallback – UI must never crash
        setSeller({
          name: "Seller",
          isVerified: false,
        });
      });

    return () => {
      mounted = false;
    };
  }, [sellerId]);

  if (!seller) return null;

  return (
    <div className="border rounded-lg p-4 flex items-center gap-4 bg-gray-50">
      <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
        {seller.name.charAt(0).toUpperCase()}
      </div>

      <div>
        <div className="flex items-center gap-2">
          <p className="font-semibold">{seller.name}</p>

          {seller.isVerified && (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
              ✔ Verified Seller
            </span>
          )}
        </div>

        {!seller.isVerified && (
          <p className="text-xs text-gray-500">
            New seller on Buyzze
          </p>
        )}
      </div>
    </div>
  );
}

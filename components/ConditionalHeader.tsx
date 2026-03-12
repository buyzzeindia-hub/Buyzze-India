"use client";
import { usePathname } from "next/navigation";
import Header from "@/components/Header";

// ✅ Koi change nahi — bilkul same
export default function ConditionalHeader() {
  const pathname = usePathname();
  const isChatPage = pathname?.startsWith("/chat/") || pathname === "/chat";
  if (isChatPage) return null;
  return <Header />;
}
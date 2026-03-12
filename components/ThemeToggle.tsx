"use client";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="w-9 h-9" />;

  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
      className="w-9 h-9 rounded-full flex items-center justify-center
        bg-gray-100 dark:bg-white/[0.07]
        border border-gray-200 dark:border-white/10
        text-gray-600 dark:text-gray-300
        hover:bg-gray-200 dark:hover:bg-white/[0.12]
        transition-all duration-200"
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}

"use client";

import { useEffect, useState } from "react";

export default function BackgroundPattern() {
  const [mounted, setMounted] = useState(false);

  // Jab component browser (client) par mount ho jayega, tabhi state true hogi
  useEffect(() => {
    setMounted(true);
  }, []);

  // Server-side rendering ke time pe kuch return nahi karenge, isse hydration error bypass ho jayega
  if (!mounted) {
    return null;
  }

  return (
    <>
      {/* Light mode */}
      <div
        className="fixed inset-0 z-0 pointer-events-none dark:hidden"
        style={{ backgroundColor: "#f0f2f7" }}
      />
      {/* Dark mode */}
      <div
        className="fixed inset-0 z-0 pointer-events-none hidden dark:block"
        style={{ backgroundColor: "#08090e" }}
      />
    </>
  );
}
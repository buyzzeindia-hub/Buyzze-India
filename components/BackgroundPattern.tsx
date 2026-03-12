"use client";

export default function BackgroundPattern() {
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
"use client";

export function TypingIndicator({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 px-2 py-1">
      <div
        className="flex items-center gap-1.5 px-4 py-3 rounded-[18px] rounded-bl-[5px]"
        style={{
          background: "#ffffff",
          boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
        }}
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="block rounded-full"
            style={{
              width: 7,
              height: 7,
              background: "#9ca3af",
              animation: "typingWave 1.4s ease-in-out infinite",
              animationDelay: `${i * 0.18}s`,
            }}
          />
        ))}
      </div>
      <style>{`
        @keyframes typingWave {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

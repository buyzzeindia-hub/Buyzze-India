"use client";
import { useRef } from "react";
import { Send, Paperclip, Smile } from "lucide-react";

export function ChatInput({ value, onChange, onSend }: any) {
  const inputRef = useRef<HTMLInputElement>(null);
  const canSend = value.trim().length > 0;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && canSend) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div
      className="flex items-center gap-2 px-3 py-2.5"
      style={{ background: "#f0f2f5", borderTop: "1px solid #e8eaed" }}
    >
      <button className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all active:scale-90 hover:bg-gray-200">
        <Paperclip size={19} color="#6b7280" />
      </button>

      <div
        className="flex-1 flex items-center gap-2 px-4 rounded-full min-h-[44px]"
        style={{ background: "#fff", border: "1px solid #e5e7eb", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}
        onClick={() => inputRef.current?.focus()}
      >
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message…"
          className="flex-1 bg-transparent text-[14.5px] text-gray-800 placeholder-gray-400 outline-none py-2.5"
          style={{ caretColor: "#6366f1" }}
        />
        <Smile size={20} color="#9ca3af" />
      </div>

      <button
        onClick={canSend ? onSend : undefined}
        className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 transition-all active:scale-90"
        style={{
          background: canSend ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : "#e5e7eb",
          boxShadow: canSend ? "0 3px 12px rgba(99,102,241,0.4)" : "none",
          transition: "all 0.25s cubic-bezier(0.34,1.56,0.64,1)",
          transform: canSend ? "scale(1.05)" : "scale(1)",
        }}
      >
        {canSend ? (
          <Send size={16} color="white" style={{ transform: "translateX(1px)" }} />
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#9ca3af">
            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5zm6 6c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
          </svg>
        )}
      </button>
    </div>
  );
}

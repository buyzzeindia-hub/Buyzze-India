import { ShieldCheck } from "lucide-react";

export function EmptyChat() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-5 px-6 select-none">
      <div
        className="flex flex-col items-center gap-3 px-6 py-5 rounded-2xl max-w-[280px] text-center"
        style={{
          background: "rgba(255,255,255,0.8)",
          border: "1px solid #e5e7eb",
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        }}
      >
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: "#eff6ff" }}
        >
          <ShieldCheck size={18} color="#6366f1" />
        </div>
        <div>
          <p className="text-[13px] font-semibold text-gray-700 mb-1">Secured by BuyZze</p>
          <p className="text-[11.5px] text-gray-400 leading-relaxed">
            Your conversation is protected. Safe buying and selling guaranteed.
          </p>
        </div>
      </div>
      <p className="text-[13px] text-gray-400">Say hello 👋</p>
    </div>
  );
}

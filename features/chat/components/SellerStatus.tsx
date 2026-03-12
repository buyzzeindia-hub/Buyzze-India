export function SellerStatus({ status }: { status: "online" | "offline" }) {
  const isOnline = status === "online";
  return (
    <div className="flex items-center gap-1.5">
      <span
        className="inline-block w-2 h-2 rounded-full flex-shrink-0 transition-all duration-500"
        style={{
          backgroundColor: isOnline ? "#22c55e" : "#9ca3af",
          boxShadow: isOnline ? "0 0 0 3px rgba(34,197,94,0.2), 0 0 6px rgba(34,197,94,0.5)" : "none",
        }}
      />
      <span
        className="text-[11.5px] font-medium"
        style={{ color: isOnline ? "#16a34a" : "#9ca3af" }}
      >
        {isOnline ? "online" : "last seen recently"}
      </span>
    </div>
  );
}

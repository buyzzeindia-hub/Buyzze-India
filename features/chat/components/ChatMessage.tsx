"use client";
import { useState } from "react";
import { CheckCheck, Pencil, Trash2, X } from "lucide-react";

export function ChatMessageBubble({ message, isMe, onDelete, onEdit, isFirst }: any) {
  const [showOptions, setShowOptions] = useState(false);
  const [lastTap, setLastTap] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(message.text);

  const handleDoubleTap = () => {
    if (!isMe) return;
    const now = Date.now();
    if (now - lastTap < 320) setShowOptions((v) => !v);
    setLastTap(now);
  };

  const handleSaveEdit = () => {
    if (editValue.trim() && editValue !== message.text) onEdit(editValue);
    setIsEditing(false);
    setShowOptions(false);
  };

  const timeStr = new Date(message.createdAt).toLocaleTimeString([], {
    hour: "2-digit", minute: "2-digit",
  });

  return (
    <div
      className={`flex w-full px-2 mb-0.5 ${isMe ? "justify-end" : "justify-start"}`}
      onClick={handleDoubleTap}
    >
      <div className="relative max-w-[75%]">
        {/* Bubble */}
        <div
          className="relative px-3.5 pt-2.5 pb-2 text-[14.5px] leading-relaxed"
          style={{
            background: isMe ? "#d9fdd3" : "#ffffff",
            color: "#111827",
            borderRadius: isMe ? "18px 18px 5px 18px" : "18px 18px 18px 5px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
          }}
        >
          {isEditing ? (
            <div className="flex flex-col gap-2 min-w-[180px]">
              <input
                autoFocus
                className="border border-gray-200 outline-none p-2 rounded-xl text-[14px] w-full bg-gray-50 text-gray-900"
                style={{ caretColor: "#6366f1" }}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSaveEdit()}
              />
              <div className="flex justify-end gap-2 text-[11px] font-bold">
                <button
                  onClick={() => { setIsEditing(false); setShowOptions(false); }}
                  className="px-3 py-1 rounded-full text-gray-500 bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-3 py-1 rounded-full text-white"
                  style={{ background: "#6366f1" }}
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <div>
              <p className="whitespace-pre-wrap text-gray-900">{message.text}</p>
              <div className="flex items-center justify-end gap-1.5 mt-1 -mb-0.5">
                {message.edited && (
                  <span className="text-[10px] italic text-gray-400">edited</span>
                )}
                <span className="text-[10.5px] text-gray-400">{timeStr}</span>
                {isMe && (
                  <CheckCheck size={14} color="#53bdeb" strokeWidth={2.5} />
                )}
              </div>
            </div>
          )}
        </div>

        {/* Context menu on double-tap own message */}
        {showOptions && !isEditing && (
          <div
            className="absolute z-[200] flex items-center gap-0.5 p-1 rounded-2xl"
            style={{
              background: "#ffffff",
              border: "1px solid #e5e7eb",
              boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
              ...(isFirst
                ? { top: "calc(100% + 6px)", right: 0 }
                : { bottom: "calc(100% + 6px)", right: 0 }),
            }}
          >
            <button
              onClick={() => { setIsEditing(true); setShowOptions(false); }}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-[12px] font-semibold transition-colors hover:bg-gray-50"
              style={{ color: "#6366f1" }}
            >
              <Pencil size={13} /> Edit
            </button>
            <div className="w-px h-5 bg-gray-100" />
            <button
              onClick={() => { onDelete(); setShowOptions(false); }}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-[12px] font-semibold transition-colors hover:bg-gray-50"
              style={{ color: "#ef4444" }}
            >
              <Trash2 size={13} /> Delete
            </button>
            <div className="w-px h-5 bg-gray-100" />
            <button
              onClick={() => setShowOptions(false)}
              className="p-2.5 rounded-xl text-gray-400 hover:bg-gray-50 transition-colors"
            >
              <X size={12} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

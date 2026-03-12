"use client";
import { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";
import BuyzzeChat from "@/components/BuyzzeChat";

export default function ZzeWrapper({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return <>{children}</>;

  return (
    <>
      <style>{`
        /* ── Floating AI Panel Styles ── */
        .zze-floating-container {
          position: fixed;
          top: 50%;
          transform: translateY(-50%);
          right: ${open ? '24px' : '-440px'};
          width: 420px;
          height: 560px;
          z-index: 9999;
          transition: right 0.4s cubic-bezier(0.34, 1.1, 0.64, 1);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          border-radius: 24px;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        /* Mobile styles */
        @media (max-width: 640px) {
          .zze-floating-container {
            width: 340px;
            height: 500px;
            top: auto;
            bottom: 80px;
            transform: none;
          }
        }

        /* FAB button */
        .zze-fab {
          position: fixed;
          bottom: 28px;
          right: 28px;
          z-index: 9998;
          width: 56px;
          height: 56px;
          border-radius: 50%;
          border: none;
          cursor: pointer;
          background: linear-gradient(135deg, #4f6ef7, #7c3aed);
          box-shadow: 0 10px 25px -5px rgba(79, 110, 247, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .zze-fab:hover {
          transform: scale(1.1);
          box-shadow: 0 20px 30px -8px rgba(79, 110, 247, 0.7);
        }

        .zze-fab:active {
          transform: scale(0.95);
        }

        @keyframes zzePulse {
          0% { box-shadow: 0 0 0 0 rgba(79, 110, 247, 0.5); }
          70% { box-shadow: 0 0 0 15px rgba(79, 110, 247, 0); }
          100% { box-shadow: 0 0 0 0 rgba(79, 110, 247, 0); }
        }

        .zze-fab-pulse {
          animation: zzePulse 2.5s ease-out infinite;
        }

        .zze-fab-pulse:hover {
          animation: none;
        }
      `}</style>

      {/* Main website content - completely unaffected */}
      <div style={{ 
        minHeight: "100vh",
        position: "relative",
        zIndex: 1,
        background: "transparent"
      }}>
        {children}
      </div>

      {/* Floating AI Panel */}
      <div className="zze-floating-container">
        <BuyzzeChat 
          isOpen={open} 
          onClose={() => setOpen(false)} 
          isDesktop={true}
          isFloating={true}
        />
      </div>

      {/* Mobile drawer - hidden by default, only shown via separate logic if needed */}
      <div className="md:hidden" style={{ display: 'none' }}>
        <BuyzzeChat isOpen={open} onClose={() => setOpen(false)} isDesktop={false} />
      </div>

      {/* FAB Button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="zze-fab zze-fab-pulse"
          aria-label="Open ZzE AI"
        >
          <Sparkles size={24} color="white" />
        </button>
      )}
    </>
  );
}
"use client";
import { useUser } from "@clerk/nextjs";
import { X, Sparkles, Bot } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  isDesktop: boolean;
  isFloating?: boolean;
}

export default function BuyzzeChat({ isOpen, onClose, isDesktop, isFloating = false }: Props) {
  const { user } = useUser();

  // ── Greeting ──
  const h = new Date().getHours();
  const greeting    = h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : h < 21 ? "Good evening" : "Good night";
  const displayName = user?.firstName || "there";

  // ── Drawer layout ──
  const drawerStyle: React.CSSProperties =
    isDesktop && isFloating
      ? { width: "100%", height: "100%", background: "#0a0a0f", display: "flex",
          flexDirection: "column", overflow: "hidden", borderRadius: "24px",
          border: "1px solid rgba(255,255,255,0.1)" }
      : isDesktop
      ? { position: "relative", width: "100%", height: "100%", minHeight: "100vh",
          background: "#0a0a0f", borderLeft: "1px solid rgba(255,255,255,0.07)",
          display: "flex", flexDirection: "column", overflow: "hidden",
          animation: isOpen ? "zSlideRight 0.38s cubic-bezier(0.4,0,0.2,1) forwards" : "none" }
      : { 
          // 📱 MOBILE STYLE: Compact Popup with Left-to-Right Slide
          position: "fixed", 
          top: "50%", 
          left: isOpen ? "50%" : "-100%", // Left se slide hoke center mein aayega
          transform: "translate(-50%, -50%)",
          width: "90%", 
          maxWidth: "340px",
          height: "auto",
          maxHeight: "85vh",
          background: "#0a0a0f", 
          zIndex: 9991,
          transition: "left 0.4s cubic-bezier(0.34, 1.1, 0.64, 1)", // Smooth spring bounce
          borderRadius: "24px", 
          display: "flex", 
          flexDirection: "column",
          overflow: "hidden", 
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 25px 50px rgba(0,0,0,0.5)"
        };

  return (
    <>
      <style>{`
        @keyframes zSlideRight {
          from { opacity:0; transform:translateX(32px); }
          to   { opacity:1; transform:translateX(0); }
        }
        @keyframes zPulseGreen {
          0%,100% { box-shadow:0 0 0 0 rgba(34,197,94,0.5); }
          50%     { box-shadow:0 0 0 5px rgba(34,197,94,0); }
        }
        .z-glow-green    { animation: zPulseGreen 2s ease infinite; }
        .z-scrollbar-hide::-webkit-scrollbar { display:none; }
        .z-scrollbar-hide { -ms-overflow-style:none; scrollbar-width:none; }
      `}</style>

      {/* Mobile backdrop */}
      {!isDesktop && (
        <div onClick={onClose} style={{
          position:"fixed", inset:0, background:"rgba(0,0,0,0.6)",
          backdropFilter:"blur(4px)", zIndex:9990,
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
          transition: "opacity 0.3s ease"
        }} />
      )}

      <div style={drawerStyle}>
        
        {/* ── Top bar ── */}
        <div style={{
          background:"rgba(10,10,15,0.85)", backdropFilter:"blur(20px)",
          borderBottom:"1px solid rgba(255,255,255,0.06)",
          padding:"12px 16px", position:"sticky", top:0, zIndex:10,
          display:"flex", alignItems:"center", gap:12,
        }}>
          <div style={{
            width:28, height:28, borderRadius:"50%",
            background:"linear-gradient(135deg, #4f6ef7, #7c3aed)",
            display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0,
          }}>
            <Sparkles size={14} color="white" />
          </div>
          <span style={{
            background:"linear-gradient(135deg, #4f6ef7, #7c3aed)",
            WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
            fontWeight:700, fontSize:13,
          }}>ZzE AI</span>
          <div style={{
            width:8, height:8, borderRadius:"50%", background:"#22c55e",
            marginLeft:-6, boxShadow:"0 0 0 2px rgba(10,10,15,0.8)",
          }} className="z-glow-green" />
          
          <div style={{ flex:1 }} />
          
          <button onClick={onClose} style={{
            background:"rgba(255,255,255,0.08)", border:"none", borderRadius:8,
            padding:8, cursor:"pointer", color:"#fff",
            display:"flex", alignItems:"center", justifyContent:"center",
          }}>
            {/* Phone aur Desktop dono me ab X button hi dikhega */}
            <X size={16} /> 
          </button>
        </div>

        {/* ── Main Content Area ── */}
        <div className="z-scrollbar-hide" style={{
          flex:1, overflowY:"auto",
          padding: "20px 16px",
          display:"flex", flexDirection:"column",
        }}>
            <div style={{
              display:"flex", flexDirection:"column", alignItems:"center",
              justifyContent:"center", padding:"10px 10px 20px",
            }}>
              
              <div style={{ textAlign:"center", marginBottom:30, width:"100%" }}>
                <h1 style={{ fontSize: isDesktop ? 32 : 24, fontWeight:700, color:"#fff", marginBottom:8, letterSpacing:"-0.02em" }}>
                  {greeting},{" "}
                  <span style={{
                    background:"linear-gradient(135deg, #4f6ef7, #7c3aed)",
                    WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
                  }}>{displayName}</span>
                </h1>
                <p style={{ color:"rgba(255,255,255,0.6)", fontSize: isDesktop ? 16 : 14 }}>
                  How can I help you today?
                </p>
              </div>

              {/* ── COMING SOON BOX ── */}
              <div style={{ width:"100%", maxWidth:480, position:"relative" }}>
                <div style={{
                  width:"100%", boxSizing:"border-box",
                  background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)",
                  borderRadius:24, padding: isDesktop ? "32px 20px" : "24px 16px",
                  display: "flex", flexDirection: "column", alignItems: "center",
                  textAlign: "center",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.2)"
                }}>
                  <div style={{
                    width:56, height:56, borderRadius:"50%",
                    background:"rgba(79,110,247,0.1)",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    marginBottom: 16, border: "1px solid rgba(79,110,247,0.2)"
                  }}>
                    <Bot size={28} color="#60a5fa" />
                  </div>
                  <h3 style={{ fontSize: isDesktop ? 18 : 16, fontWeight: 600, color: "#fff", marginBottom: 8 }}>
                    AI Chat is Coming Soon 🚀
                  </h3>
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.6, maxWidth: 300 }}>
                    We are training ZzE AI to help you hunt the best deals, negotiate prices, and stay safe from scams.
                  </p>
                </div>
              </div>

            </div>
        </div>

      </div>
    </>
  );
}
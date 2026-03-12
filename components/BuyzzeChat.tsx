"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import {
  Send, X, Mic, MicOff, Sparkles, Bot, ChevronDown,
  Smartphone, IndianRupee, Tag, Shield, HelpCircle, Volume2, VolumeX,
} from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function genId(): string {
  try { return crypto.randomUUID(); }
  catch { return Math.random().toString(36).slice(2) + Date.now().toString(36); }
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface ProductCard {
  id: string;
  title: string;
  price: number;
  city: string;
  images?: string[];
}

interface Msg {
  id: string;
  role: "user" | "ai";
  content: string;      // full text (always stored)
  time: Date;
  products?: ProductCard[];
  displayed?: string;   // text shown so far (typing animation)
  isTyping?: boolean;   // still animating?
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  isDesktop: boolean;
  isFloating?: boolean;
}

// ─── Speech Recognition Types ─────────────────────────────────────────────────
interface SREvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}
interface SRInstance extends EventTarget {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  continuous: boolean;
  onstart: (() => void) | null;
  onresult: ((this: SRInstance, ev: SREvent) => void) | null;
  onend: ((this: SRInstance, ev: Event) => void) | null;
  onerror: ((this: SRInstance, ev: Event) => void) | null;
  start: () => void;
  stop: () => void;
}
declare global {
  interface Window {
    SpeechRecognition: new () => SRInstance;
    webkitSpeechRecognition: new () => SRInstance;
  }
}

// ─── Typing config ─────────────────────────────────────────────────────────────
const TYPING_CHARS_PER_TICK = 3;  // chars revealed per tick
const TYPING_TICK_MS        = 16; // ms per tick (~60fps feel)

// ─── Typing Dots (thinking state) ─────────────────────────────────────────────
function Dots() {
  return (
    <span style={{ display: "inline-flex", gap: 5, alignItems: "center", padding: "2px 0" }}>
      {[0, 1, 2].map(i => (
        <span key={i} style={{
          width: 7, height: 7, borderRadius: "50%",
          background: "linear-gradient(135deg, #4f6ef7, #7c3aed)",
          display: "inline-block",
          animation: `zDots 1.3s ease-in-out ${i * 0.2}s infinite`,
        }} />
      ))}
    </span>
  );
}

// ─── Blinking cursor shown while typing ───────────────────────────────────────
function TypingCursor() {
  return (
    <span style={{
      display: "inline-block",
      width: 2, height: "1em",
      background: "#4f6ef7",
      marginLeft: 2,
      verticalAlign: "text-bottom",
      animation: "zCursorBlink 0.65s step-end infinite",
    }} />
  );
}

// ─── Bold + newline renderer ──────────────────────────────────────────────────
function RichText({ text, isTyping }: { text: string; isTyping?: boolean }) {
  return (
    <>
      {text.split("\n").map((line, i, a) => (
        <span key={i}>
          {line.split(/\*\*(.*?)\*\*/g).map((p, j) =>
            j % 2 === 1 ? <strong key={j}>{p}</strong> : p
          )}
          {i < a.length - 1 && <br />}
        </span>
      ))}
      {isTyping && <TypingCursor />}
    </>
  );
}

// ─── TTS Speaker Button ───────────────────────────────────────────────────────
function SpeakerBtn({ text }: { text: string }) {
  const [speaking, setSpeaking] = useState(false);

  const toggle = useCallback(() => {
    if (!window.speechSynthesis) return;

    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }

    // Clean markdown for speech
    const clean = text
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/\n/g, ". ");

    const utt = new SpeechSynthesisUtterance(clean);

    // Auto-detect lang
    const hindiWords = ["hai","kya","nahi","haan","mein","aur","kar","bol","yeh","woh","ko","ka","ki","ke","se","toh","bhi","agar","phir"];
    const hindiCount = hindiWords.filter(w => new RegExp(`\\b${w}\\b`, "i").test(clean)).length;
    utt.lang  = hindiCount >= 2 ? "hi-IN" : "en-IN";
    utt.rate  = 1.0;
    utt.pitch = 1.05;

    utt.onstart = () => setSpeaking(true);
    utt.onend   = () => setSpeaking(false);
    utt.onerror = () => setSpeaking(false);

    window.speechSynthesis.cancel(); // stop any previous
    window.speechSynthesis.speak(utt);
  }, [speaking, text]);

  useEffect(() => {
    return () => { if (speaking) window.speechSynthesis?.cancel(); };
  }, [speaking]);

  return (
    <button
      onClick={toggle}
      title={speaking ? "Stop speaking" : "Read aloud"}
      style={{
        background: speaking ? "rgba(79,110,247,0.15)" : "transparent",
        border: "none",
        borderRadius: 6,
        padding: "3px 5px",
        cursor: "pointer",
        color: speaking ? "#4f6ef7" : "rgba(255,255,255,0.25)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.18s",
        flexShrink: 0,
      }}
      onMouseEnter={e => { e.currentTarget.style.color = speaking ? "#4f6ef7" : "rgba(255,255,255,0.65)"; }}
      onMouseLeave={e => { e.currentTarget.style.color = speaking ? "#4f6ef7" : "rgba(255,255,255,0.25)"; }}
    >
      {speaking ? <VolumeX size={13} /> : <Volume2 size={13} />}
    </button>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function BuyzzeChat({ isOpen, onClose, isDesktop, isFloating = false }: Props) {
  const { user } = useUser();
  const [messages,   setMessages]   = useState<Msg[]>([]);
  const [input,      setInput]      = useState("");
  const [thinking,   setThinking]   = useState(false);
  const [listening,  setListening]  = useState(false);
  const [voiceOk,    setVoiceOk]    = useState(false);
  const [ttsOk,      setTtsOk]      = useState(false);
  const [voiceLang,  setVoiceLang]  = useState<"hi-IN" | "en-IN">("hi-IN");
  const [sessionId]                 = useState(() => `s_${Date.now()}`);

  const bottomRef  = useRef<HTMLDivElement>(null);
  const inputRef   = useRef<HTMLTextAreaElement>(null);
  const srRef      = useRef<SRInstance | null>(null);
  // Store interval refs keyed by message id so we can clear them
  const typingRefs = useRef<Record<string, ReturnType<typeof setInterval>>>({});

  // ── Feature detection ──
  useEffect(() => {
    setVoiceOk(!!(window.SpeechRecognition || window.webkitSpeechRecognition));
    setTtsOk(!!window.speechSynthesis);
  }, []);

  // ── Scroll to bottom ──
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  // ── Focus input on open ──
  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 400);
  }, [isOpen]);

  // ── Cleanup all typing intervals ──
  useEffect(() => {
    return () => { Object.values(typingRefs.current).forEach(clearInterval); };
  }, []);

  // ── Typing animation ──
  const startTyping = useCallback((msgId: string, fullText: string) => {
    let charIndex = 0;

    const tick = setInterval(() => {
      charIndex = Math.min(charIndex + TYPING_CHARS_PER_TICK, fullText.length);
      const done = charIndex >= fullText.length;

      setMessages(prev => prev.map(m =>
        m.id === msgId
          ? { ...m, displayed: fullText.slice(0, charIndex), isTyping: !done }
          : m
      ));

      if (done) {
        clearInterval(tick);
        delete typingRefs.current[msgId];
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    }, TYPING_TICK_MS);

    typingRefs.current[msgId] = tick;
  }, []);

  // ── Send message ──
  const send = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || thinking) return;

    setInput("");
    if (inputRef.current) inputRef.current.style.height = "auto";

    const userMsg: Msg = { id: genId(), role: "user", content: trimmed, time: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setThinking(true);

    try {
      const res  = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, userId: user?.id || "anon", sessionId }),
      });
      const data = await res.json();

      const fullText = data.response || "Kuch gadbad ho gayi. Dobara try karo!";
      const msgId    = genId();

      const aiMsg: Msg = {
        id: msgId, role: "ai", time: new Date(),
        content: fullText,
        displayed: "",     // empty — typing fills it char by char
        isTyping: true,
        products: data.products?.length > 0 ? data.products : undefined,
      };

      setMessages(prev => [...prev, aiMsg]);
      setThinking(false);

      // Small pause then start typing
      setTimeout(() => startTyping(msgId, fullText), 100);

    } catch {
      const msgId   = genId();
      const errText = "📶 Connection issue. Refresh karo!";
      setMessages(prev => [...prev, {
        id: msgId, role: "ai", time: new Date(),
        content: errText, displayed: "", isTyping: true,
      }]);
      setThinking(false);
      setTimeout(() => startTyping(msgId, errText), 100);
    }
  }, [thinking, user?.id, sessionId, startTyping]);

  // ── Voice input ──
  const toggleVoice = useCallback(() => {
    if (!voiceOk) return;
    if (listening) { srRef.current?.stop(); setListening(false); return; }

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SR();
    srRef.current = recognition;
    recognition.lang = voiceLang;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    recognition.onstart  = () => setListening(true);
    recognition.onresult = (e: SREvent) => {
      const transcript = e.results[e.resultIndex][0].transcript;
      setInput(transcript);
      if (inputRef.current) {
        inputRef.current.style.height = "auto";
        inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 100) + "px";
      }
    };
    recognition.onend   = () => {
      setListening(false);
      const v = inputRef.current?.value.trim();
      if (v) send(v);
    };
    recognition.onerror = () => setListening(false);
    recognition.start();
  }, [voiceOk, listening, voiceLang, send]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 100) + "px";
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); }
  };

  const formatTime = (d: Date) =>
    d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  // ── Greeting ──
  const h = new Date().getHours();
  const greeting    = h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : h < 21 ? "Good evening" : "Good night";
  const displayName = user?.firstName || "there";

  const suggestionChips = [
    { icon: Smartphone,  label: "Used iPhone" },
    { icon: IndianRupee, label: "Phone under 20k" },
    { icon: Tag,         label: "Best deal on BuYzze" },
    { icon: HelpCircle,  label: "Price negotiate tips" },
    { icon: Shield,      label: "Safe buying guide" },
  ];

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
      : { position: "fixed", bottom: 0, left: 0, right: 0, height: "94dvh",
          background: "#0a0a0f", zIndex: 9991,
          transform: isOpen ? "translateY(0)" : "translateY(100%)",
          transition: "transform 0.4s cubic-bezier(0.4,0,0.2,1)",
          borderRadius: "20px 20px 0 0", display: "flex", flexDirection: "column",
          overflow: "hidden", paddingBottom: "env(safe-area-inset-bottom, 0px)" };

  return (
    <>
      <style>{`
        @keyframes zSlideRight {
          from { opacity:0; transform:translateX(32px); }
          to   { opacity:1; transform:translateX(0); }
        }
        @keyframes zFadeUp {
          from { opacity:0; transform:translateY(8px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes zDots {
          0%,80%,100% { transform:translateY(0); opacity:0.3; }
          40%          { transform:translateY(-6px); opacity:1; }
        }
        @keyframes zPulseGreen {
          0%,100% { box-shadow:0 0 0 0 rgba(34,197,94,0.5); }
          50%     { box-shadow:0 0 0 5px rgba(34,197,94,0); }
        }
        @keyframes zCardIn {
          from { opacity:0; transform:translateY(12px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes zCursorBlink {
          0%,100% { opacity:1; }
          50%     { opacity:0; }
        }
        .z-msg           { animation: zFadeUp 0.2s ease forwards; }
        .z-glow-green    { animation: zPulseGreen 2s ease infinite; }
        .z-scrollbar-hide::-webkit-scrollbar { display:none; }
        .z-scrollbar-hide { -ms-overflow-style:none; scrollbar-width:none; }
        .z-product-card {
          animation: zCardIn 0.35s ease forwards; opacity:0;
          text-decoration:none; display:flex; align-items:center; gap:12px;
          background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08);
          border-radius:14px; padding:10px 12px; cursor:pointer;
          transition:all 0.2s ease;
        }
        .z-product-card:hover {
          border-color:rgba(79,110,247,0.5)!important;
          background:rgba(79,110,247,0.08)!important;
          transform:translateY(-2px);
          box-shadow:0 8px 24px rgba(79,110,247,0.2);
        }
      `}</style>

      {/* Mobile backdrop */}
      {!isDesktop && isOpen && (
        <div onClick={onClose} style={{
          position:"fixed", inset:0, background:"rgba(0,0,0,0.6)",
          backdropFilter:"blur(8px)", zIndex:9990,
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
          {voiceOk && (
            <button onClick={() => setVoiceLang(v => v === "hi-IN" ? "en-IN" : "hi-IN")} style={{
              background:"rgba(255,255,255,0.08)", border:"none", borderRadius:20,
              padding:"4px 10px", color:"#fff", fontSize:11, fontWeight:600,
              cursor:"pointer", marginRight:8, fontFamily:"inherit",
            }}>
              {voiceLang === "hi-IN" ? "HI" : "EN"}
            </button>
          )}
          <button onClick={onClose} style={{
            background:"rgba(255,255,255,0.08)", border:"none", borderRadius:8,
            padding:8, cursor:"pointer", color:"#fff",
            display:"flex", alignItems:"center", justifyContent:"center",
          }}>
            {isDesktop ? <X size={16} /> : <ChevronDown size={18} />}
          </button>
        </div>

        {/* ── Messages / Welcome ── */}
        <div className="z-scrollbar-hide" style={{
          flex:1, overflowY:"auto",
          padding: messages.length === 0 ? "0" : "20px 16px",
          display:"flex", flexDirection:"column",
        }}>

          {messages.length === 0 ? (
            /* ── Welcome Screen ── */
            <div style={{
              display:"flex", flexDirection:"column", alignItems:"center",
              justifyContent:"center", minHeight:"100%", padding:"20px 24px",
            }}>
              <div style={{ textAlign:"center", marginBottom:32, width:"100%" }}>
                <h1 style={{ fontSize:32, fontWeight:700, color:"#fff", marginBottom:8, letterSpacing:"-0.02em" }}>
                  {greeting},{" "}
                  <span style={{
                    background:"linear-gradient(135deg, #4f6ef7, #7c3aed)",
                    WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
                  }}>{displayName}</span>
                </h1>
                <p style={{ color:"rgba(255,255,255,0.6)", fontSize:16 }}>
                  How can I help you today?
                </p>
              </div>

              <div style={{
                background:"rgba(59,130,246,0.1)", border:"1px solid rgba(59,130,246,0.2)",
                borderRadius:12, padding:"12px 16px", marginBottom:32,
                width:"100%", maxWidth:320,
                display:"flex", alignItems:"center", justifyContent:"space-between",
              }}>
                <div>
                  <div style={{ fontSize:13, fontWeight:600, color:"#60a5fa" }}>Free plan</div>
                  <div style={{ fontSize:12, color:"rgba(255,255,255,0.5)" }}>You are out of free messages</div>
                </div>
                <button style={{
                  background:"linear-gradient(135deg, #4f6ef7, #7c3aed)", border:"none",
                  borderRadius:20, padding:"6px 12px", color:"#fff", fontSize:12, fontWeight:600, cursor:"pointer",
                }}>Upgrade</button>
              </div>

              <div style={{ width:"100%", maxWidth:480, marginBottom:32, position:"relative" }}>
                <textarea
                  ref={inputRef} value={input}
                  onChange={handleInputChange} onKeyDown={handleKeyDown}
                  placeholder="Message ZzE AI..." rows={1}
                  style={{
                    width:"100%", resize:"none", boxSizing:"border-box",
                    background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)",
                    borderRadius:24, padding:"14px 48px 14px 18px",
                    fontSize:14, fontFamily:"inherit", color:"#f0f0f5",
                    outline:"none", maxHeight:120, overflowY:"auto",
                  }}
                  onFocus={e => { e.currentTarget.style.borderColor="rgba(79,110,247,0.6)"; e.currentTarget.style.boxShadow="0 4px 16px rgba(79,110,247,0.2)"; }}
                  onBlur={e  => { e.currentTarget.style.borderColor="rgba(255,255,255,0.1)"; e.currentTarget.style.boxShadow="none"; }}
                />
                <button onClick={() => send(input)} disabled={!input.trim() || thinking} style={{
                  position:"absolute", right:8, bottom:8,
                  width:32, height:32, borderRadius:"50%", border:"none",
                  background: input.trim() && !thinking ? "linear-gradient(135deg, #4f6ef7, #7c3aed)" : "rgba(255,255,255,0.1)",
                  color: input.trim() && !thinking ? "#fff" : "rgba(255,255,255,0.3)",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  cursor: input.trim() && !thinking ? "pointer" : "default", transition:"all 0.2s",
                }}><Send size={14} /></button>
                {voiceOk && (
                  <button onClick={toggleVoice} style={{
                    position:"absolute", left:8, bottom:8,
                    width:32, height:32, borderRadius:"50%", border:"none",
                    background: listening ? "rgba(220,38,38,0.2)" : "transparent",
                    color: listening ? "#f87171" : "rgba(255,255,255,0.4)",
                    display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer",
                  }}>{listening ? <MicOff size={14} /> : <Mic size={14} />}</button>
                )}
              </div>

              <div style={{ display:"flex", flexWrap:"wrap", gap:8, justifyContent:"center", maxWidth:480 }}>
                {suggestionChips.map((chip, idx) => {
                  const Icon = chip.icon;
                  return (
                    <button key={idx} onClick={() => send(chip.label)} style={{
                      background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)",
                      borderRadius:40, padding:"8px 16px", display:"flex", alignItems:"center",
                      gap:8, cursor:"pointer", transition:"all 0.2s",
                      color:"rgba(255,255,255,0.9)", fontSize:13, fontWeight:500,
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background="rgba(79,110,247,0.15)"; e.currentTarget.style.borderColor="rgba(79,110,247,0.3)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background="rgba(255,255,255,0.05)"; e.currentTarget.style.borderColor="rgba(255,255,255,0.1)"; }}
                    >
                      <Icon size={14} color="#60a5fa" />
                      <span>{chip.label}</span>
                    </button>
                  );
                })}
              </div>

              {listening && (
                <div style={{
                  marginTop:20, display:"flex", alignItems:"center", gap:8,
                  padding:"8px 16px", background:"rgba(220,38,38,0.1)", borderRadius:40,
                }}>
                  <div style={{ width:8, height:8, borderRadius:"50%", background:"#dc2626", animation:"zPulseGreen 1s ease infinite" }} />
                  <span style={{ fontSize:12, color:"#f87171" }}>
                    {voiceLang === "hi-IN" ? "सुन रहा हूँ..." : "Listening..."}
                  </span>
                </div>
              )}
            </div>

          ) : (
            /* ── Chat Messages ── */
            <>
              {messages.map(msg => {
                // AI messages use `displayed` (typed so far); user messages use full content
                const shownText = msg.role === "ai"
                  ? (msg.displayed ?? msg.content)
                  : msg.content;

                return (
                  <div key={msg.id}>
                    <div className="z-msg" style={{
                      display:"flex",
                      justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                      alignItems:"flex-end", gap:8, marginBottom:4,
                    }}>
                      {msg.role === "ai" && (
                        <div style={{
                          width:28, height:28, borderRadius:"50%",
                          background:"linear-gradient(135deg, #4f6ef7, #7c3aed)",
                          display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0,
                        }}><Bot size={14} color="white" /></div>
                      )}

                      <div style={{
                        maxWidth:"78%",
                        padding: msg.role === "user" ? "10px 14px" : "12px 16px",
                        borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                        background: msg.role === "user"
                          ? "linear-gradient(135deg, #4f6ef7, #5b5fc7)"
                          : "#16161e",
                        border: msg.role === "ai" ? "1px solid rgba(255,255,255,0.08)" : "none",
                        color:"#f0f0f5", fontSize:13.5, lineHeight:1.6,
                        boxShadow: msg.role === "user"
                          ? "0 4px 12px rgba(79,110,247,0.3)"
                          : "0 4px 12px rgba(0,0,0,0.3)",
                      }}>
                        {/* Message text with typing cursor */}
                        <RichText text={shownText} isTyping={msg.isTyping} />

                        {/* Footer: timestamp + speaker — only after typing done */}
                        {msg.role === "ai" && !msg.isTyping && (
                          <div style={{
                            display:"flex", alignItems:"center",
                            justifyContent:"space-between", marginTop:6, gap:4,
                          }}>
                            <span style={{ fontSize:9, color:"rgba(255,255,255,0.2)" }}>
                              {formatTime(msg.time)}
                            </span>
                            {ttsOk && <SpeakerBtn text={msg.content} />}
                          </div>
                        )}

                        {msg.role === "user" && (
                          <div style={{ fontSize:9, color:"rgba(255,255,255,0.3)", marginTop:4, textAlign:"right" }}>
                            {formatTime(msg.time)}
                          </div>
                        )}
                      </div>

                      {msg.role === "user" && (
                        <div style={{
                          width:28, height:28, borderRadius:"50%",
                          background:"#1e1e24", border:"1px solid rgba(255,255,255,0.1)",
                          display:"flex", alignItems:"center", justifyContent:"center",
                          flexShrink:0, fontSize:12, fontWeight:600, color:"#fff",
                        }}>
                          {user?.firstName?.[0]?.toUpperCase() || "U"}
                        </div>
                      )}
                    </div>

                    {/* ── Product Cards (appear after typing finishes) ── */}
                    {msg.role === "ai" && !msg.isTyping && msg.products && msg.products.length > 0 && (
                      <div style={{ paddingLeft:36, marginTop:6, marginBottom:12 }}>
                        <div style={{
                          fontSize:11, color:"rgba(255,255,255,0.3)", fontWeight:600,
                          letterSpacing:"0.06em", textTransform:"uppercase", marginBottom:8,
                        }}>
                          {msg.products.length} listing{msg.products.length > 1 ? "s" : ""} found
                        </div>
                        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                          {msg.products.map((p, idx) => (
                            <a
                              key={p.id}
                              href={`/product/${p.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="z-product-card"
                              style={{ animationDelay:`${idx * 100}ms` }}
                            >
                              <div style={{
                                width:52, height:52, borderRadius:10, overflow:"hidden",
                                flexShrink:0, background:"rgba(255,255,255,0.06)",
                                display:"flex", alignItems:"center", justifyContent:"center",
                              }}>
                                {p.images?.[0] ? (
                                  <img src={p.images[0]} alt={p.title}
                                    style={{ width:"100%", height:"100%", objectFit:"cover" }}
                                    onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                                  />
                                ) : (
                                  <Smartphone size={22} color="rgba(255,255,255,0.25)" />
                                )}
                              </div>
                              <div style={{ flex:1, minWidth:0 }}>
                                <div style={{
                                  fontSize:13, fontWeight:600, color:"#f0f0f5",
                                  whiteSpace:"nowrap", overflow:"hidden",
                                  textOverflow:"ellipsis", lineHeight:1.3,
                                }}>{p.title}</div>
                                <div style={{
                                  fontSize:11, color:"rgba(255,255,255,0.35)",
                                  marginTop:3, display:"flex", alignItems:"center", gap:4,
                                }}><span>📍</span>{p.city}</div>
                              </div>
                              <div style={{ flexShrink:0, textAlign:"right" }}>
                                <div style={{
                                  fontSize:14, fontWeight:700,
                                  background:"linear-gradient(135deg, #4f6ef7, #7c3aed)",
                                  WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
                                  letterSpacing:"-0.3px",
                                }}>₹{p.price.toLocaleString("en-IN")}</div>
                                <div style={{ fontSize:10, color:"rgba(255,255,255,0.25)", marginTop:2 }}>View →</div>
                              </div>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Thinking dots */}
              {thinking && (
                <div className="z-msg" style={{ display:"flex", alignItems:"flex-end", gap:8 }}>
                  <div style={{
                    width:28, height:28, borderRadius:"50%",
                    background:"linear-gradient(135deg, #4f6ef7, #7c3aed)",
                    display:"flex", alignItems:"center", justifyContent:"center",
                  }}><Bot size={14} color="white" /></div>
                  <div style={{
                    background:"#16161e", border:"1px solid rgba(255,255,255,0.08)",
                    borderRadius:"18px 18px 18px 4px", padding:"12px 18px",
                  }}><Dots /></div>
                </div>
              )}
              <div ref={bottomRef} />
            </>
          )}
        </div>

        {/* ── Bottom input (chat mode only) ── */}
        {messages.length > 0 && (
          <div style={{
            background:"rgba(10,10,15,0.95)",
            borderTop:"1px solid rgba(255,255,255,0.06)",
            padding:"14px 16px",
          }}>
            {listening && (
              <div style={{
                display:"flex", alignItems:"center", gap:8, marginBottom:10,
                padding:"8px 14px", background:"rgba(220,38,38,0.15)",
                borderRadius:30, border:"1px solid rgba(220,38,38,0.3)",
              }}>
                <div style={{
                  width:8, height:8, borderRadius:"50%", background:"#dc2626",
                  animation:"zPulseGreen 1s ease infinite",
                }} />
                <span style={{ fontSize:12, color:"#f87171", fontWeight:600 }}>
                  {voiceLang === "hi-IN" ? "Hindi mein sun raha hoon..." : "Listening in English..."}
                </span>
              </div>
            )}
            <div style={{ display:"flex", alignItems:"flex-end", gap:10 }}>
              <textarea
                ref={inputRef} value={input}
                onChange={handleInputChange} onKeyDown={handleKeyDown}
                placeholder="Kuch bhi poochho..." rows={1}
                style={{
                  flex:1, resize:"none",
                  background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)",
                  borderRadius:14, padding:"12px 14px",
                  fontSize:13.5, fontFamily:"inherit", color:"#f0f0f5",
                  outline:"none", maxHeight:100, overflowY:"auto",
                }}
                onFocus={e => { e.currentTarget.style.borderColor="rgba(79,110,247,0.6)"; e.currentTarget.style.boxShadow="0 0 0 3px rgba(79,110,247,0.15)"; }}
                onBlur={e  => { e.currentTarget.style.borderColor="rgba(255,255,255,0.1)"; e.currentTarget.style.boxShadow="none"; }}
              />
              {voiceOk && (
                <button onClick={toggleVoice} style={{
                  width:43, height:43, borderRadius:12, border:"none",
                  background: listening ? "linear-gradient(135deg, #dc2626, #b91c1c)" : "rgba(255,255,255,0.07)",
                  color: listening ? "#fff" : "rgba(255,255,255,0.5)",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  cursor:"pointer", transition:"all 0.15s",
                }}>{listening ? <MicOff size={18} /> : <Mic size={18} />}</button>
              )}
              <button
                onClick={() => send(input)} disabled={!input.trim() || thinking}
                style={{
                  width:43, height:43, borderRadius:12, border:"none",
                  background:"linear-gradient(135deg, #4f6ef7, #7c3aed)",
                  color:"#fff", display:"flex", alignItems:"center", justifyContent:"center",
                  cursor: input.trim() && !thinking ? "pointer" : "default",
                  opacity: input.trim() && !thinking ? 1 : 0.35,
                  transition:"transform 0.15s, opacity 0.15s",
                  transform: input.trim() && !thinking ? "scale(1)" : "scale(0.95)",
                }}
              ><Send size={18} /></button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
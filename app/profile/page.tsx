"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useBuyzzeAuth } from "@/hooks/useBuyzzeAuth"; 
import { supabase } from "@/lib/supabaseClient";
import { getDashboardData } from "@/features/dashboard/services/dashboard.service";
import {
  LogOut, Package, Heart, MessageCircle, ShieldCheck,
  ChevronRight, Phone, Calendar, Mail, User,
  ArrowUpRight, Plus, HelpCircle, Flag, ArrowLeft, X
} from "lucide-react";
import { motion } from "framer-motion";

// 🔥 NAYA FIREBASE OTP IMPORT (WhatsApp hata diya)
import { PhoneVerification } from "@/components/PhoneVerification";
import VerifiedBadge from "@/components/VerifiedBadge";
import { ref, onValue } from "firebase/database";
import { database } from "@/lib/firebase";
import { useRouter } from "next/navigation";

type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  created_at?: string;
  is_phone_verified?: boolean;
  verified_phone?: string;
};

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0, transition: { delay, duration: 0.35, ease: [0.4, 0, 0.2, 1] } },
});

export default function ProfilePage() {
  const { user, isLoaded, logout } = useBuyzzeAuth(); 
  const router = useRouter();

  const [profile, setProfile]                 = useState<Profile | null>(null);
  const [totalProducts, setTotalProducts]     = useState(0);
  const [wishlistCount, setWishlistCount]     = useState(0);
  const [loading, setLoading]                 = useState(true);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [sellerUnread, setSellerUnread]       = useState(0);
  const [buyerUnread, setBuyerUnread]         = useState(0);
  const [isDark, setIsDark]                   = useState(false);

  // dark mode detect
  useEffect(() => {
    const check = () => setIsDark(document.documentElement.classList.contains("dark"));
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  const loadData = async () => {
    if (!user) return;
    try {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("id, full_name, email, created_at, is_phone_verified, verified_phone")
        .eq("id", user.id)
        .maybeSingle();
      if (profileData) setProfile(profileData);

      const dashboard = await getDashboardData(user.id);
      if (dashboard) setTotalProducts(dashboard.totalProducts || 0);

      const favRes  = await fetch("/api/favorites");
      const favData = await favRes.json();
      if (favData.success) setWishlistCount(favData.favorites?.length || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoaded && user) loadData();
  }, [user, isLoaded]);

  // firebase unread
  useEffect(() => {
    if (!user) return;
    const uid = user.id;
    const unsub = onValue(ref(database, "chats"), (snap) => {
      const data = snap.val();
      if (!data) { setSellerUnread(0); setBuyerUnread(0); return; }
      let selling = 0, buying = 0;
      Object.values<any>(data).forEach((chat) => {
        if (chat.sellerId === uid) selling += chat?.unread?.seller || 0;
        else if (chat.buyerId === uid) buying += chat?.unread?.buyer || 0;
      });
      setSellerUnread(selling);
      setBuyerUnread(buying);
    });
    return () => unsub();
  }, [user]);

  const handleLogout = async () => {
    await logout(); 
  };

  if (!isLoaded || loading) {
    return (
      <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: isDark ? "#0a0a0a" : "#f1f5f9" }}>
        <div style={{ width: 36, height: 36, borderRadius: "50%", border: "3px solid rgba(100,116,139,0.2)", borderTopColor: "#2563eb", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: isDark ? "#0a0a0a" : "#f1f5f9" }}>
        <p style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#64748b", fontSize: 14 }}>
          Please <Link href="/login" style={{ color: isDark ? "#fff" : "#0f172a", fontWeight: 700 }}>login</Link> first.
        </p>
      </div>
    );
  }

  const displayName  = profile?.full_name || user.full_name || "User";
  const displayEmail = profile?.email || user.email || "";
  const avatarLetter = displayName.charAt(0).toUpperCase();
  const joinedDate   = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-IN", { month: "short", year: "numeric" })
    : "Recently";
  const isVerified   = profile?.is_phone_verified || false;

  const bg      = isDark ? "#0a0a0a"                 : "#f1f5f9";
  const cardBg  = isDark ? "#111111"                 : "#ffffff";
  const bdr     = isDark ? "rgba(255,255,255,0.08)"  : "#e5e7eb";
  const txt     = isDark ? "#ffffff"                 : "#0f172a";
  const sub     = isDark ? "rgba(255,255,255,0.35)"  : "#64748b";
  const sub2    = isDark ? "rgba(255,255,255,0.25)"  : "#94a3b8";
  const divider = isDark ? "rgba(255,255,255,0.04)"  : "#f1f5f9";
  const divH    = isDark ? "rgba(255,255,255,0.06)"  : "#e5e7eb";
  const iconBg  = isDark ? "rgba(255,255,255,0.05)"  : "#f1f5f9";
  const iconClr = isDark ? "rgba(255,255,255,0.4)"   : "#64748b";
  const hov     = isDark ? "rgba(255,255,255,0.03)"  : "#f8fafc";
  const statBg  = isDark ? "#111111"                 : "#f8fafc";
  const statSep = isDark ? "rgba(255,255,255,0.06)"  : "#e5e7eb";
  const F       = "'Roboto', system-ui, sans-serif";

  return (
    <>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @media(min-width:768px){
          .pf-wrap{max-width:900px!important}
          .pf-grid{display:grid!important;grid-template-columns:320px 1fr;gap:20px;align-items:start}
          .pf-mobile-header{display:none!important}
        }
      `}</style>

      <div style={{ minHeight: "100vh", background: bg, color: txt, fontFamily: F, paddingBottom: 120 }}>

        <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 300, background: isDark ? "radial-gradient(ellipse at 50% -20%,rgba(255,255,255,0.04) 0%,transparent 70%)" : "radial-gradient(ellipse at 50% -20%,rgba(37,99,235,0.06) 0%,transparent 70%)", pointerEvents: "none", zIndex: 0 }} />

        <div className="pf-mobile-header" style={{ position: "sticky", top: 0, zIndex: 50, background: isDark ? "rgba(10,10,10,0.92)" : "rgba(241,245,249,0.92)", backdropFilter: "blur(12px)", borderBottom: `1px solid ${bdr}`, padding: "10px 16px", display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={() => router.back()} style={{ width: 36, height: 36, borderRadius: "50%", background: iconBg, border: `1px solid ${bdr}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <ArrowLeft size={16} color={txt} />
          </button>
          <p style={{ flex: 1, fontSize: 14, fontWeight: 700, color: txt, margin: 0 }}>Profile</p>
        </div>

        <div className="pf-wrap" style={{ maxWidth: 520, margin: "0 auto", padding: "24px 16px 0", position: "relative", zIndex: 1 }}>

          <div style={{ display: "none" }} className="pf-pc-back">
            <style>{`@media(min-width:768px){.pf-pc-back{display:flex!important;align-items:center;gap:8px;marginBottom:16px}}`}</style>
            <button onClick={() => router.back()} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", color: sub, fontSize: 13, fontWeight: 600, padding: "0 0 16px" }}>
              <ArrowLeft size={15} /> Back
            </button>
          </div>

          <div className="pf-grid" style={{ display: "block" }}>

            {/* ══ LEFT ══ */}
            <div>
              {/* HERO CARD */}
              <motion.div {...fade(0)} style={{ background: cardBg, border: `1px solid ${bdr}`, borderRadius: 28, padding: "32px 24px 24px", marginBottom: 12, position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, right: 0, width: 200, height: 200, background: isDark ? "radial-gradient(circle at top right,rgba(255,255,255,0.03) 0%,transparent 60%)" : "radial-gradient(circle at top right,rgba(37,99,235,0.05) 0%,transparent 60%)", pointerEvents: "none" }} />

                <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 24 }}>
                  <div style={{ width: 64, height: 64, borderRadius: 20, background: isDark ? "linear-gradient(135deg,#1a1a1a,#2a2a2a)" : "linear-gradient(135deg,#dbeafe,#eff6ff)", border: `1px solid ${bdr}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, fontWeight: 900, color: isDark ? "#fff" : "#1d4ed8", flexShrink: 0, letterSpacing: "-1px", boxShadow: isDark ? "0 8px 24px rgba(0,0,0,0.4)" : "0 4px 16px rgba(37,99,235,0.1)" }}>
                    {avatarLetter}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 4 }}>
                      <h1 style={{ fontSize: 20, fontWeight: 900, color: txt, margin: 0, letterSpacing: "-0.5px" }}>{displayName}</h1>
                      {isVerified && (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="12" fill="#1877F2"/>
                          <path d="M17.5 8.5l-6.5 6.5-3-3" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                      {isVerified && <VerifiedBadge size="sm" />}
                    </div>
                    <p style={{ fontSize: 12, color: sub, margin: "0 0 10px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{displayEmail}</p>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <Calendar size={11} color={sub2} />
                      <span style={{ fontSize: 11, color: sub2 }}>Joined {joinedDate}</span>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1, background: statSep, borderRadius: 16, overflow: "hidden" }}>
                  {[
                    { value: totalProducts,           label: "Listings" },
                    { value: wishlistCount,            label: "Wishlist" },
                    { value: isVerified ? "✓" : "—",  label: "Verified" },
                  ].map(({ value, label }) => (
                    <div key={label} style={{ background: statBg, padding: "14px 8px", textAlign: "center" }}>
                      <p style={{ fontSize: 20, fontWeight: 900, color: txt, margin: "0 0 3px", letterSpacing: "-0.5px" }}>{value}</p>
                      <p style={{ fontSize: 9, fontWeight: 700, color: sub2, textTransform: "uppercase", letterSpacing: "0.1em", margin: 0 }}>{label}</p>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* VERIFICATION BANNER — only if not verified */}
              {!isVerified && (
                <motion.div {...fade(0.05)}>
                  <button onClick={() => setShowVerifyModal(true)} style={{ width: "100%", marginBottom: 12, background: "linear-gradient(135deg,rgba(14,165,233,0.12),rgba(37,99,235,0.12))", border: "1px solid rgba(14,165,233,0.25)", borderRadius: 18, padding: "16px 20px", display: "flex", alignItems: "center", gap: 14, cursor: "pointer", textAlign: "left" }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, flexShrink: 0, background: "rgba(14,165,233,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <ShieldCheck size={18} color="#38bdf8" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 13, fontWeight: 800, color: txt, margin: "0 0 2px" }}>Get Verified Badge</p>
                      <p style={{ fontSize: 11, color: sub, margin: 0 }}>Verify your phone number to build trust with buyers</p>
                    </div>
                    <ArrowUpRight size={16} color={sub} />
                  </button>
                </motion.div>
              )}

              {/* ACCOUNT INFO */}
              <motion.div {...fade(0.1)} style={{ background: cardBg, border: `1px solid ${bdr}`, borderRadius: 22, overflow: "hidden", marginBottom: 12 }}>
                <div style={{ padding: "14px 20px", borderBottom: `1px solid ${divH}` }}>
                  <p style={{ fontSize: 10, fontWeight: 800, color: sub2, textTransform: "uppercase", letterSpacing: "0.12em", margin: 0 }}>Account Info</p>
                </div>
                {[
                  { icon: User,  label: "Full Name", value: displayName  },
                  { icon: Mail,  label: "Email",     value: displayEmail },
                  { icon: Phone, label: "Phone",     value: isVerified ? (profile?.verified_phone || "Verified") : "Not verified" },
                ].map(({ icon: Icon, label, value }, i) => (
                  <div key={label} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 20px", borderBottom: i < 2 ? `1px solid ${divider}` : "none" }}>
                    <div style={{ width: 34, height: 34, borderRadius: 10, flexShrink: 0, background: iconBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Icon size={14} color={iconClr} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 10, fontWeight: 700, color: sub2, textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 2px" }}>{label}</p>
                      <p style={{ fontSize: 13, fontWeight: 600, color: txt, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{value}</p>
                    </div>
                    {label === "Phone" && isVerified && (
                      <div style={{ display: "flex", alignItems: "center", gap: 4, background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)", borderRadius: 20, padding: "3px 10px", flexShrink: 0 }}>
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="3"><polyline points="20,6 9,17 4,12"/></svg>
                        <span style={{ fontSize: 10, fontWeight: 700, color: "#16a34a" }}>Verified</span>
                      </div>
                    )}
                    {label === "Phone" && !isVerified && (
                      <button onClick={() => setShowVerifyModal(true)} style={{ fontSize: 10, fontWeight: 700, color: "#38bdf8", background: "rgba(14,165,233,0.1)", border: "1px solid rgba(14,165,233,0.2)", borderRadius: 6, padding: "4px 8px", cursor: "pointer" }}>
                        Verify
                      </button>
                    )}
                  </div>
                ))}
              </motion.div>
            </div>

            {/* ══ RIGHT ══ */}
            <div>
              {/* QUICK ACTIONS */}
              <motion.div {...fade(0.15)} style={{ background: cardBg, border: `1px solid ${bdr}`, borderRadius: 22, overflow: "hidden", marginBottom: 12 }}>
                <div style={{ padding: "14px 20px", borderBottom: `1px solid ${divH}` }}>
                  <p style={{ fontSize: 10, fontWeight: 800, color: sub2, textTransform: "uppercase", letterSpacing: "0.12em", margin: 0 }}>Quick Actions</p>
                </div>

                {[
                  { icon: Package,       label: "My Listings",  sub: `${totalProducts} active`,      href: "/dashboard" },
                  { icon: Heart,         label: "My Wishlist",  sub: `${wishlistCount} saved items`,  href: "/wishlist"  },
                  { icon: Plus,          label: "Sell a Device",sub: "List your phone for free",      href: "/sell"      },
                ].map(({ icon: Icon, label, sub: s, href }, i) => (
                  <Link key={label} href={href} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 20px", textDecoration: "none", borderBottom: `1px solid ${divider}`, transition: "background 0.15s" }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = hov}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
                  >
                    <div style={{ width: 34, height: 34, borderRadius: 10, flexShrink: 0, background: iconBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Icon size={15} color={iconClr} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: txt, margin: "0 0 2px" }}>{label}</p>
                      <p style={{ fontSize: 11, color: sub, margin: 0 }}>{s}</p>
                    </div>
                    <ChevronRight size={14} color={sub2} />
                  </Link>
                ))}

                <Link href="/chat" style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 20px", textDecoration: "none", transition: "background 0.15s" }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = hov}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
                >
                  <div style={{ width: 34, height: 34, borderRadius: 10, flexShrink: 0, background: iconBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <MessageCircle size={15} color={iconClr} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: txt, margin: "0 0 2px" }}>My Chats</p>
                    <p style={{ fontSize: 11, color: sub, margin: 0 }}>
                      {sellerUnread + buyerUnread > 0
                        ? `${sellerUnread + buyerUnread} unread message${sellerUnread + buyerUnread > 1 ? "s" : ""}`
                        : "View all conversations"}
                    </p>
                  </div>
                  {sellerUnread > 0 && (
                    <div style={{ minWidth: 22, height: 22, borderRadius: 11, background: "#16a34a", color: "#fff", fontSize: 11, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 6px", flexShrink: 0 }}>
                      {sellerUnread}
                    </div>
                  )}
                  {buyerUnread > 0 && (
                    <div style={{ minWidth: 22, height: 22, borderRadius: 11, background: "#2563eb", color: "#fff", fontSize: 11, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 6px", flexShrink: 0 }}>
                      {buyerUnread}
                    </div>
                  )}
                  <ChevronRight size={14} color={sub2} />
                </Link>
              </motion.div>

              {/* SUPPORT + REPORT */}
              <motion.div {...fade(0.2)} style={{ background: cardBg, border: `1px solid ${bdr}`, borderRadius: 22, overflow: "hidden", marginBottom: 12 }}>
                <div style={{ padding: "14px 20px", borderBottom: `1px solid ${divH}` }}>
                  <p style={{ fontSize: 10, fontWeight: 800, color: sub2, textTransform: "uppercase", letterSpacing: "0.12em", margin: 0 }}>Help</p>
                </div>
                <Link href="/support" style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 20px", textDecoration: "none", borderBottom: `1px solid ${divider}`, transition: "background 0.15s" }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = hov}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
                >
                  <div style={{ width: 34, height: 34, borderRadius: 10, flexShrink: 0, background: iconBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <HelpCircle size={15} color={iconClr} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: txt, margin: "0 0 2px" }}>Support</p>
                    <p style={{ fontSize: 11, color: sub, margin: 0 }}>Help center & contact us</p>
                  </div>
                  <ChevronRight size={14} color={sub2} />
                </Link>
                <Link href="/report" style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 20px", textDecoration: "none", transition: "background 0.15s" }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = hov}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
                >
                  <div style={{ width: 34, height: 34, borderRadius: 10, flexShrink: 0, background: "rgba(239,68,68,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Flag size={15} color="#ef4444" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: txt, margin: "0 0 2px" }}>Report a Problem</p>
                    <p style={{ fontSize: 11, color: sub, margin: 0 }}>Report fraud, abuse or issues</p>
                  </div>
                  <ChevronRight size={14} color={sub2} />
                </Link>
              </motion.div>

              {/* LEGAL */}
              <motion.div {...fade(0.22)} style={{ background: cardBg, border: `1px solid ${bdr}`, borderRadius: 22, overflow: "hidden", marginBottom: 12 }}>
                <div style={{ padding: "14px 20px", borderBottom: `1px solid ${divH}` }}>
                  <p style={{ fontSize: 10, fontWeight: 800, color: sub2, textTransform: "uppercase", letterSpacing: "0.12em", margin: 0 }}>Legal</p>
                </div>
                {[
                  { label: "Privacy Policy",     href: "/privacy"    },
                  { label: "Terms & Conditions", href: "/terms"      },
                  { label: "Disclaimer",         href: "/disclaimer" },
                ].map(({ label, href }, i, arr) => (
                  <Link key={label} href={href} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 20px", textDecoration: "none", borderBottom: i < arr.length - 1 ? `1px solid ${divider}` : "none" }}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: sub }}>{label}</span>
                    <ChevronRight size={13} color={sub2} />
                  </Link>
                ))}
              </motion.div>

              {/* LOGOUT */}
              <motion.button
                {...fade(0.25)}
                whileTap={{ scale: 0.98 }}
                onClick={handleLogout}
                style={{ width: "100%", padding: "15px", background: "transparent", border: `1px solid ${bdr}`, borderRadius: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, color: sub, fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", transition: "all 0.2s", fontFamily: F }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(239,68,68,0.3)"; (e.currentTarget as HTMLElement).style.color = "#ef4444"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = bdr; (e.currentTarget as HTMLElement).style.color = sub; }}
              >
                <LogOut size={14} />
                Logout
              </motion.button>

            </div>
          </div>
        </div>

        {/* 🔥 NAYA TRUECALLER VERIFICATION MODAL */}
        {showVerifyModal && user && (
          <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
            <div style={{ position: "relative", width: "100%", maxWidth: 400 }}>
              {/* Close Button */}
              <button 
                onClick={() => setShowVerifyModal(false)} 
                style={{ position: "absolute", top: 12, right: 12, background: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)", border: "none", cursor: "pointer", zIndex: 10, color: txt, padding: 6, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                <X size={18} />
              </button>
              
              {/* The Truecaller Verification Component */}
              <PhoneVerification 
                onVerified={() => {
                  setShowVerifyModal(false);
                  loadData(); // Re-fetch user data to show green verified badge!
                }} 
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Mail, MessageCircle, FileText, ShieldCheck, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";

const faqs = [
  {
    q: "How do I list my phone for sale?",
    a: "Go to the Sell page from the home screen, fill in your phone details, upload clear photos, set your price, and submit. Your listing will be live within minutes.",
  },
  {
    q: "Is Buyzze free to use?",
    a: "Yes, listing and browsing on Buyzze is completely free. We do not charge any commission on sales.",
  },
  {
    q: "How do I contact a seller?",
    a: "Open any product listing and tap the 'Chat with Seller' button. You can directly message the seller through our secure in-app chat.",
  },
  {
    q: "How do I get a Verified Badge?",
    a: "Go to your Profile page and tap 'Get Verified Badge'. Verify your phone number via OTP and your badge will appear instantly.",
  },
  {
    q: "What should I do if I face a fraudulent seller?",
    a: "Do not make any payment outside the platform. Use the 'Report a Problem' option in your profile to report the issue to our team immediately.",
  },
  {
    q: "How do I delete my listing?",
    a: "Go to My Listings from your profile, open the listing you want to remove, and select Delete. The listing will be removed immediately.",
  },
  {
    q: "Can I edit my listing after posting?",
    a: "Yes, you can edit your listing anytime. Go to My Listings, open the listing, and tap the Edit button to update details, photos, or price.",
  },
];

export default function SupportPage() {
  const router = useRouter();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const check = () => setIsDark(document.documentElement.classList.contains("dark"));
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  const bg     = isDark ? "#0a0a0a"                 : "#f1f5f9";
  const card   = isDark ? "#111111"                 : "#ffffff";
  const bdr    = isDark ? "rgba(255,255,255,0.08)"  : "#e5e7eb";
  const txt    = isDark ? "#ffffff"                 : "#0f172a";
  const sub    = isDark ? "rgba(255,255,255,0.4)"   : "#64748b";
  const sub2   = isDark ? "rgba(255,255,255,0.2)"   : "#94a3b8";
  const divH   = isDark ? "rgba(255,255,255,0.06)"  : "#e5e7eb";
  const divider= isDark ? "rgba(255,255,255,0.04)"  : "#f1f5f9";
  const hov    = isDark ? "rgba(255,255,255,0.03)"  : "#f8fafc";
  const F      = "'Roboto', system-ui, sans-serif";

  return (
    <div style={{ minHeight: "100vh", background: bg, color: txt, fontFamily: F, paddingBottom: 80 }}>

      {/* Header */}
      <div style={{ position: "sticky", top: 0, zIndex: 50, background: isDark ? "rgba(10,10,10,0.92)" : "rgba(241,245,249,0.92)", backdropFilter: "blur(12px)", borderBottom: `1px solid ${bdr}`, padding: "10px 16px", display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={() => router.back()} style={{ width: 36, height: 36, borderRadius: "50%", background: isDark ? "rgba(255,255,255,0.06)" : "#f1f5f9", border: `1px solid ${bdr}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <ArrowLeft size={16} color={txt} />
        </button>
        <p style={{ fontSize: 15, fontWeight: 700, color: txt, margin: 0 }}>Support</p>
      </div>

      <div style={{ maxWidth: 620, margin: "0 auto", padding: "24px 16px" }}>

        {/* Hero */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ width: 56, height: 56, borderRadius: 18, background: "rgba(37,99,235,0.1)", border: "1px solid rgba(37,99,235,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <MessageCircle size={24} color="#2563eb" />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: txt, margin: "0 0 8px", letterSpacing: "-0.5px" }}>How can we help?</h1>
          <p style={{ fontSize: 14, color: sub, margin: 0 }}>Find answers to common questions or reach out to our team.</p>
        </div>

        {/* Contact cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 28 }}>
          <a href="mailto:support@buyzze.in" style={{ background: card, border: `1px solid ${bdr}`, borderRadius: 18, padding: "18px 16px", textDecoration: "none", display: "flex", flexDirection: "column", gap: 8, transition: "box-shadow 0.15s" }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow = "none"}
          >
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(37,99,235,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Mail size={16} color="#2563eb" />
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: txt, margin: "0 0 3px" }}>Email Us</p>
              <p style={{ fontSize: 11, color: sub, margin: 0 }}>support@buyzze.in</p>
            </div>
          </a>

          <a href="/report" style={{ background: card, border: `1px solid ${bdr}`, borderRadius: 18, padding: "18px 16px", textDecoration: "none", display: "flex", flexDirection: "column", gap: 8, transition: "box-shadow 0.15s" }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow = "none"}
          >
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(239,68,68,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <AlertTriangle size={16} color="#ef4444" />
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: txt, margin: "0 0 3px" }}>Report Issue</p>
              <p style={{ fontSize: 11, color: sub, margin: 0 }}>Fraud or abuse</p>
            </div>
          </a>
        </div>

        {/* Safety tips */}
        <div style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.18)", borderRadius: 18, padding: "16px 20px", marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <ShieldCheck size={16} color="#f59e0b" />
            <p style={{ fontSize: 12, fontWeight: 800, color: "#f59e0b", textTransform: "uppercase", letterSpacing: "0.1em", margin: 0 }}>Safety Tips</p>
          </div>
          {[
            "Always meet in a public place to exchange goods.",
            "Never share OTPs, bank details, or passwords with anyone.",
            "Do not pay in advance — inspect the device before paying.",
            "Verify the IMEI number before purchasing any phone.",
            "Report suspicious users or listings immediately.",
          ].map((tip, i) => (
            <div key={i} style={{ display: "flex", gap: 10, marginBottom: i < 4 ? 8 : 0 }}>
              <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#f59e0b", flexShrink: 0, marginTop: 7 }} />
              <p style={{ fontSize: 12, color: sub, margin: 0, lineHeight: 1.65 }}>{tip}</p>
            </div>
          ))}
        </div>

        {/* FAQs */}
        <div style={{ background: card, border: `1px solid ${bdr}`, borderRadius: 22, overflow: "hidden", marginBottom: 24 }}>
          <div style={{ padding: "14px 20px", borderBottom: `1px solid ${divH}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <FileText size={14} color={sub} />
              <p style={{ fontSize: 10, fontWeight: 800, color: sub2, textTransform: "uppercase", letterSpacing: "0.12em", margin: 0 }}>Frequently Asked Questions</p>
            </div>
          </div>
          {faqs.map((faq, i) => (
            <div key={i} style={{ borderBottom: i < faqs.length - 1 ? `1px solid ${divider}` : "none" }}>
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                style={{ width: "100%", padding: "15px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, background: "transparent", border: "none", cursor: "pointer", textAlign: "left", transition: "background 0.15s" }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = hov}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
              >
                <span style={{ fontSize: 13, fontWeight: 600, color: txt, lineHeight: 1.4, flex: 1 }}>{faq.q}</span>
                {openIndex === i
                  ? <ChevronUp size={15} color={sub} style={{ flexShrink: 0 }} />
                  : <ChevronDown size={15} color={sub} style={{ flexShrink: 0 }} />}
              </button>
              {openIndex === i && (
                <div style={{ padding: "0 20px 16px", background: isDark ? "rgba(255,255,255,0.02)" : "#fafafa" }}>
                  <p style={{ fontSize: 13, color: sub, margin: 0, lineHeight: 1.7 }}>{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer note */}
        <p style={{ textAlign: "center", fontSize: 12, color: sub2, lineHeight: 1.6 }}>
          Our support team typically responds within 24 hours.<br />
          For urgent issues, email us at <a href="mailto:support@buyzze.in" style={{ color: "#2563eb", textDecoration: "none", fontWeight: 600 }}>support@buyzze.in</a>
        </p>
      </div>
    </div>
  );
}
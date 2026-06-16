import Link from "next/link";
import { Shield, ArrowLeft } from "lucide-react";

const EFFECTIVE_DATE = "15 March 2026";
const COMPANY = "Buyzze";
const EMAIL = "legal@buyzze.in";
const WEBSITE = "www.buyzze.in";

const sections = [
  {
    title: "1. Information We Collect",
    content: [
      "**Personal Information:** When you register on Buyzze, we collect your name, email address, phone number, and profile photo.",
      "**Listing Information:** When you post a product, we collect details such as product title, description, price, images, and your approximate location (city/state).",
      "**Usage Data:** We automatically collect information about how you interact with our platform, including pages visited, search queries, device type, browser type, IP address, and access timestamps.",
      "**Location Data:** With your permission, we may collect your precise location to show nearby listings.",
      "**Communications:** If you contact us or use our in-app chat feature, we may retain those communications.",
    ],
  },
  {
    title: "2. How We Use Your Information",
    content: [
      "To create and manage your account and listings.",
      "To connect buyers and sellers on our platform.",
      "To personalise your experience and show relevant listings.",
      "To send transactional notifications (e.g., new messages, listing updates).",
      "To improve our platform, detect fraud, and ensure safety.",
      "To comply with applicable laws and legal obligations.",
      "We do not sell your personal data to third parties.",
    ],
  },
  {
    title: "3. Information Sharing",
    content: [
      "**Other Users:** Your public profile, listings, and city/state are visible to other users. Your phone number is shared only when you choose to contact or be contacted.",
      "**Service Providers:** We share data with trusted third-party providers (e.g., cloud hosting, analytics) who process it on our behalf under strict confidentiality agreements.",
      "**Legal Requirements:** We may disclose information if required by law, court order, or to protect the rights, property, or safety of Buyzze or others.",
      "We do not share your data with advertisers or marketing companies.",
    ],
  },
  {
    title: "4. Data Storage & Security",
    content: [
      "Your data is stored on secure servers hosted by Supabase with industry-standard encryption.",
      "We implement technical and organisational measures to protect your data against unauthorised access, loss, or misuse.",
      "While we strive to protect your data, no method of transmission over the internet is 100% secure. You are responsible for keeping your account credentials confidential.",
      "We retain your data for as long as your account is active or as necessary to provide our services. You may request deletion at any time.",
    ],
  },
  {
    title: "5. Your Rights",
    content: [
      "**Access:** You may request a copy of the personal data we hold about you.",
      "**Correction:** You may update or correct inaccurate information through your account settings.",
      "**Deletion:** You may request deletion of your account and associated data by contacting us.",
      "**Withdrawal of Consent:** You may withdraw consent for optional data processing (e.g., location) at any time.",
      "To exercise any of these rights, email us at " + EMAIL + ".",
    ],
  },
  {
    title: "6. Cookies",
    content: [
      "Buyzze uses essential cookies to maintain your session and preferences.",
      "We may use analytics cookies to understand platform usage and improve our services.",
      "You can manage cookie preferences through your browser settings. Disabling essential cookies may affect platform functionality.",
    ],
  },
  {
    title: "7. Third-Party Links",
    content: [
      "Our platform may contain links to third-party websites. We are not responsible for the privacy practices or content of those sites.",
      "We encourage you to review the privacy policies of any third-party site you visit.",
    ],
  },
  {
    title: "8. Children's Privacy",
    content: [
      "Buyzze is not intended for users under the age of 18. We do not knowingly collect personal information from minors.",
      "If you believe a minor has provided us with personal information, please contact us immediately.",
    ],
  },
  {
    title: "9. Changes to This Policy",
    content: [
      "We may update this Privacy Policy from time to time. We will notify registered users of material changes via email or an in-app notification.",
      "Continued use of Buyzze after changes constitutes acceptance of the updated policy.",
    ],
  },
  {
    title: "10. Contact Us",
    content: [
      "For any questions, concerns, or requests regarding this Privacy Policy, please contact us at: " + EMAIL,
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "'Georgia', 'Times New Roman', serif" }}>

      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
        padding: "48px 24px 56px",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: -60, right: -60, width: 300, height: 300,
          borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <Link href="/" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            color: "rgba(255,255,255,0.5)", textDecoration: "none",
            fontSize: 13, fontFamily: "system-ui, sans-serif",
            marginBottom: 32,
          }}>
            <ArrowLeft size={14} /> Back to Buyzze
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 14,
              background: "rgba(99,102,241,0.2)", border: "1px solid rgba(99,102,241,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Shield size={22} color="#818cf8" />
            </div>
            <div>
              <p style={{ fontSize: 11, fontFamily: "system-ui", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#818cf8", margin: 0 }}>
                Legal Document
              </p>
              <h1 style={{ fontSize: 28, fontWeight: 700, color: "#ffffff", margin: 0, letterSpacing: "-0.5px" }}>
                Privacy Policy
              </h1>
            </div>
          </div>
          <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 14, margin: 0, fontFamily: "system-ui" }}>
            Effective Date: {EFFECTIVE_DATE} &nbsp;·&nbsp; {COMPANY} &nbsp;·&nbsp; {WEBSITE}
          </p>
        </div>
      </div>

      {/* Intro */}
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "36px 24px 0" }}>
        <div style={{
          background: "#fff", borderRadius: 16, padding: "24px 28px",
          border: "1px solid #e2e8f0",
          borderLeft: "4px solid #6366f1",
          marginBottom: 32,
        }}>
          <p style={{ fontSize: 15, lineHeight: 1.75, color: "#374151", margin: 0 }}>
            At <strong>Buyzze</strong>, your privacy is important to us. This Privacy Policy explains how we collect, use, store, and protect your personal information when you use our platform — a marketplace for buying and selling used smartphones in India. Please read this document carefully.
          </p>
        </div>

        {/* Sections */}
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {sections.map((section, i) => (
            <div key={i} style={{
              background: "#ffffff",
              borderRadius: 12,
              border: "1px solid #e2e8f0",
              padding: "24px 28px",
              marginBottom: 12,
            }}>
              <h2 style={{
                fontSize: 16, fontWeight: 700, color: "#0f172a",
                margin: "0 0 14px", fontFamily: "system-ui, sans-serif",
                letterSpacing: "-0.2px",
              }}>
                {section.title}
              </h2>
              <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
                {section.content.map((item, j) => (
                  <li key={j} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <span style={{ color: "#6366f1", marginTop: 6, flexShrink: 0, fontSize: 8 }}>◆</span>
                    <p style={{
                      fontSize: 14, lineHeight: 1.75, color: "#475569", margin: 0,
                      fontFamily: "system-ui, sans-serif",
                    }}
                      dangerouslySetInnerHTML={{
                        __html: item.replace(/\*\*(.*?)\*\*/g, '<strong style="color:#1e293b;font-weight:600">$1</strong>')
                      }}
                    />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{
          textAlign: "center", padding: "32px 0 48px",
          color: "#94a3b8", fontSize: 13, fontFamily: "system-ui",
        }}>
          © {new Date().getFullYear()} Buyzze. All rights reserved. &nbsp;·&nbsp;
          <Link href="/terms" style={{ color: "#6366f1", textDecoration: "none" }}>Terms</Link>
          &nbsp;·&nbsp;
          <Link href="/copyright" style={{ color: "#6366f1", textDecoration: "none" }}>Copyright</Link>
          &nbsp;·&nbsp;
          <Link href="/disclaimer" style={{ color: "#6366f1", textDecoration: "none" }}>Disclaimer</Link>
        </div>
      </div>
    </main>
  );
}

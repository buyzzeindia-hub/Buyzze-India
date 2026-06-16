import Link from "next/link";
import { AlertTriangle, ArrowLeft } from "lucide-react";

const EFFECTIVE_DATE = "15 March 2026";
const EMAIL = "legal@buyzze.in";
const YEAR = new Date().getFullYear();

const sections = [
  {
    title: "Platform Role",
    content: [
      "Buyzze is an online classifieds platform that facilitates connections between buyers and sellers of used smartphones in India.",
      "Buyzze is not a seller, dealer, broker, or agent. We do not own, buy, sell, or physically handle any product listed on the platform.",
      "All transactions are conducted directly between buyers and sellers. Buyzze is not a party to any such transaction.",
    ],
  },
  {
    title: "No Warranty on Listings",
    content: [
      "Buyzze does not verify, inspect, or guarantee the accuracy of any product listing, description, image, price, or condition unless the product is explicitly marked as 'BuYzze Assured'.",
      "We make no representations or warranties — express or implied — regarding the quality, safety, legality, or authenticity of any listed product.",
      "Buyers are strongly advised to physically inspect products and verify their condition before making any payment.",
    ],
  },
  {
    title: "Limitation of Liability",
    content: [
      "To the fullest extent permitted by applicable law, Buyzze shall not be liable for any loss, damage, fraud, or dispute arising from transactions between users.",
      "This includes, but is not limited to: financial loss from failed transactions, delivery of incorrect or damaged products, counterfeit or stolen goods, or miscommunication between buyer and seller.",
      "Buyzze's total liability to any user for any claim shall not exceed ₹500 or the amount paid by the user to Buyzze in the preceding three months, whichever is lower.",
    ],
  },
  {
    title: "User Conduct Disclaimer",
    content: [
      "Buyzze is not responsible for the conduct, communications, or actions of any user on or off the platform.",
      "We strongly recommend meeting in safe, public locations when completing in-person transactions.",
      "Buyzze encourages users to report suspicious listings or behaviour through our platform's reporting feature.",
    ],
  },
  {
    title: "Accuracy of Information",
    content: [
      "While we strive to maintain accurate and up-to-date information on the platform, Buyzze does not warrant that platform content is error-free, complete, or current.",
      "Market prices, product availability, and seller information may change without notice.",
      "Reliance on any information provided on Buyzze is at your own risk.",
    ],
  },
  {
    title: "External Links",
    content: [
      "Our platform may contain links to third-party websites or services. Buyzze has no control over these external sites and is not responsible for their content, privacy practices, or availability.",
      "The inclusion of any link does not imply endorsement by Buyzze.",
    ],
  },
  {
    title: "Force Majeure",
    content: [
      "Buyzze shall not be held liable for any failure or delay in performance resulting from causes beyond our reasonable control, including but not limited to natural disasters, government actions, internet service disruptions, or third-party service failures.",
    ],
  },
  {
    title: "Governing Law",
    content: [
      "This Disclaimer is governed by the laws of India.",
      "Any disputes arising in connection with this Disclaimer shall be subject to the exclusive jurisdiction of the courts of Varanasi, Uttar Pradesh, India.",
    ],
  },
  {
    title: "Changes to This Disclaimer",
    content: [
      "Buyzze reserves the right to update this Disclaimer at any time. Continued use of the platform after any changes constitutes your acceptance of the revised Disclaimer.",
      "For questions, contact us at: " + EMAIL,
    ],
  },
];

export default function DisclaimerPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "'Georgia', 'Times New Roman', serif" }}>

      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #1a0a1a 0%, #2d1430 100%)",
        padding: "48px 24px 56px",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: -60, right: -60, width: 300, height: 300,
          borderRadius: "50%", background: "radial-gradient(circle, rgba(168,85,247,0.12) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <Link href="/" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            color: "rgba(255,255,255,0.45)", textDecoration: "none",
            fontSize: 13, fontFamily: "system-ui, sans-serif", marginBottom: 32,
          }}>
            <ArrowLeft size={14} /> Back to Buyzze
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 14,
              background: "rgba(168,85,247,0.15)", border: "1px solid rgba(168,85,247,0.25)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <AlertTriangle size={22} color="#c084fc" />
            </div>
            <div>
              <p style={{ fontSize: 11, fontFamily: "system-ui", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#c084fc", margin: 0 }}>
                Legal Document
              </p>
              <h1 style={{ fontSize: 28, fontWeight: 700, color: "#ffffff", margin: 0, letterSpacing: "-0.5px" }}>
                Disclaimer
              </h1>
            </div>
          </div>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, margin: 0, fontFamily: "system-ui" }}>
            Effective Date: {EFFECTIVE_DATE} &nbsp;·&nbsp; Buyzze &nbsp;·&nbsp; www.buyzze.in
          </p>
        </div>
      </div>

      {/* Warning Banner */}
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "36px 24px 0" }}>
        <div style={{
          background: "#fffbeb", borderRadius: 16, padding: "20px 24px",
          border: "1px solid #fde68a", borderLeft: "4px solid #f59e0b",
          marginBottom: 32, display: "flex", gap: 14, alignItems: "flex-start",
        }}>
          <AlertTriangle size={20} color="#d97706" style={{ flexShrink: 0, marginTop: 2 }} />
          <p style={{ fontSize: 14, lineHeight: 1.75, color: "#92400e", margin: 0, fontFamily: "system-ui" }}>
            <strong>Important:</strong> Buyzze is a peer-to-peer marketplace. Always exercise caution when transacting with strangers. Meet in safe, public places and verify the product before paying.
          </p>
        </div>

        {/* Intro */}
        <div style={{
          background: "#fff", borderRadius: 16, padding: "24px 28px",
          border: "1px solid #e2e8f0", borderLeft: "4px solid #a855f7", marginBottom: 32,
        }}>
          <p style={{ fontSize: 15, lineHeight: 1.75, color: "#374151", margin: 0, fontFamily: "system-ui" }}>
            The information and services provided on <strong>Buyzze</strong> are offered in good faith. However, by using this platform, you acknowledge and agree to the limitations described in this Disclaimer. Please read it carefully.
          </p>
        </div>

        {sections.map((section, i) => (
          <div key={i} style={{
            background: "#ffffff", borderRadius: 12,
            border: "1px solid #e2e8f0", padding: "24px 28px", marginBottom: 12,
          }}>
            <h2 style={{
              fontSize: 16, fontWeight: 700, color: "#0f172a",
              margin: "0 0 14px", fontFamily: "system-ui, sans-serif", letterSpacing: "-0.2px",
            }}>
              {section.title}
            </h2>
            <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
              {section.content.map((item, j) => (
                <li key={j} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <span style={{ color: "#a855f7", marginTop: 6, flexShrink: 0, fontSize: 8 }}>◆</span>
                  <p style={{ fontSize: 14, lineHeight: 1.75, color: "#475569", margin: 0, fontFamily: "system-ui" }}>
                    {item}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div style={{ textAlign: "center", padding: "32px 0 48px", color: "#94a3b8", fontSize: 13, fontFamily: "system-ui" }}>
          © {YEAR} Buyzze. All rights reserved. &nbsp;·&nbsp;
          <Link href="/privacy" style={{ color: "#a855f7", textDecoration: "none" }}>Privacy</Link>
          &nbsp;·&nbsp;
          <Link href="/terms" style={{ color: "#a855f7", textDecoration: "none" }}>Terms</Link>
          &nbsp;·&nbsp;
          <Link href="/copyright" style={{ color: "#a855f7", textDecoration: "none" }}>Copyright</Link>
        </div>
      </div>
    </main>
  );
}

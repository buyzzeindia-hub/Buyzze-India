import Link from "next/link";
import { FileText, ArrowLeft } from "lucide-react";

const EFFECTIVE_DATE = "15 March 2026";
const EMAIL = "legal@buyzze.in";

const sections = [
  {
    title: "1. Acceptance of Terms",
    content: [
      "By accessing or using Buyzze, you confirm that you are at least 18 years of age and agree to be bound by these Terms and Conditions.",
      "If you do not agree to these terms, you must immediately stop using the platform.",
      "These Terms constitute a legally binding agreement between you and Buyzze.",
    ],
  },
  {
    title: "2. Platform Description",
    content: [
      "Buyzze is an online classifieds marketplace that enables individuals to buy and sell used smartphones and related accessories in India.",
      "Buyzze acts solely as a platform connecting buyers and sellers. We are not a party to any transaction between users.",
      "We do not own, inspect, or verify the condition of any listed products unless explicitly marked as 'BuYzze Assured'.",
    ],
  },
  {
    title: "3. User Accounts",
    content: [
      "You must provide accurate, complete, and up-to-date information when creating an account.",
      "You are solely responsible for maintaining the confidentiality of your login credentials.",
      "You must not share your account with any other person or allow unauthorised access.",
      "We reserve the right to suspend or terminate accounts that violate these Terms or engage in fraudulent activity.",
    ],
  },
  {
    title: "4. Listing Rules",
    content: [
      "All listings must be for genuine, legal products that you own or are authorised to sell.",
      "Product descriptions, images, and prices must be accurate and not misleading.",
      "You must not list stolen, counterfeit, or prohibited items.",
      "Duplicate or spam listings are not permitted.",
      "We reserve the right to remove any listing that violates these rules without prior notice.",
    ],
  },
  {
    title: "5. Buyer & Seller Responsibilities",
    content: [
      "**Sellers** are responsible for accurately representing their products, meeting buyers safely, and completing agreed transactions honestly.",
      "**Buyers** are responsible for verifying product condition before purchase, conducting due diligence, and making payments directly to sellers.",
      "Buyzze does not process payments between users and is not responsible for failed, disputed, or fraudulent transactions.",
      "Both parties agree to treat each other with respect and act in good faith.",
    ],
  },
  {
    title: "6. Prohibited Conduct",
    content: [
      "Using the platform for any illegal purpose or in violation of Indian law.",
      "Posting false, misleading, or defamatory content.",
      "Harassing, threatening, or abusing other users.",
      "Attempting to access other users' accounts without authorisation.",
      "Scraping, crawling, or using automated tools to extract data from the platform.",
      "Circumventing or attempting to bypass any security features of the platform.",
    ],
  },
  {
    title: "7. Intellectual Property",
    content: [
      "All content on Buyzze — including the name, logo, design, code, and written material — is the exclusive property of Buyzze and is protected under Indian copyright law.",
      "You may not copy, reproduce, distribute, or create derivative works from our content without prior written permission.",
      "By posting listings or content on Buyzze, you grant us a non-exclusive, royalty-free licence to display and use that content on our platform.",
    ],
  },
  {
    title: "8. Disclaimers",
    content: [
      "Buyzze provides the platform on an 'as is' and 'as available' basis without warranties of any kind.",
      "We do not guarantee the accuracy of any listing, the quality of any product, or the conduct of any user.",
      "We are not liable for any loss or damage arising from transactions conducted through the platform.",
    ],
  },
  {
    title: "9. Limitation of Liability",
    content: [
      "To the maximum extent permitted by law, Buyzze shall not be liable for any indirect, incidental, special, or consequential damages.",
      "Our total liability to you for any claim shall not exceed ₹500 or the amount you paid to us in the preceding 3 months, whichever is lower.",
    ],
  },
  {
    title: "10. Governing Law",
    content: [
      "These Terms are governed by the laws of India.",
      "Any disputes arising from these Terms shall be subject to the exclusive jurisdiction of the courts of Varanasi, Uttar Pradesh.",
    ],
  },
  {
    title: "11. Changes to Terms",
    content: [
      "We may update these Terms at any time. Material changes will be communicated via email or in-app notification.",
      "Continued use of the platform after changes constitutes acceptance of the revised Terms.",
    ],
  },
  {
    title: "12. Contact",
    content: ["For questions regarding these Terms, contact us at: " + EMAIL],
  },
];

export default function TermsPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "'Georgia', 'Times New Roman', serif" }}>

      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #0c1a0c 0%, #14291a 100%)",
        padding: "48px 24px 56px",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: -60, right: -60, width: 300, height: 300,
          borderRadius: "50%", background: "radial-gradient(circle, rgba(34,197,94,0.12) 0%, transparent 70%)",
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
              background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.25)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <FileText size={22} color="#4ade80" />
            </div>
            <div>
              <p style={{ fontSize: 11, fontFamily: "system-ui", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#4ade80", margin: 0 }}>
                Legal Document
              </p>
              <h1 style={{ fontSize: 28, fontWeight: 700, color: "#ffffff", margin: 0, letterSpacing: "-0.5px" }}>
                Terms & Conditions
              </h1>
            </div>
          </div>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, margin: 0, fontFamily: "system-ui" }}>
            Effective Date: {EFFECTIVE_DATE} &nbsp;·&nbsp; Buyzze &nbsp;·&nbsp; www.buyzze.in
          </p>
        </div>
      </div>

      {/* Intro */}
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "36px 24px 0" }}>
        <div style={{
          background: "#fff", borderRadius: 16, padding: "24px 28px",
          border: "1px solid #e2e8f0", borderLeft: "4px solid #22c55e", marginBottom: 32,
        }}>
          <p style={{ fontSize: 15, lineHeight: 1.75, color: "#374151", margin: 0, fontFamily: "system-ui" }}>
            Welcome to <strong>Buyzze</strong>. These Terms and Conditions govern your use of our platform. By using Buyzze, you agree to comply with and be bound by the following terms. Please read them carefully before proceeding.
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
                  <span style={{ color: "#22c55e", marginTop: 6, flexShrink: 0, fontSize: 8 }}>◆</span>
                  <p style={{ fontSize: 14, lineHeight: 1.75, color: "#475569", margin: 0, fontFamily: "system-ui" }}
                    dangerouslySetInnerHTML={{
                      __html: item.replace(/\*\*(.*?)\*\*/g, '<strong style="color:#1e293b;font-weight:600">$1</strong>')
                    }}
                  />
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div style={{ textAlign: "center", padding: "32px 0 48px", color: "#94a3b8", fontSize: 13, fontFamily: "system-ui" }}>
          © {new Date().getFullYear()} Buyzze. All rights reserved. &nbsp;·&nbsp;
          <Link href="/privacy" style={{ color: "#22c55e", textDecoration: "none" }}>Privacy</Link>
          &nbsp;·&nbsp;
          <Link href="/copyright" style={{ color: "#22c55e", textDecoration: "none" }}>Copyright</Link>
          &nbsp;·&nbsp;
          <Link href="/disclaimer" style={{ color: "#22c55e", textDecoration: "none" }}>Disclaimer</Link>
        </div>
      </div>
    </main>
  );
}

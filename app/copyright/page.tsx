import Link from "next/link";
import { Copyright, ArrowLeft } from "lucide-react";

const YEAR = new Date().getFullYear();
const EMAIL = "legal@buyzze.in";

const sections = [
  {
    title: "Ownership of Content",
    content: [
      "All content on the Buyzze platform — including but not limited to the name 'Buyzze', our logo, taglines, website design, layout, colour scheme, user interface elements, graphics, icons, written text, code, and documentation — is the sole and exclusive intellectual property of Buyzze.",
      "This content is protected under the Copyright Act, 1957 (India) and applicable international copyright conventions.",
      "Unauthorised use, reproduction, distribution, or modification of any content from this platform is strictly prohibited and may result in legal action.",
    ],
  },
  {
    title: "User-Generated Content",
    content: [
      "When you post listings, photos, descriptions, or any other content on Buyzze, you retain ownership of that content.",
      "By submitting content to the platform, you grant Buyzze a non-exclusive, worldwide, royalty-free licence to display, reproduce, and use that content solely for the purpose of operating and improving the platform.",
      "You represent and warrant that any content you submit does not infringe the intellectual property rights of any third party.",
      "Buyzze reserves the right to remove any content that infringes third-party rights or violates our policies.",
    ],
  },
  {
    title: "Trademarks",
    content: [
      "The name 'Buyzze', the Buyzze logo, and all related marks are trademarks of Buyzze.",
      "You may not use these trademarks in any manner without prior written consent from Buyzze.",
      "Unauthorised use of our trademarks in a way that may cause confusion, or that disparages our platform, is prohibited.",
    ],
  },
  {
    title: "Prohibited Uses",
    content: [
      "Copying, scraping, or reproducing any part of the Buyzze platform without written permission.",
      "Using Buyzze's name, logo, or branding in any advertising, promotional material, or social media without consent.",
      "Reverse engineering, decompiling, or disassembling any software component of the platform.",
      "Creating derivative works based on Buyzze's content or design.",
    ],
  },
  {
    title: "Third-Party Content",
    content: [
      "Some content on Buyzze may be licensed from third parties (e.g., icons, fonts, images). Such content is used in compliance with respective licences.",
      "Third-party brand names, product names, and logos mentioned on the platform belong to their respective owners. Buyzze makes no claim of ownership over them.",
    ],
  },
  {
    title: "Reporting Infringement",
    content: [
      "If you believe that any content on Buyzze infringes your copyright or intellectual property rights, please notify us promptly at: " + EMAIL,
      "Your notice must include: (a) identification of the copyrighted work claimed to be infringed, (b) identification of the infringing content and its location on our platform, (c) your contact information, and (d) a statement that you have a good faith belief the use is not authorised.",
      "We will investigate and take appropriate action, including removal of infringing content, within a reasonable time.",
    ],
  },
  {
    title: "Governing Law",
    content: [
      "This Copyright Notice is governed by the laws of India, including the Copyright Act, 1957 and the Information Technology Act, 2000.",
      "Any disputes shall be subject to the exclusive jurisdiction of the courts of Varanasi, Uttar Pradesh, India.",
    ],
  },
];

export default function CopyrightPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "'Georgia', 'Times New Roman', serif" }}>

      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #1a0a00 0%, #2d1700 100%)",
        padding: "48px 24px 56px",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: -60, right: -60, width: 300, height: 300,
          borderRadius: "50%", background: "radial-gradient(circle, rgba(251,146,60,0.12) 0%, transparent 70%)",
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
              background: "rgba(251,146,60,0.15)", border: "1px solid rgba(251,146,60,0.25)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Copyright size={22} color="#fb923c" />
            </div>
            <div>
              <p style={{ fontSize: 11, fontFamily: "system-ui", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#fb923c", margin: 0 }}>
                Legal Document
              </p>
              <h1 style={{ fontSize: 28, fontWeight: 700, color: "#ffffff", margin: 0, letterSpacing: "-0.5px" }}>
                Copyright Notice
              </h1>
            </div>
          </div>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, margin: 0, fontFamily: "system-ui" }}>
            © {YEAR} Buyzze. All Rights Reserved. &nbsp;·&nbsp; www.buyzze.in
          </p>
        </div>
      </div>

      {/* Intro */}
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "36px 24px 0" }}>
        <div style={{
          background: "#fff", borderRadius: 16, padding: "24px 28px",
          border: "1px solid #e2e8f0", borderLeft: "4px solid #f97316", marginBottom: 32,
        }}>
          <p style={{ fontSize: 15, lineHeight: 1.75, color: "#374151", margin: 0, fontFamily: "system-ui" }}>
            Copyright © {YEAR} <strong>Buyzze</strong>. All rights reserved. This Copyright Notice sets out Buyzze's intellectual property rights and the rules governing use of content on our platform.
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
                  <span style={{ color: "#f97316", marginTop: 6, flexShrink: 0, fontSize: 8 }}>◆</span>
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
          <Link href="/privacy" style={{ color: "#f97316", textDecoration: "none" }}>Privacy</Link>
          &nbsp;·&nbsp;
          <Link href="/terms" style={{ color: "#f97316", textDecoration: "none" }}>Terms</Link>
          &nbsp;·&nbsp;
          <Link href="/disclaimer" style={{ color: "#f97316", textDecoration: "none" }}>Disclaimer</Link>
        </div>
      </div>
    </main>
  );
}

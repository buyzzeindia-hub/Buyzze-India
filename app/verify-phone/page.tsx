"use client";
import { useState, useRef, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, Phone, ArrowRight, RefreshCw, CheckCircle, ArrowLeft } from "lucide-react";
import { setupRecaptcha, sendOTP } from "@/lib/firebaseAuth";
import type { ConfirmationResult, RecaptchaVerifier } from "firebase/auth";

type Step = "phone" | "otp" | "success";

export default function VerifyPhonePage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  const [step, setStep]           = useState<Step>("phone");
  const [phone, setPhone]         = useState("");
  const [otp, setOtp]             = useState(["", "", "", "", "", ""]);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [countdown, setCountdown] = useState(0);

  const confirmRef   = useRef<ConfirmationResult | null>(null);
  const recaptchaRef = useRef<RecaptchaVerifier | null>(null);
  const otpRefs      = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const handleSendOTP = async () => {
    setError("");
    const digits = phone.replace(/\D/g, "");
    if (digits.length !== 10) { setError("Valid 10-digit number daalo"); return; }
    setLoading(true);
    try {
      if (!recaptchaRef.current) {
        recaptchaRef.current = setupRecaptcha("recaptcha-btn");
      }
      confirmRef.current = await sendOTP(digits, recaptchaRef.current);
      setStep("otp");
      setCountdown(30);
    } catch (err: any) {
      setError(err.message?.includes("too-many-requests")
        ? "Bahut zyada attempts. Thodi der baad try karo."
        : "OTP send nahi hua. Dobara try karo.");
      recaptchaRef.current = null;
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async () => {
    const code = otp.join("");
    if (code.length !== 6) { setError("6-digit OTP daalo"); return; }
    if (!confirmRef.current) { setError("Session expire ho gaya. Dobara try karo."); return; }
    setLoading(true); setError("");
    try {
      await confirmRef.current.confirm(code);
      await fetch("/api/save-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id,
          phone: `+91${phone.replace(/\D/g, "")}`,
        }),
      });
      setStep("success");
      setTimeout(() => router.push("/profile"), 2500);
    } catch (err: any) {
      setError(err.message?.includes("invalid-verification-code")
        ? "Galat OTP. Dobara check karo."
        : "Verification fail hua. Dobara try karo.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setOtp(["", "", "", "", "", ""]);
    setError("");
    recaptchaRef.current = null;
    await handleSendOTP();
  };

  if (!isLoaded) return null;

  return (
    <main style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #eff6ff 0%, #f0fdf4 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 20, fontFamily: "'Roboto', system-ui, sans-serif",
    }}>
      <div style={{ width: "100%", maxWidth: 420 }}>

        {/* Back */}
        <Link href="/profile" style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          color: "#6b7280", textDecoration: "none", fontSize: 13,
          fontWeight: 600, marginBottom: 24,
        }}>
          <ArrowLeft size={14} /> Back to Profile
        </Link>

        {/* Card */}
        <div style={{
          background: "#ffffff", borderRadius: 24,
          boxShadow: "0 8px 40px rgba(0,0,0,0.1)",
          overflow: "hidden",
        }}>

          {/* Header */}
          <div style={{
            background: "linear-gradient(135deg, #0ea5e9, #2563eb)",
            padding: "32px 28px 28px",
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: 16,
              background: "rgba(255,255,255,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              marginBottom: 14,
            }}>
              <ShieldCheck size={28} color="white" />
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 900, color: "#fff", margin: "0 0 6px", letterSpacing: "-0.5px" }}>
              Verify Your Phone
            </h1>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", margin: 0 }}>
              Ek Verified badge paao aur buyers ka trust badhao
            </p>

            {/* Benefits */}
            <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
              {["✅ Verified Badge", "📈 More Visibility", "🤝 Buyer Trust"].map(b => (
                <span key={b} style={{
                  fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.9)",
                  background: "rgba(255,255,255,0.15)", borderRadius: 20,
                  padding: "4px 10px", border: "1px solid rgba(255,255,255,0.2)",
                }}>
                  {b}
                </span>
              ))}
            </div>
          </div>

          {/* Body */}
          <div style={{ padding: "28px" }}>

            {/* STEP: Phone */}
            {step === "phone" && (
              <div>
                <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 20, lineHeight: 1.7 }}>
                  Apna Indian mobile number daalo. Ek <strong>6-digit OTP</strong> SMS se aayega.
                </p>

                <label style={{ fontSize: 11, fontWeight: 700, color: "#374151", letterSpacing: "0.06em", textTransform: "uppercase", display: "block", marginBottom: 8 }}>
                  Mobile Number
                </label>
                <div style={{
                  display: "flex", alignItems: "center", gap: 10,
                  border: "2px solid #e5e7eb", borderRadius: 12,
                  padding: "12px 14px", marginBottom: 16,
                }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#374151", paddingRight: 10, borderRight: "2px solid #e5e7eb" }}>
                    🇮🇳 +91
                  </span>
                  <input
                    type="tel" maxLength={10}
                    placeholder="10-digit number"
                    value={phone}
                    onChange={e => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    onKeyDown={e => e.key === "Enter" && handleSendOTP()}
                    style={{
                      flex: 1, border: "none", outline: "none",
                      fontSize: 16, fontWeight: 600, color: "#111827",
                      background: "transparent", letterSpacing: "0.08em",
                    }}
                  />
                  <Phone size={16} color="#9ca3af" />
                </div>

                {error && (
                  <div style={{
                    background: "#fef2f2", border: "1px solid #fecaca",
                    borderRadius: 10, padding: "10px 14px", marginBottom: 16,
                  }}>
                    <p style={{ fontSize: 12, color: "#dc2626", margin: 0 }}>⚠️ {error}</p>
                  </div>
                )}

                <button
                  id="recaptcha-btn"
                  onClick={handleSendOTP}
                  disabled={loading || phone.length !== 10}
                  style={{
                    width: "100%", padding: "14px",
                    background: phone.length === 10 && !loading
                      ? "linear-gradient(135deg, #0ea5e9, #2563eb)" : "#e5e7eb",
                    color: phone.length === 10 && !loading ? "#fff" : "#9ca3af",
                    border: "none", borderRadius: 12,
                    fontSize: 14, fontWeight: 700, cursor: phone.length === 10 && !loading ? "pointer" : "default",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    transition: "all 0.2s",
                  }}
                >
                  {loading
                    ? <RefreshCw size={16} style={{ animation: "spin 1s linear infinite" }} />
                    : <> Send OTP <ArrowRight size={15} /> </>
                  }
                </button>
              </div>
            )}

            {/* STEP: OTP */}
            {step === "otp" && (
              <div>
                <div style={{ textAlign: "center", marginBottom: 20 }}>
                  <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 4 }}>
                    OTP bheja gaya
                  </p>
                  <p style={{ fontSize: 15, fontWeight: 700, color: "#111827", margin: 0 }}>
                    +91 {phone}
                  </p>
                  <button onClick={() => { setStep("phone"); setOtp(["","","","","",""]); }}
                    style={{ fontSize: 12, color: "#0ea5e9", background: "none", border: "none", cursor: "pointer", marginTop: 4, fontWeight: 600 }}>
                    Number change karo
                  </button>
                </div>

                {/* OTP boxes */}
                <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 20 }}>
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={el => { otpRefs.current[i] = el; }}
                      type="text" inputMode="numeric" maxLength={1}
                      value={digit}
                      onChange={e => handleOtpChange(i, e.target.value)}
                      onKeyDown={e => handleOtpKeyDown(i, e)}
                      autoFocus={i === 0}
                      style={{
                        width: 46, height: 54, textAlign: "center",
                        fontSize: 22, fontWeight: 800, color: "#111827",
                        border: `2px solid ${digit ? "#0ea5e9" : "#e5e7eb"}`,
                        borderRadius: 10, outline: "none",
                        background: digit ? "#eff6ff" : "#f9fafb",
                        transition: "all 0.15s",
                      }}
                    />
                  ))}
                </div>

                {error && (
                  <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "10px 14px", marginBottom: 16 }}>
                    <p style={{ fontSize: 12, color: "#dc2626", margin: 0 }}>⚠️ {error}</p>
                  </div>
                )}

                <button
                  onClick={handleVerifyOTP}
                  disabled={loading || otp.join("").length !== 6}
                  style={{
                    width: "100%", padding: "14px",
                    background: otp.join("").length === 6 && !loading
                      ? "linear-gradient(135deg, #0ea5e9, #2563eb)" : "#e5e7eb",
                    color: otp.join("").length === 6 && !loading ? "#fff" : "#9ca3af",
                    border: "none", borderRadius: 12,
                    fontSize: 14, fontWeight: 700,
                    cursor: otp.join("").length === 6 && !loading ? "pointer" : "default",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    marginBottom: 16, transition: "all 0.2s",
                  }}
                >
                  {loading
                    ? <RefreshCw size={16} style={{ animation: "spin 1s linear infinite" }} />
                    : <> Verify & Get Badge <ShieldCheck size={15} /> </>
                  }
                </button>

                <div style={{ textAlign: "center" }}>
                  {countdown > 0 ? (
                    <p style={{ fontSize: 12, color: "#9ca3af" }}>
                      Resend in <strong style={{ color: "#374151" }}>{countdown}s</strong>
                    </p>
                  ) : (
                    <button onClick={handleResend} style={{
                      fontSize: 12, color: "#0ea5e9", background: "none",
                      border: "none", cursor: "pointer", fontWeight: 600,
                    }}>
                      OTP nahi aaya? Resend karo
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* STEP: Success */}
            {step === "success" && (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <div style={{
                  width: 72, height: 72, borderRadius: "50%",
                  background: "linear-gradient(135deg, #0ea5e9, #2563eb)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 20px",
                  animation: "popIn 0.4s cubic-bezier(0.34,1.5,0.64,1)",
                  boxShadow: "0 8px 24px rgba(14,165,233,0.4)",
                }}>
                  <CheckCircle size={36} color="white" />
                </div>
                <h2 style={{ fontSize: 20, fontWeight: 900, color: "#111827", margin: "0 0 8px" }}>
                  Phone Verified! 🎉
                </h2>
                <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 20 }}>
                  Tumhara <strong>Verified badge</strong> profile pe add ho gaya. Profile pe redirect ho rahe ho...
                </p>
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  background: "linear-gradient(135deg, #0ea5e9, #2563eb)",
                  color: "#fff", fontSize: 12, fontWeight: 700,
                  padding: "8px 16px", borderRadius: 20,
                  boxShadow: "0 4px 12px rgba(14,165,233,0.35)",
                }}>
                  <ShieldCheck size={13} /> Verified
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes popIn {
          from { transform: scale(0); opacity: 0; }
          to   { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </main>
  );
}

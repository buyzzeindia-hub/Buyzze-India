// lib/firebaseAuth.ts
// Firebase Auth instance — phone verification ke liye
// Tumhara existing firebase.ts/firebaseConfig.ts already hoga
// Usi se RecaptchaVerifier aur signInWithPhoneNumber import karo

import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from "firebase/auth";
import { app } from "@/lib/firebase"; // tumhara existing firebase init file

export const auth = getAuth(app);

// Invisible recaptcha setup
export function setupRecaptcha(buttonId: string): RecaptchaVerifier {
  return new RecaptchaVerifier(auth, buttonId, {
    size: "invisible",
    callback: () => {},
    "expired-callback": () => {},
  });
}

// OTP bhejo
export async function sendOTP(
  phoneNumber: string,
  recaptchaVerifier: RecaptchaVerifier
): Promise<ConfirmationResult> {
  // Phone number +91 format mein hona chahiye
  const formatted = phoneNumber.startsWith("+91")
    ? phoneNumber
    : `+91${phoneNumber.replace(/\D/g, "")}`;
  return await signInWithPhoneNumber(auth, formatted, recaptchaVerifier);
}

import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Sirf logged-in user dekh sakta hai
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/sell(.*)",
  "/profile(.*)",
  "/chat(.*)",
]);

// Already logged in ho toh login/signup pe mat jaao
const isAuthRoute = createRouteMatcher([
  "/login(.*)",
  "/signup(.*)",
  "/verify-email(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  // 🔥 FIX 1: Sirf 'has()' mat check karo, cookie ki ACTUAL VALUE check karo.
  // Agar cookie delete ho chuki hai (empty hai), toh false return hoga.
  const fastAuthCookie = req.cookies.get("buyzze_fast_session")?.value;
  const hasFastAuth = !!fastAuthCookie && fastAuthCookie.trim().length > 0;

  // 2. Agar dono me se kisi ek se bhi login hai, toh user authenticated hai
  const isUserLoggedIn = !!userId || hasFastAuth;

  // Logged in + auth route → home pe bhejo
  if (isUserLoggedIn && isAuthRoute(req)) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Not logged in + protected route → login pe bhejo
  if (!isUserLoggedIn && isProtectedRoute(req)) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // API routes INCLUDE karo — auth() kaam kare API routes pe
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|lottie)).*)",
  ],
};
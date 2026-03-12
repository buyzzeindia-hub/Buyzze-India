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

  // Logged in + auth route → home pe bhejo
  if (userId && isAuthRoute(req)) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Not logged in + protected route → login pe bhejo
  if (!userId && isProtectedRoute(req)) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // ✅ API routes INCLUDE karo — auth() kaam kare API routes pe
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|lottie)).*)",
  ],
};
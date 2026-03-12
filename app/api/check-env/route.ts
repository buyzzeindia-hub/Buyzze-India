import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    publishable: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? "EXISTS" : "MISSING",
    first10: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.substring(0, 15),
  });
}
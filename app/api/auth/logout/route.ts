import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  const cookieStore = await cookies();
  // Hamari fast auth cookie delete kar do
  cookieStore.delete("buyzze_fast_session");
  return NextResponse.json({ success: true });
}
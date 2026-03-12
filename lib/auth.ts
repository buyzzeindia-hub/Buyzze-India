"use server";

import { auth, currentUser } from "@clerk/nextjs/server";

/**
 * GET CURRENT USER ID
 * Sirf user ID chahiye toh ye use karo (fast)
 */
export async function getUserId(): Promise<string | null> {
  const { userId } = await auth();
  return userId;
}

/**
 * GET FULL USER OBJECT
 * Poori user details chahiye toh ye use karo
 */
export async function getUser() {
  const { userId } = await auth();
  if (!userId) return null;

  const user = await currentUser();
  return user;
}

/**
 * CHECK IF LOGGED IN
 */
export async function isAuthenticated(): Promise<boolean> {
  const { userId } = await auth();
  return !!userId;
}

"use client";
import { createAuthClient } from "@neondatabase/auth";
import { BetterAuthReactAdapter } from "@neondatabase/auth/react/adapters";

const neonAuthUrl = process.env.NEXT_PUBLIC_NEON_AUTH_URL as string;

export const authClient = createAuthClient(neonAuthUrl, {
  adapter: BetterAuthReactAdapter(),
});

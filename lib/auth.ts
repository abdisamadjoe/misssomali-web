import { createNeonAuth } from '@neondatabase/auth/next/server';

export const auth = createNeonAuth({
  baseUrl: process.env.NEXT_PUBLIC_NEON_AUTH_URL || process.env.NEON_AUTH_URL || '',
  cookies: {
    secret: process.env.NEON_AUTH_COOKIE_SECRET || "a-long-session-cookie-secret-string-at-least-32-chars",
  },
});

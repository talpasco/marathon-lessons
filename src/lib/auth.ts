import { cookies } from "next/headers";

const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "admin";
const AUTH_COOKIE_NAME = "admin_session";
const SESSION_SECRET = process.env.SESSION_SECRET || "default-secret-change-in-production";

export function verifyCredentials(username: string, password: string): boolean {
  return username === ADMIN_USERNAME && password === ADMIN_PASSWORD;
}

export function createSession(): string {
  // Simple session token - in production use proper JWT
  const token = Buffer.from(
    JSON.stringify({
      user: ADMIN_USERNAME,
      exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
      secret: SESSION_SECRET,
    })
  ).toString("base64");

  return token;
}

export async function verifySession(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(AUTH_COOKIE_NAME);

    if (!sessionCookie) {
      return false;
    }

    const decoded = JSON.parse(Buffer.from(sessionCookie.value, "base64").toString());

    if (decoded.secret !== SESSION_SECRET) {
      return false;
    }

    if (Date.now() > decoded.exp) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

export function getAuthCookieName(): string {
  return AUTH_COOKIE_NAME;
}

import "server-only";

import { type User, type Session, sessionTable, userTable } from "@/db/schema";
import { init } from "@paralleldrive/cuid2";
import { encodeHexLowerCase } from "@oslojs/encoding"
import { sha256 } from "@oslojs/crypto/sha2"
import ms from "enhanced-ms"
import { getDB } from "@/db";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import isProd from "./isProd";

type NewSession = Omit<Session, "createdAt" | "updatedAt">;

const getSessionLength = () => {
  return ms("30d");
}

const SESSION_COOKIE_NAME = "session";

const createId = init({
  length: 48,
});

export function generateSessionToken(): string {
  return createId();
}

export type SessionValidationResult =
  | User & { session: Session }
  | null;

// Based on https://lucia-auth.com/sessions/overview
export async function createSession(token: string, userId: string): Promise<NewSession> {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  const session: NewSession = {
    id: sessionId,
    userId,
    expiresAt: new Date(Date.now() + getSessionLength())
  };

  const db = await getDB();

  await db.insert(sessionTable).values(session);

  return session;
}

export async function validateSessionToken(token: string): Promise<SessionValidationResult | null> {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));

  const db = await getDB()

  const result = await db
    .select({ user: userTable, session: sessionTable })
    .from(sessionTable)
    .innerJoin(userTable, eq(sessionTable.userId, userTable.id))
    .where(eq(sessionTable.id, sessionId));

  if (result?.length < 1) {
    return null
  }

  const { user, session } = result?.[0];

  // If the session has expired, delete it and return null
  if (Date.now() >= session.expiresAt.getTime()) {
    await db.delete(sessionTable).where(eq(sessionTable.id, session.id));
    return null;
  }

  // If the session is about to expire, refresh it
  if (Date.now() >= session.expiresAt.getTime() - (getSessionLength() / 2)) {
    session.expiresAt = new Date(Date.now() + getSessionLength());
    await db
      .update(sessionTable)
      .set({
        expiresAt: session.expiresAt
      })
      .where(eq(sessionTable.id, session.id));
  }

  return {
    ...user,
    session,
  };
}
export async function invalidateSession(sessionId: string): Promise<void> {
  const db = await getDB();

  await db.delete(sessionTable).where(eq(sessionTable.id, sessionId));
}

export async function setSessionTokenCookie(token: string, expiresAt: Date): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: isProd,
    expires: expiresAt,
    path: "/"
  });
}

export async function deleteSessionTokenCookie(): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.delete(SESSION_COOKIE_NAME);
}

export const getSessionFromCookie = async (): Promise<SessionValidationResult | null> => {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  return validateSessionToken(token);
}

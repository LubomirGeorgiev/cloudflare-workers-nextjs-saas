"use server"

import { createServerAction } from "zsa"
import z from "zod"
import { getDB } from "@/db";
import { userTable } from "@/db/schema";
import { hashPassword, verifyPassword } from "@/utils/passwordHasher";
import {
  createSession,
  generateSessionToken,
  setSessionTokenCookie,
} from "@/utils/auth";
import { eq } from "drizzle-orm";

export const signUpAction = createServerAction()
  .input(z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(8),
  }))
  .handler(async ({ input }) => {
    const db = await getDB();

    const passwordHash = await hashPassword(input.password);

    // TODO Implement with lucia-auth
    const user = await db.insert(userTable).values({
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      passwordHash: passwordHash,
    }).returning();

    return user?.[0];
  });

export const signInAction = createServerAction()
  .input(z.object({
    email: z.string().email(),
    password: z.string().min(8),
  }))
  .handler(async ({ input }) => {

    const db = await getDB();

    const user = await db.query.userTable.findFirst({
      where: eq(userTable.email, input.email),
    });

    if (!user) {
      throw new Error("User not found");
    }

    const passwordValid = await verifyPassword(user.passwordHash || "", input.password);

    if (!passwordValid) {
      throw new Error("Invalid password");
    }

    const token = generateSessionToken()

    const session = await createSession(token, user.id);

    await setSessionTokenCookie(token, session.expiresAt);

    return token;
  });


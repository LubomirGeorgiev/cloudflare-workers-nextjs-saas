"use server"

import { createServerAction } from "zsa"
import z from "zod"
import { getDB } from "@/db";
import { userTable } from "@/db/schema";
import { hashPassword } from "@/utils/passwordHasher";

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

import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";

import { type InferSelectModel } from "drizzle-orm";

import { createId } from '@paralleldrive/cuid2'

const commonColumns = {
  id: text().primaryKey().$defaultFn(() => createId()).notNull(),
  createdAt: integer({
    mode: "timestamp",
  }).$defaultFn(() => new Date()).notNull(),
  updatedAt: integer({
    mode: "timestamp",
  }).$onUpdateFn(() => new Date()).notNull(),
}

export const userTable = sqliteTable("user", {
  ...commonColumns,
  firstName: text({
    length: 255,
  }),
  lastName: text({
    length: 255,
  }),
  email: text({
    length: 255,
  }).unique(),
  passwordHash: text(),
});

export const sessionTable = sqliteTable("session", {
  ...commonColumns,
  id: text().primaryKey(),
  userId: text()
    .notNull()
    .references(() => userTable.id),
  expiresAt: integer({
    mode: "timestamp"
  }).notNull()
});

export type User = InferSelectModel<typeof userTable>;
export type Session = InferSelectModel<typeof sessionTable>;

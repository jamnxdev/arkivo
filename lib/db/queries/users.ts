import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { usersTable } from "@/lib/db/schema";

export async function findOrCreateUser({
  externalId,
  email,
  name,
  username,
}: {
  externalId: string;
  email?: string;
  name?: string;
  username?: string;
}) {
  const existing = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.externalId, externalId));

  if (existing.length > 0) return existing[0];

  const newUser = await db
    .insert(usersTable)
    .values({
      externalId,
      provider: "clerk",
      email,
      name,
      username,
    })
    .returning();

  return newUser[0];
}

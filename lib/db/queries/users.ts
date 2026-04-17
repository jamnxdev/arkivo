import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { usersTable } from "@/lib/db/schema";

export async function findOrCreateUser({ id }: { id: string }) {
  const existing = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, id));

  if (existing.length > 0) return existing[0];

  const newUser = await db
    .insert(usersTable)
    .values({
      id,
    })
    .returning();

  return newUser[0];
}

import { sql } from "drizzle-orm";

import { db } from "@/lib/db";

/**
 * Sets per-request RLS context for PostgreSQL policies.
 * Must be called after authentication in every route that touches protected tables.
 */
export async function setRlsUserContext(userId: string) {
  await db.execute(
    sql`select set_config('app.current_user_id', ${userId}, false)`,
  );
}

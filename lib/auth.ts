import { auth } from "@clerk/nextjs/server";

import { findOrCreateUser } from "./db/queries/users";

export async function getCurrentUser() {
  const { userId, isAuthenticated } = await auth();

  if (!isAuthenticated && !userId) return null;

  const user = await findOrCreateUser({ externalId: userId });

  return user;
}

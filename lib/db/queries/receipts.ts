import { eq } from "drizzle-orm";

import { db } from "@/lib/db";

import type { Receipt } from "../schema";
import { receiptsTable } from "../schema";

type UpdateReceiptInput = Partial<
  Pick<
    Receipt,
    | "merchant"
    | "merchantBrand"
    | "total"
    | "category"
    | "items"
    | "tax"
    | "metadata"
  >
>;

export async function createReceipt(data: Receipt) {
  const result = await db.insert(receiptsTable).values(data).returning();

  return result[0];
}

export async function getReceipts(userId: string) {
  return db
    .select()
    .from(receiptsTable)
    .where(eq(receiptsTable.userId, userId));
}

export async function updateReceipt(id: string, data: UpdateReceiptInput) {
  return db
    .update(receiptsTable)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(receiptsTable.id, id))
    .returning();
}

export async function deleteReceipt(id: string) {
  return db.delete(receiptsTable).where(eq(receiptsTable.id, id));
}

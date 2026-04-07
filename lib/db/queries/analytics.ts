import { eq } from "drizzle-orm";

import { db } from "@/lib/db";

import { receiptsTable } from "../schema";

export async function getSummary(userId: string) {
  const data = await db
    .select()
    .from(receiptsTable)
    .where(eq(receiptsTable.userId, userId));

  const total = data.reduce((sum, r) => sum + (Number(r.total) || 0), 0);

  return {
    total_spent: total,
    total_receipts: data.length,
  };
}

export async function getCategoryBreakdown(userId: string) {
  const data = await db
    .select()
    .from(receiptsTable)
    .where(eq(receiptsTable.userId, userId));

  const map: Record<string, number> = {};

  for (const r of data) {
    const cat = r.category || "misc";
    map[cat] = (map[cat] || 0) + (Number(r.total) || 0);
  }

  return Object.entries(map).map(([category, total]) => ({
    category,
    total,
  }));
}

export async function getTimeSeries(userId: string) {
  const data = await db
    .select()
    .from(receiptsTable)
    .where(eq(receiptsTable.userId, userId));

  const map: Record<string, number> = {};

  for (const r of data) {
    if (!r.date) continue;

    map[String(r.date)] = (map[String(r.date)] || 0) + (Number(r.total) || 0);
  }

  return Object.entries(map).map(([date, total]) => ({
    date,
    total,
  }));
}

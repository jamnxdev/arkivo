import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import {
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export type Receipt = InferSelectModel<typeof receiptsTable>;
export type ReceiptInsert = InferInsertModel<typeof receiptsTable>;

export const usersTable = pgTable("users", {
  id: text("id").primaryKey(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const parserConfigsTable = pgTable("parser_configs", {
  id: uuid("id").defaultRandom().primaryKey(),

  userId: text("user_id"),

  name: text("name"),
  rules: jsonb("rules"),

  createdAt: timestamp("created_at").defaultNow(),
});

export const receiptsTable = pgTable("receipts", {
  id: uuid("id").defaultRandom().primaryKey(),

  userId: text("user_id").notNull(),

  merchant: text("merchat"),
  merchantBrand: text("merchant_brand"),

  total: numeric("total"),
  currency: text("currency").default("EUR"),

  date: timestamp("date"),
  time: text("time"),

  category: text("category"),

  rawText: text("raw_text"),

  items: jsonb("items"),
  tax: jsonb("tax"),
  metadata: jsonb("metadata"),

  parserConfigId: uuid("parser_config_id"),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

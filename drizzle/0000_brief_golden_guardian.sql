CREATE TABLE "parser_configs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text,
	"name" text,
	"rules" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "receipts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"merchat" text,
	"merchant_brand" text,
	"total" numeric,
	"currency" text DEFAULT 'EUR',
	"date" timestamp,
	"time" text,
	"category" text,
	"raw_text" text,
	"items" jsonb,
	"tax" jsonb,
	"metadata" jsonb,
	"parser_config_id" uuid,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now()
);

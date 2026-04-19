CREATE SCHEMA IF NOT EXISTS app;
--> statement-breakpoint
CREATE OR REPLACE FUNCTION app.current_user_id()
RETURNS text
LANGUAGE sql
STABLE
AS $$
  SELECT nullif(current_setting('app.current_user_id', true), '');
$$;
--> statement-breakpoint
ALTER TABLE "receipts" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "receipts" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
DROP POLICY IF EXISTS "receipts_select_own" ON "receipts";
--> statement-breakpoint
DROP POLICY IF EXISTS "receipts_insert_own" ON "receipts";
--> statement-breakpoint
DROP POLICY IF EXISTS "receipts_update_own" ON "receipts";
--> statement-breakpoint
DROP POLICY IF EXISTS "receipts_delete_own" ON "receipts";
--> statement-breakpoint
CREATE POLICY "receipts_select_own"
ON "receipts"
FOR SELECT
USING ("user_id" = app.current_user_id());
--> statement-breakpoint
CREATE POLICY "receipts_insert_own"
ON "receipts"
FOR INSERT
WITH CHECK ("user_id" = app.current_user_id());
--> statement-breakpoint
CREATE POLICY "receipts_update_own"
ON "receipts"
FOR UPDATE
USING ("user_id" = app.current_user_id())
WITH CHECK ("user_id" = app.current_user_id());
--> statement-breakpoint
CREATE POLICY "receipts_delete_own"
ON "receipts"
FOR DELETE
USING ("user_id" = app.current_user_id());
--> statement-breakpoint
ALTER TABLE "parser_configs" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "parser_configs" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
DROP POLICY IF EXISTS "parser_configs_select_own" ON "parser_configs";
--> statement-breakpoint
DROP POLICY IF EXISTS "parser_configs_insert_own" ON "parser_configs";
--> statement-breakpoint
DROP POLICY IF EXISTS "parser_configs_update_own" ON "parser_configs";
--> statement-breakpoint
DROP POLICY IF EXISTS "parser_configs_delete_own" ON "parser_configs";
--> statement-breakpoint
CREATE POLICY "parser_configs_select_own"
ON "parser_configs"
FOR SELECT
USING ("user_id" = app.current_user_id());
--> statement-breakpoint
CREATE POLICY "parser_configs_insert_own"
ON "parser_configs"
FOR INSERT
WITH CHECK ("user_id" = app.current_user_id());
--> statement-breakpoint
CREATE POLICY "parser_configs_update_own"
ON "parser_configs"
FOR UPDATE
USING ("user_id" = app.current_user_id())
WITH CHECK ("user_id" = app.current_user_id());
--> statement-breakpoint
CREATE POLICY "parser_configs_delete_own"
ON "parser_configs"
FOR DELETE
USING ("user_id" = app.current_user_id());

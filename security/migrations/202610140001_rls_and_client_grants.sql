-- REVIEW DRAFT: NEST (zmoxhgjsztrcbsspleuz). Not applied to production.
-- Business tables are reached through authorized server code; no client policies are needed.
-- Confirm deployment callers and rerun a fresh catalog audit before release.
BEGIN;
SET LOCAL lock_timeout='3s';
SET LOCAL statement_timeout='30s';
DO $preflight$
DECLARE target text; relation_oid oid;
BEGIN
  FOREACH target IN ARRAY ARRAY['_prisma_migrations'] LOOP
    SELECT c.oid INTO relation_oid FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relname=target AND c.relkind IN ('r','p');
    IF relation_oid IS NULL THEN RAISE EXCEPTION 'Reviewed relation missing: public.%',target; END IF;
    IF EXISTS(SELECT 1 FROM pg_policy WHERE polrelid=relation_oid) THEN RAISE EXCEPTION 'Policy drift on public.%; review before migration',target; END IF;
  END LOOP;
END $preflight$;

ALTER TABLE public."_prisma_migrations" ENABLE ROW LEVEL SECURITY;
REVOKE ALL PRIVILEGES ON TABLE public."_prisma_migrations" FROM PUBLIC, anon, authenticated;
REVOKE SELECT ("id", "checksum", "finished_at", "migration_name", "logs", "rolled_back_at", "started_at", "applied_steps_count"), INSERT ("id", "checksum", "finished_at", "migration_name", "logs", "rolled_back_at", "started_at", "applied_steps_count"), UPDATE ("id", "checksum", "finished_at", "migration_name", "logs", "rolled_back_at", "started_at", "applied_steps_count"), REFERENCES ("id", "checksum", "finished_at", "migration_name", "logs", "rolled_back_at", "started_at", "applied_steps_count") ON TABLE public."_prisma_migrations" FROM PUBLIC, anon, authenticated;

-- Actual application creator is postgres. Other creators need a separately reviewed change.
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public REVOKE ALL ON TABLES FROM PUBLIC, anon, authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public REVOKE ALL ON SEQUENCES FROM PUBLIC, anon, authenticated;
-- Built-in PUBLIC EXECUTE is global, so a schema-only revoke would not remove it.
ALTER DEFAULT PRIVILEGES FOR ROLE postgres REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public REVOKE EXECUTE ON FUNCTIONS FROM anon, authenticated;
COMMIT;

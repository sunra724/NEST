-- Isolated catalog reconstruction. No production rows, triggers, indexes or API stack copied.
-- Run ONLY in the disposable local test database. Production schema truth: evidence/zmoxhgjsztrcbsspleuz.json.
CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS extensions;
GRANT USAGE ON SCHEMA public, extensions, auth TO anon, authenticated, service_role, audit_backend;
CREATE TABLE public."_prisma_migrations" (
  "id" character varying(36) NOT NULL,
  "checksum" character varying(64) NOT NULL,
  "finished_at" timestamp with time zone,
  "migration_name" character varying(255) NOT NULL,
  "logs" text,
  "rolled_back_at" timestamp with time zone,
  "started_at" timestamp with time zone DEFAULT now() NOT NULL,
  "applied_steps_count" integer DEFAULT 0 NOT NULL
);
ALTER TABLE public."_prisma_migrations" ADD CONSTRAINT "_prisma_migrations_pkey" PRIMARY KEY (id);
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role, audit_backend;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role, audit_backend;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT EXECUTE ON FUNCTIONS TO anon, authenticated, service_role;

CREATE EXTENSION IF NOT EXISTS pgtap WITH SCHEMA extensions;

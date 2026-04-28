create table if not exists public.dashboard_documents (
  key text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now(),
  constraint dashboard_documents_key_check check (
    key in (
      'overview',
      'kpi',
      'budget',
      'timeline',
      'program-n',
      'program-e',
      'program-s',
      'program-t',
      'changelog'
    )
  )
);

alter table public.dashboard_documents enable row level security;

create or replace function public.set_dashboard_documents_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_dashboard_documents_updated_at on public.dashboard_documents;

create trigger set_dashboard_documents_updated_at
before update on public.dashboard_documents
for each row
execute function public.set_dashboard_documents_updated_at();

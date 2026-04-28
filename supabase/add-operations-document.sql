alter table public.dashboard_documents
drop constraint if exists dashboard_documents_key_check;

alter table public.dashboard_documents
add constraint dashboard_documents_key_check check (
  key in (
    'overview',
    'kpi',
    'budget',
    'timeline',
    'program-n',
    'program-e',
    'program-s',
    'program-t',
    'operations',
    'changelog'
  )
);

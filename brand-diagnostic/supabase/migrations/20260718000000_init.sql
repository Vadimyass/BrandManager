create table diagnostics (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  input jsonb not null,
  gate jsonb,
  result jsonb not null,
  validator jsonb,
  usage jsonb,
  latency_ms int,
  feedback text check (feedback in ('accurate', 'miss')),
  feedback_at timestamptz
);

create table waitlist (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  email text not null unique,
  diagnostic_id uuid references diagnostics(id)
);

alter table diagnostics enable row level security;
alter table waitlist enable row level security;
-- Нет политик намеренно: доступ только через service role из Edge Function.

-- Воронка: одно событие = один шаг. session_id генерит клиент (случайный), чтобы склеивать путь без аккаунтов.
create table events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  session_id text not null,
  name text not null,
  props jsonb,
  niche text,
  referrer text
);

create index events_name_idx on events (name);
create index events_session_idx on events (session_id);

alter table events enable row level security;
-- Политик нет: пишет только Edge Function через service role.

-- Скользящее окно для рейт-лимита дорогих (LLM) роутов. Пишет/читает только Edge Function.
create table rate_limits (
  id uuid primary key default gen_random_uuid(),
  key text not null,
  created_at timestamptz not null default now()
);
create index rate_limits_key_idx on rate_limits (key, created_at);

alter table rate_limits enable row level security;

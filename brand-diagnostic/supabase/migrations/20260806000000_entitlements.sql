-- Покупки/доступы. Пишет только Edge Function (service role, вебхук провайдера) — RLS без
-- политик на запись. Залогиненный читает свои по user_id; проверка по email идёт через функцию.
create table entitlements (
  id uuid primary key default gen_random_uuid(),
  email text,
  user_id uuid references auth.users (id) on delete set null,
  product text not null,
  provider text not null,
  status text not null default 'active',
  external_id text,
  amount numeric,
  currency text,
  created_at timestamptz not null default now()
);

create index entitlements_user_idx on entitlements (user_id);
create index entitlements_email_idx on entitlements (email);
create unique index entitlements_ext_idx on entitlements (provider, external_id);

alter table entitlements enable row level security;

create policy "read own entitlements" on entitlements
  for select using (auth.uid() = user_id);

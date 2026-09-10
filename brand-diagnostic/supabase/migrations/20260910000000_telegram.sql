-- Связка Telegram ↔ профиль Melyo. Пишет/читает только Edge Function (service role),
-- поэтому RLS включён без политик — прямой доступ анону закрыт.

-- Одноразовые токены для deep-link: фронт (через свой JWT → роут tg-token) заводит токен,
-- бот его гасит при /start.
create table telegram_tokens (
  token text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  used boolean not null default false,
  created_at timestamptz not null default now()
);
create index telegram_tokens_user_idx on telegram_tokens (user_id);

-- Активная связка чата с пользователем.
create table telegram_links (
  chat_id bigint primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create index telegram_links_user_idx on telegram_links (user_id);

alter table telegram_tokens enable row level security;
alter table telegram_links enable row level security;

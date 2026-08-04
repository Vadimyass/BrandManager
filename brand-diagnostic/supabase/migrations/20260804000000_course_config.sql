-- Правила построения курса (веса). Одна строка (id=1). Читает/пишет только service role
-- через Edge Function: RLS включён, политик нет — публичного доступа к таблице нет.
create table course_config (
  id int primary key default 1,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  constraint course_config_singleton check (id = 1)
);

alter table course_config enable row level security;

# Аналитика теста

Все события пишутся в таблицу `events` (Supabase). Один `session_id` (случайный, в localStorage) склеивает путь одного человека без аккаунтов. Смотреть — Supabase → SQL Editor, запросы ниже.

## Воронка событий

| Событие | Когда |
|---|---|
| `landed` | открыл сайт |
| `niche_picked` | выбрал нишу (props.niche) |
| `seed_done` | прошёл разминочные свайпы |
| `tradeoffs_done` | прошёл дилеммы |
| `diagnosis_shown` | увидел диагноз (props.weakness) |
| `share_clicked` / `share_done` | нажал/завершил «Поделиться» |
| `feedback` | точно/мимо (props.verdict) |
| `email_captured` | оставил почту (props.intent: plan/purchase) |
| `offer_viewed` | открыл «Что в курсе» |
| `course_opened` | открыл курс |
| `buy_clicked` | нажал «Оплатить» |

## Главный вопрос теста (гейт Go/No-Go)

Шарят ли результат и оставляют ли почту. Одним запросом:

```sql
with sessions as (select count(distinct session_id) n from events where name='diagnosis_shown')
select
  (select n from sessions) as дошли_до_диагноза,
  (select count(distinct session_id) from events where name='share_done') as поделились,
  (select count(distinct session_id) from events where name='email_captured') as оставили_почту,
  (select count(distinct session_id) from events where name='buy_clicked') as нажали_оплатить;
```

## Воронка активации (где отваливаются)

```sql
select name, count(distinct session_id) as людей
from events
where name in ('landed','niche_picked','seed_done','tradeoffs_done','diagnosis_shown','course_opened')
group by name
order by людей desc;
```

Ключевая метрика активации = `diagnosis_shown` / `landed`. Если проседает между `seed_done` и `tradeoffs_done` — фрикшн в дилеммах.

## Срез по нишам и слепым зонам

```sql
select props->>'weakness' as слепая_зона, count(*) from events where name='diagnosis_shown' group by 1 order by 2 desc;
select niche, count(distinct session_id) from events where name='niche_picked' group by 1 order by 2 desc;
```

## Пороги зелёного света (ориентир из ТЗ)

- Активация (дошли до диагноза от зашедших): **≥ 60%**.
- Доля поделившихся ИЛИ оставивших почту среди увидевших диагноз: **это и есть сигнал ценности** — на 10–30 людях смотри не процент, а живую реакцию и фидбек «точно/мимо».
- `buy_clicked` среди увидевших оффер: ранний замер готовности платить.

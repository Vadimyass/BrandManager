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
| `lesson_viewed` | открыл урок (props.human = номер, props.total) |
| `homework_graded` | сдал домашку (props.index, props.score) |
| `course_completed` | дошёл до последнего урока |
| `buy_clicked` | нажал «Оплатить» |

## Открыли ли курс и докуда дошли (главное для взвешивания фидбека)

```sql
-- Сколько человек открыли курс и как глубоко зашли
select
  count(distinct session_id) filter (where name='course_opened') as открыли_курс,
  count(distinct session_id) filter (where name='lesson_viewed') as начали_урок,
  count(distinct session_id) filter (where name='course_completed') as прошли_до_конца,
  count(distinct session_id) filter (where name='homework_graded') as сдали_домашку;

-- Докуда дошёл КАЖДЫЙ (максимальный номер урока по сессии)
select session_id, max((props->>'human')::int) as дошёл_до_урока, max((props->>'total')::int) as всего
from events where name='lesson_viewed'
group by session_id order by дошёл_до_урока desc;
```

Читать так: если человек дал фидбек, но `дошёл_до_урока` = 1 — его мнение про курс поверхностное (глянул и закрыл). Если 6–8 из 8 — это глубокий, весомый фидбек.

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

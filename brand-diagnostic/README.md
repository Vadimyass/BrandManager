# Brand Diagnostic

AI-диагностика зрелости бренда для инди-разработчиков. Статичный фронт (GitHub Pages) + Supabase Edge Function как AI-прокси через OpenRouter.

## Архитектура

```
Браузер → Supabase Edge Function `api` → OpenRouter → модели
              │
              └── Postgres: diagnostics, waitlist
```

Пайплайн одной диагностики: **гейт ввода** (дешёвая модель, отсекает мусор, может вернуть уточняющий вопрос) → **ассессор** (Sonnet, оценка по рубрике) → **валидатор** (Haiku, проверяет конкретность и обоснованность; при отказе — один пересчёт). Правило «уровень = слабейшая ось» enforced в коде, не доверено модели. Самооценка юзера в промпт не попадает — только для контраста на экране результата.

## Запуск

### 1. Supabase

```bash
npm i -g supabase
supabase login
supabase link --project-ref <PROJECT_REF>   # проект создать на supabase.com
supabase db push
supabase secrets set OPENROUTER_API_KEY=sk-or-...
supabase functions deploy api
```

Модели можно переопределить без деплоя кода:

```bash
supabase secrets set MODEL_ASSESSOR=anthropic/claude-sonnet-4.6 MODEL_GATE=deepseek/deepseek-chat MODEL_VALIDATOR=anthropic/claude-haiku-4.5
```

Актуальные ID моделей сверяй на openrouter.ai/models — дефолты в `supabase/functions/api/llm.ts` могли устареть.

### 2. Локальная разработка

```bash
npm install
cp .env.example .env   # вписать URL и anon key из Supabase → Settings → API
npm run dev
```

### 3. GitHub Pages

1. Запушить репозиторий на GitHub (ветка `main`).
2. Repo → Settings → Secrets and variables → Actions: добавить `VITE_SUPABASE_URL` и `VITE_SUPABASE_ANON_KEY`.
3. Repo → Settings → Pages → Source: **GitHub Actions**.
4. Пуш в `main` деплоит автоматически.

При переезде на свой домен/хостинг: убрать `GH_PAGES_BASE` из workflow (base станет `/`), больше ничего не меняется.

## Данные

- `diagnostics` — полный лог каждой диагностики: ввод, вердикт гейта, результат, отчёт валидатора, usage токенов, латентность, фидбек «точно/мимо».
- `waitlist` — email + ссылка на диагностику.

Смотреть: Supabase → Table Editor. Калибровка: фильтр `feedback = 'miss'` → читать `input` против `result`.

## TODO (за рамками этой итерации)

- Prompt caching рубрики через OpenRouter (экономия на объёмах, на Фазе 0 не критично)
- OG-image шаринг-карточка результата
- Rate limiting на функции (пока публичная, лимит = здравый смысл беты)

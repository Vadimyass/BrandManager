# Логин через Google + личный кабинет

Вход по Google, прогресс хранится в таблице `progress` (Supabase), читается/пишется только самим пользователем через RLS. Основной поток (диагностика/курс) как раньше идёт через Edge Function — авторизация на него не влияет.

## Настройка (один раз)

### 1. Google OAuth-приложение
1. console.cloud.google.com → создай проект (или возьми существующий).
2. APIs & Services → OAuth consent screen → External, заполни название и почту поддержки.
3. Credentials → Create credentials → OAuth client ID → тип **Web application**.
4. **Authorized redirect URIs** — добавь строго этот адрес (из Supabase, шаг 2):
   `https://<PROJECT_REF>.supabase.co/auth/v1/callback`
5. Скопируй **Client ID** и **Client secret**.

### 2. Supabase
1. Dashboard → Authentication → Providers → **Google** → включить, вставить Client ID и Secret.
2. Authentication → URL Configuration → **Redirect URLs**: добавь адрес фронта
   `https://vadimyass.github.io/BrandManager/`
   (и `http://localhost:5173/` для локальной разработки).
3. Применить миграцию прогресса:
   ```bash
   cd brand-diagnostic
   supabase db push
   ```

### 3. Фронт
Ничего не надо — `VITE_SUPABASE_URL` и `VITE_SUPABASE_ANON_KEY` уже есть (те же, что для аналитики). Пуш в main задеплоит.

## Как работает

- Кнопка «Войти через Google» (верхний правый угол) → редирект в Google → назад на сайт, сессия подхватывается автоматически.
- После входа появляется «Кабинет»: последний диагноз (слепая зона + суперсила), прогресс по курсу (N из M уроков), баллы за домашки.
- Прогресс пишется в `progress.data` (jsonb) при: показе диагноза, открытии урока, сдаче домашки. Только для залогиненных — гость проходит как раньше, без сохранения.

## Данные

- `progress`: `user_id` (= auth.users.id), `data` (jsonb: weaknessAxis, weaknessLabel, superLabel, courseAxis, maxLesson, total, homework, updatedAt), `updated_at`.
- RLS: каждый видит и меняет только свою строку. Service role (Edge Function) сюда не пишет.

## На потом

- Связать `diagnostics`/`waitlist` с `user_id` (сейчас они анонимные по session_id).
- Стрик и ежедневная цель (Duolingo) — поверх `progress`.
- Сохранение прогресса гостя и «подтягивание» его в аккаунт при первом входе.

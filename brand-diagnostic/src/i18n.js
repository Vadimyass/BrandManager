// Локализация. База — украинский; авто по языку системы (uk/ru/en), можно переключить вручную.
const SUPPORTED = ["uk", "ru", "en"];
const KEY = "bd_lang";

function detect() {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved && SUPPORTED.includes(saved)) return saved;
  } catch { /* ignore */ }
  const sys = (navigator.language || "uk").slice(0, 2).toLowerCase();
  if (sys === "ru") return "ru";
  if (sys === "en") return "en";
  return "uk"; // база
}

let current = detect();

export function getLang() { return current; }
export function setLang(l) {
  if (!SUPPORTED.includes(l)) return;
  current = l;
  try { localStorage.setItem(KEY, l); } catch { /* ignore */ }
  if (typeof window !== "undefined") window.location.reload(); // простой путь: перерисовать всё
}
export const LANGS = [
  { code: "uk", label: "УКР" },
  { code: "ru", label: "РУС" },
  { code: "en", label: "ENG" },
];
// Имя языка для промптов бэкенда (на каком языке AI должен отвечать).
export const LANG_NAME = { uk: "украинском", ru: "русском", en: "English" };

// Словарь. Ключ → перевод по языкам. Растёт по мере локализации экранов.
const T = {
  // общие
  login: { uk: "Увійти", ru: "Войти", en: "Log in" },
  logout: { uk: "Вийти", ru: "Выйти", en: "Log out" },
  cabinet: { uk: "Кабінет", ru: "Кабинет", en: "Dashboard" },
  back: { uk: "Назад", ru: "Назад", en: "Back" },
  next: { uk: "Далі", ru: "Дальше", en: "Next" },
  start: { uk: "Почати", ru: "Начать", en: "Start" },
  // welcome
  wl_bubble: { uk: "Десять дилем — і я скажу, де у твого бізнесу дірка.", ru: "Десять дилемм — и я скажу, где у твоего бизнеса дыра.", en: "Ten dilemmas — and I'll show where your business leaks." },
  wl_h1: { uk: "Знайди свою суперсилу в бізнесі за 5 хвилин", ru: "Найди свою суперсилу в бизнесе за 5 минут", en: "Find your business superpower in 5 minutes" },
  wl_sub: { uk: "Не тест із правильними відповідями, а колода дилем «або-або». Ти обираєш, чим жертвуєш — я показую сліпу зону і збираю план навчання.", ru: "Не тест с правильными ответами, а колода дилемм «или-или». Ты выбираешь, чем жертвуешь — я показываю слепую зону и собираю план обучения.", en: "Not a test with right answers, but a deck of either/or dilemmas. You choose what to sacrifice — I reveal your blind spot and build a learning plan." },
  wl_dilemmas: { uk: "дилем", ru: "дилемм", en: "dilemmas" },
  wl_minicourses: { uk: "міні-курсів", ru: "мини-курсов", en: "mini-courses" },
  wl_minlesson: { uk: "хвилини на урок", ru: "минуты на урок", en: "min per lesson" },
  wl_begin: { uk: "Почнемо", ru: "Начнём", en: "Let's begin" },
  wl_savenote: { uk: "Результат діагностики збережемо у твій профіль.", ru: "Результат диагностики сохраним в твой профиль.", en: "We'll save your diagnostic result to your profile." },
  wl_google: { uk: "Увійти через Google", ru: "Войти через Google", en: "Continue with Google" },
  wl_guest: { uk: "Продовжити гостем", ru: "Продолжить гостем", en: "Continue as guest" },
  wl_fine: { uk: "Гостьовий прогрес живе в цьому браузері — вхід можна додати пізніше.", ru: "Гостевой прогресс живёт в этом браузере — вход можно добавить позже.", en: "Guest progress lives in this browser — you can sign in later." },
  wl_orread: { uk: "або почитати безкоштовно", ru: "или почитать бесплатно", en: "or read for free" },
  min: { uk: "хв", ru: "мин", en: "min" },
  // онбординг
  ob_niche_q: { uk: "Чим займаєшся?", ru: "Чем занимаешься?", en: "What are you building?" },
  ob_name_q: { uk: "Як називається твій проєкт?", ru: "Как называется твой проект?", en: "What's your project called?" },
  ob_name_sub: { uk: "Необов'язково — але так розбір звертатиметься до нього на ім'я.", ru: "Необязательно — но так разбор будет обращаться к нему по имени.", en: "Optional — but the analysis will address it by name." },
  ob_name_ph: { uk: "Назва проєкту", ru: "Название проекта", en: "Project name" },
  step_of: { uk: "Крок", ru: "Шаг", en: "Step" },
  step_of2: { uk: "з", ru: "из", en: "of" },
};

export function t(key) {
  const row = T[key];
  if (!row) return key;
  return row[current] ?? row.uk ?? key;
}

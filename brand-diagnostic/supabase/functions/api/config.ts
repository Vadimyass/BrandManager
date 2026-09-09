// Правила построения курса как данные с весами. Веса 1–100 задают СИЛУ правила
// в промпте (порог + интенсивность). Сложность — отдельная кривая по ходу курса.
// Редактор: public/rules-lab.html. Хранилище: таблица course_config (одна строка).

export interface RuleItem {
  id: string;
  name: string;
  category: string;
  weight: number; // 0..100
  enabled: boolean;
  text: string;
}

// Масштаб курса: focus — короткий курс по одному слабому месту (текущее поведение);
// global — большая программа из модулей по всем осям (готовим бек на будущее).
export type CourseScope = "focus" | "global";

// Модуль глобальной программы. axis — ось (product|marketing|operations|brand).
// lessons: 0 = взять весь план оси; >0 = ограничить число уроков модуля.
export interface CourseModule {
  id: string;
  axis: string;
  title: string;
  levelFrom: number; // 1..5
  levelTo: number; // 1..5
  lessons: number; // 0 = весь план оси
  enabled: boolean;
}

export interface CourseConfig {
  version: number;
  engine: "melio" | "weights"; // melio — агент-наставник; weights — старый движок по весам
  scope: CourseScope; // focus — один слабый axis; global — программа из модулей
  difficulty: { start: number; end: number }; // 1..100 на первом и последнем уроке
  rules: RuleItem[];
  modules?: CourseModule[]; // план глобального курса (для scope=global); порядок = порядок прохождения
}

// Шаблон глобальной программы: полный путь по всем осям в разумном порядке.
// Пока не активен по умолчанию (scope=focus) — включается флагом scope=global.
export const DEFAULT_PROGRAM: CourseModule[] = [
  { id: "m-product", axis: "product", title: "Продукт", levelFrom: 1, levelTo: 5, lessons: 0, enabled: true },
  { id: "m-marketing", axis: "marketing", title: "Маркетинг", levelFrom: 1, levelTo: 5, lessons: 0, enabled: true },
  { id: "m-brand", axis: "brand", title: "Бренд", levelFrom: 1, levelTo: 5, lessons: 0, enabled: true },
  { id: "m-operations", axis: "operations", title: "Операционка", levelFrom: 1, levelTo: 5, lessons: 0, enabled: true },
];

export const DEFAULT_CONFIG: CourseConfig = {
  version: 1,
  engine: "melio",
  scope: "focus",
  difficulty: { start: 35, end: 85 },
  rules: [
    { id: "plain_language", name: "Простой язык", category: "Язык", weight: 85, enabled: true, text: "Пиши простыми словами, как для друга без бизнес-образования. Без аббревиатур и жаргона (MRR, LTV, CAC, churn, retention, UX, юнит-экономика) — только человеческие слова." },
    { id: "money_uah", name: "Деньги в $/₴", category: "Язык", weight: 75, enabled: true, text: "Аудитория — украинский рынок. Суммы в долларах ($) или гривнах (₴), никогда в рублях; без российских реалий." },
    { id: "brevity", name: "Коротко, по чуть-чуть", category: "Подача", weight: 85, enabled: true, text: "Короткие предложения, минимум слов, одна мысль на шаг. Никаких длинных абзацев — человек читает урок по чуть-чуть, шаг за шагом." },
    { id: "warmth_melio", name: "Тёплый тон Мелио", category: "Тон", weight: 70, enabled: true, text: "Ты — Мелио: тёплый дружелюбный наставник, который сидит рядом. Обращайся на «ты», без менторства и лозунгов." },
    { id: "personalization", name: "Про его дело", category: "Персонализация", weight: 90, enabled: true, text: "Говори про ИМЕННО его дело и нишу: примеры и задание — из его продукта. Держи в фокусе его слабое место." },
    { id: "story_concrete", name: "Истории с цифрами", category: "Истории", weight: 80, enabled: true, text: "Главная история урока — из данного блока фактов, с её реальными цифрами. Не выдумывай факты и не тащи штампы из других уроков." },
    { id: "extra_example", name: "Доп. пример", category: "Истории", weight: 45, enabled: true, text: "Можно добавить максимум 1 короткий пример другого бренда без цифр (или ни одного)." },
    { id: "anti_repeat", name: "Без повторов", category: "Прогрессия", weight: 80, enabled: true, text: "Не повторяй понятия, истории и примеры из прошлых уроков — иди дальше и глубже." },
    { id: "quiz_new_situation", name: "Квиз: новая ситуация", category: "Квиз", weight: 85, enabled: true, text: "Квиз — это НОВАЯ конкретная мини-ситуация (лучше из ниши пользователя), а не пересказ истории и шагов урока." },
    { id: "quiz_trap", name: "Квиз: ловушка", category: "Квиз", weight: 85, enabled: true, text: "Оба варианта звучат разумно; неверный — привлекательная ловушка «логично, но не работает». Запрещены очевидные пары «книжно-правильно / явно глупо». В explain объясни, почему заманчивый вариант проигрывает." },
    { id: "both_valid", name: "И то, и то", category: "Подача", weight: 80, enabled: true, text: "В бизнесе редко один ответ верен, а другой глуп — чаще оба рабочие, а разница в том, ЧТО подходит под ситуацию, цель и этап. Объясняй не «делай X вместо Y», а «и X, и Y рабочие — вот когда какой». В квизе неверный вариант — не глупость, а подход, который здесь просто не к месту; в explain признай его сильную сторону и скажи, когда сработал бы именно он." },
    { id: "task_applied", name: "Задание на его продукте", category: "Задание", weight: 70, enabled: true, text: "task — конкретное простое действие с ЕГО продуктом в ЕГО нише." },
  ],
};

// Порог + интенсивность: чем выше вес, тем настойчивее правило; ниже порога — молчим.
export function intensityPrefix(weight: number): string | null {
  if (weight < 12) return null;
  if (weight < 35) return "Желательно";
  if (weight < 65) return "Важно";
  if (weight < 88) return "ОБЯЗАТЕЛЬНО";
  return "КРИТИЧЕСКИ ВАЖНО (в первую очередь)";
}

export function buildRulesBlock(rules: RuleItem[]): string {
  const lines = rules
    .filter((r) => r.enabled && r.weight >= 12)
    .slice()
    .sort((a, b) => b.weight - a.weight)
    .map((r) => {
      const p = intensityPrefix(r.weight);
      return p ? `- [${p}] ${r.text}` : null;
    })
    .filter(Boolean);
  return lines.join("\n");
}

// Целевая сложность урока на его позиции в курсе (линейная кривая start→end).
export function difficultyLevel(pos: number, total: number, cfg: CourseConfig): number {
  const { start, end } = cfg.difficulty;
  if (total <= 1) return Math.round(end);
  const k = Math.min(Math.max(pos, 0), total - 1) / (total - 1);
  return Math.round(start + (end - start) * k);
}

export function difficultyPhrase(level: number): string {
  if (level < 25) return "очень просто, для полного новичка; квиз мягкий, но не пустой";
  if (level < 45) return "просто; квиз с одной небольшой ловушкой";
  if (level < 65) return "средне; квиз требует применить идею к новой ситуации";
  if (level < 82) return "сложно; квиз с неочевидной развязкой, интуитивный ответ часто неверен";
  return "очень сложно; тонкие различия, интуиция обычно подводит";
}

export function difficultyLine(pos: number, total: number, cfg: CourseConfig): string {
  const lvl = difficultyLevel(pos, total, cfg);
  return `ЦЕЛЕВАЯ СЛОЖНОСТЬ ЭТОГО УРОКА: ${lvl}/100 — ${difficultyPhrase(lvl)}. Держи планку ровно на этом уровне: не проще и не сложнее.`;
}

// Слить сохранённый конфиг с дефолтом (на случай отсутствия полей).
export function normalizeConfig(raw: unknown): CourseConfig {
  const c = (raw ?? {}) as Partial<CourseConfig>;
  const diff = c.difficulty ?? DEFAULT_CONFIG.difficulty;
  const rules = Array.isArray(c.rules) && c.rules.length ? c.rules : DEFAULT_CONFIG.rules;
  const modules = Array.isArray(c.modules) && c.modules.length
    ? c.modules.map(normalizeModule)
    : undefined;
  return {
    version: c.version ?? DEFAULT_CONFIG.version,
    engine: c.engine === "weights" ? "weights" : "melio",
    scope: c.scope === "global" ? "global" : "focus",
    difficulty: {
      start: clamp(diff.start ?? 35),
      end: clamp(diff.end ?? 85),
    },
    rules: rules.map((r) => ({
      id: String(r.id ?? cryptoId()),
      name: String(r.name ?? "Правило"),
      category: String(r.category ?? "Прочее"),
      weight: clamp(Number(r.weight ?? 50)),
      enabled: r.enabled !== false,
      text: String(r.text ?? ""),
    })),
    ...(modules ? { modules } : {}),
  };
}

const VALID_AXES = new Set(["product", "marketing", "operations", "brand"]);
function normalizeModule(m: Partial<CourseModule>): CourseModule {
  const from = clampLevel(m.levelFrom ?? 1);
  const to = clampLevel(m.levelTo ?? 5);
  return {
    id: String(m.id ?? cryptoId()),
    axis: VALID_AXES.has(String(m.axis)) ? String(m.axis) : "marketing",
    title: String(m.title ?? "Модуль"),
    levelFrom: Math.min(from, to),
    levelTo: Math.max(from, to),
    lessons: Math.max(0, Math.floor(Number(m.lessons ?? 0)) || 0),
    enabled: m.enabled !== false,
  };
}
function clampLevel(n: number): number {
  return Math.min(5, Math.max(1, Math.round(Number(n) || 1)));
}

function clamp(n: number): number {
  return Math.min(100, Math.max(0, Math.round(Number(n) || 0)));
}
function cryptoId(): string {
  return "r" + Math.random().toString(36).slice(2, 8);
}

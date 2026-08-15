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

export interface CourseConfig {
  version: number;
  engine: "melio" | "weights"; // melio — агент-наставник; weights — старый движок по весам
  difficulty: { start: number; end: number }; // 1..100 на первом и последнем уроке
  rules: RuleItem[];
}

export const DEFAULT_CONFIG: CourseConfig = {
  version: 1,
  engine: "melio",
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
  return {
    version: c.version ?? DEFAULT_CONFIG.version,
    engine: c.engine === "weights" ? "weights" : "melio",
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
  };
}

function clamp(n: number): number {
  return Math.min(100, Math.max(0, Math.round(Number(n) || 0)));
}
function cryptoId(): string {
  return "r" + Math.random().toString(36).slice(2, 8);
}

import { llmJson, type LlmUsage } from "./llm.ts";

export interface SeedAnswer {
  id: string;
  q: string;
  answer: string;
}

export interface Calibration {
  industry: string;
  model: string;
  key_metric: string;
}

export interface TradeoffCard {
  id: string;
  situation: string;
  left: string;
  leftAxis: string;
  right: string;
  rightAxis: string;
}

export interface Decision {
  situation: string;
  chosen: string;
  chosenAxis: string;
  rejected: string;
  rejectedAxis: string;
}

export interface DiagnosisSide {
  axis: string;
  title: string;
  note: string;
}

export interface Diagnosis {
  diagnosis: string;
  superpower: DiagnosisSide;
  weakness: DiagnosisSide;
  axes: { key: string; name: string; score: number }[];
}

export interface Sprint {
  title: string;
  outcome: string;
}

export interface ValidationResult {
  approved: boolean;
  issues: string[];
}

export const AXES_KEYS = ["product", "marketing", "operations", "brand"];
export const AXIS_NAMES: Record<string, string> = {
  product: "Продукт",
  marketing: "Маркетинг",
  operations: "Операционка",
  brand: "Бренд",
};

const PLAIN_LANGUAGE_RULE = `ЯЗЫК: пиши простыми словами, как для друга без бизнес-образования. ЗАПРЕЩЕНЫ аббревиатуры и жаргон: MRR, LTV, CAC, churn, retention, burn rate, UX, лиды, performance, юнит-экономика и подобное. Вместо них — человеческие слова: «выручка в месяц», «клиенты уходят», «деньги тают быстрее, чем приходят», «постоянные клиенты».
ДЕНЬГИ: аудитория — украинский рынок. Суммы приводи в долларах ($) или гривнах (₴), НИКОГДА в рублях. Не упоминай российские реалии.`;

const CALIBRATOR_SYSTEM = `Ты — бизнес-аналитик. Пользователь назвал своё занятие своими словами и сделал пару выборов «или-или». Определи:
- industry: чем он занимается, ЕГО СЛОВАМИ, уточнённая формулировка (например «Дизайн-студия: логотипы на заказ», а не «SaaS»). Явно названному занятию доверяй больше, чем свайпам.
- model: B2B или B2C
- key_metric: главная цифра успеха этой ниши, сформулированная по-человечески (например «заказы в месяц», «повторные клиенты» — НЕ аббревиатуры).

${PLAIN_LANGUAGE_RULE}

Верни ТОЛЬКО JSON: {"industry":"...","model":"B2B|B2C","key_metric":"..."}`;

function generatorSystem(cal: Calibration): string {
  return `Ты — жёсткий кризис-менеджер в индустрии ${cal.industry} (${cal.model}). Сгенерируй 7 полярных бизнес-сценариев (trade-offs) для основателя.

Правила:
- Обе опции реалистичны и привлекательны, но каждая требует жертвы. Никаких очевидно правильных ответов.
- Каждая опция тестирует одну из осей: product (Продукт), marketing (Маркетинг), operations (Операционка), brand (Бренд). Пары осей в сценариях не должны повторяться подряд.
- Конкретика индустрии ${cal.industry}: реальные ситуации из жизни именно этого бизнеса, деньги, сроки, метрика «${cal.key_metric}».
- situation — сама дилемма одной фразой, до 90 знаков, без нумерации.
- Опции — до 60 знаков, живым языком.

${PLAIN_LANGUAGE_RULE}

Верни ТОЛЬКО JSON: {"cards":[{"situation":"...","left":"...","leftAxis":"ключ оси","right":"...","rightAxis":"ключ оси"}]}`;
}

// Вариант B (A/B): мягкий ситуативный опрос вместо дилемм «пожертвуй».
export interface SituationalQuestion {
  id: string;
  situation: string;
  options: { text: string; axis: string }[];
}

function generatorSituationalSystem(cal: Calibration): string {
  return `Ты — тёплый бизнес-наставник в индустрии ${cal.industry} (${cal.model}). Сгенерируй 7 мягких ситуативных вопросов, чтобы понять, КАК человек думает о своём деле — без осуждения и без вынужденной жертвы.

Правила:
- Каждый вопрос — короткая реальная ситуация из жизни этого бизнеса, по-доброму, на «ты».
- В КАЖДОМ вопросе РОВНО 4 варианта — **по одному на каждую ось**: product (Продукт), marketing (Маркетинг), operations (Операционка), brand (Бренд). Все 4 оси обязаны присутствовать в каждом вопросе, ни одну не пропускай. Порядок вариантов перемешивай между вопросами (не ставь маркетинг всегда третьим и т.п.).
- КАЖДЫЙ вариант — валидное, нормальное поведение (нет «глупых» и «правильных»). Человек просто выбирает самый честный для себя.
- Формулируй варианты так, чтобы ось НЕ считывалась в лоб: не пиши «займусь маркетингом» — опиши конкретное поведение («дам рекламу в сторис», «поправлю сам продукт», «отвечу каждому лично», «придумаю, чем я отличаюсь»).
- situation — до 100 знаков, живым тёплым языком. Вариант — до 70 знаков, полноценный однозначный ответ.
- Не давай понять, какой ответ «лучше». Тон — как у друга, которому интересно твоё дело.

${PLAIN_LANGUAGE_RULE}

Верни ТОЛЬКО JSON: {"questions":[{"situation":"...","options":[{"text":"...","axis":"ключ оси"},{"text":"...","axis":"ключ оси"},{"text":"...","axis":"ключ оси"},{"text":"...","axis":"ключ оси"}]}]}`;
}

export async function runGeneratorSituational(
  cal: Calibration,
  seed: SeedAnswer[],
  name: string | undefined,
  niche: string | undefined,
  usage: LlmUsage[],
  lang?: string,
): Promise<SituationalQuestion[]> {
  const res = await llmJson<{ questions: SituationalQuestion[] }>(
    "assessor",
    generatorSituationalSystem(cal) + langRule(lang),
    seedLog(seed, name, niche),
    usage,
    1600,
  );
  // По одному варианту на ось; берём вопросы, где покрыто минимум 3 оси (чтобы слепая зона
  // была выводом, а не следствием пропущенной оси).
  return (res.questions ?? [])
    .filter((q) => q?.situation && Array.isArray(q.options))
    .map((q, i) => {
      const seen = new Set<string>();
      const options: { text: string; axis: string }[] = [];
      for (const o of q.options ?? []) {
        if (o?.text && AXES_KEYS.includes(o.axis) && !seen.has(o.axis)) {
          seen.add(o.axis);
          options.push({ text: String(o.text), axis: o.axis });
        }
      }
      return { id: `s${i}`, situation: String(q.situation), options };
    })
    .filter((q) => q.options.length >= 3)
    .slice(0, 7)
    .map((q, i) => ({ ...q, id: `s${i}` }));
}

// Лог для Диагноста в мягком режиме: перечень выборов + подсчёт внимания по осям.
export function situationalLog(payload: {
  name?: string;
  niche?: string;
  calibration: Calibration;
  answers: { situation: string; chosen: string; chosenAxis: string }[];
}): string {
  const tally: Record<string, number> = { product: 0, marketing: 0, operations: 0, brand: 0 };
  for (const a of payload.answers) if (a.chosenAxis in tally) tally[a.chosenAxis]++;
  const lines = [
    `Проект: ${payload.name || "без названия"}${payload.niche ? ` · Занятие: ${payload.niche}` : ""} · Индустрия: ${payload.calibration.industry} (${payload.calibration.model})`,
    "",
    "Ответы на ситуативные вопросы (что человек выбрал как самое близкое):",
  ];
  payload.answers.forEach((a, i) => {
    lines.push(`${i + 1}. «${a.situation}» → «${a.chosen}» [${a.chosenAxis}]`);
  });
  lines.push(
    "",
    `Сколько раз выбрана каждая ось: Продукт ${tally.product}, Маркетинг ${tally.marketing}, Операционка ${tally.operations}, Бренд ${tally.brand}.`,
    "Ось, которую человек выбирает редко или никогда, — его слепая зона; ось, которую выбирает чаще всего, — суперсила.",
  );
  return lines.join("\n");
}

const DIAGNOST_SYSTEM = `Ты — топовый бизнес-консультант. Тебе дают лог решений фаундера в формате trade-off: что выбрал и чем пожертвовал. Найди системный паттерн мышления.

1. Суперсила — то, что он выбирает постоянно.
2. Слабое место — ось, которую он стабильно игнорирует (product, marketing, operations, brand).
3. Диагноз — ровно 3 предложения. НЕ в лоб: не начинай с «твоя слепая зона — <ось>» и вообще не называй ось-ярлык в диагнозе. Начни с неочевидного наблюдения о том, КАК он думает, покажи цену этого именно в его деле (что он из-за этого теряет), и лишь затем мягко подведи к сути. Тон уверенного, но доброго эксперта; бей по паттерну, не по личности; обращайся на «ты», ссылайся на конкретные его выборы.
4. Оцени каждую из 4 осей 1–5: сколько внимания фаундер ей уделяет.

ФОРМУЛИРОВКИ:
- weakness.title и superpower.title — это НЕ название оси, а конкретная поведенческая формулировка на «ты» (например «Надеешься, что найдут сами» вместо «Маркетинг», «Полируешь продукт в стол» вместо «Продукт»). 2–5 слов.
- note — что это даёт/чего стоит, 1 предложение, конкретно про его дело.

Если выборы противоречат друг другу — это и есть главная находка, назови её.

${PLAIN_LANGUAGE_RULE}

Верни ТОЛЬКО JSON: {"diagnosis":"3 предложения","superpower":{"axis":"ключ","title":"2–4 слова","note":"1 предложение"},"weakness":{"axis":"ключ","title":"2–4 слова","note":"1 предложение"},"axes":[{"key":"product","name":"Продукт","score":число},{"key":"marketing","name":"Маркетинг","score":число},{"key":"operations","name":"Операционка","score":число},{"key":"brand","name":"Бренд","score":число}]}`;

function methodistSystem(cal: Calibration): string {
  return `Ты — EdTech-методист. На основе диагноза фаундера составь план микро-обучения на первый месяц, закрывающий его слабое место. Индустрия: ${cal.industry} (${cal.model}), ключевая метрика: ${cal.key_metric}.

Сгенерируй 3 практических микро-спринта, которые закрывают ИМЕННО его конкретный паттерн (из формулировки слабого места и диагноза), а не общую тему-ось. Спринты должны отличаться друг от друга и подходить именно этому человеку — избегай шаблонных «изучи маркетинг / веди соцсети». Названия — конкретные шаги-решения в его нише, без общих слов и без «Неделя 1».

${PLAIN_LANGUAGE_RULE}

Верни ТОЛЬКО JSON: {"sprints":[{"title":"до 60 знаков","outcome":"что получит на выходе, 1 предложение"}]}`;
}

const VALIDATOR_SYSTEM = `Ты — валидатор качества бизнес-диагноза. На входе лог решений фаундера и JSON-диагноз.

Проверь:
1. Конкретность: диагноз ссылается на реальные решения из лога, не применим к любому человеку.
2. Тон: уверенный эксперт, бьёт по паттерну решений, но не унижает личность. Оскорбления и высокомерие — причина отклонить.
3. Полнота: суперсила, слабость, ровно 4 оси со score 1–5.
4. Логика: слабое место действительно следует из лога, не выдумано.
5. Простота языка: без аббревиатур и бизнес-жаргона (MRR, LTV, churn и т.п.). Жаргон — причина отклонить.

Верни ТОЛЬКО JSON: {"approved":true,"issues":[]} либо {"approved":false,"issues":["конкретная проблема"]}`;

function seedLog(seed: SeedAnswer[], name?: string, niche?: string): string {
  const lines = seed.map((s) => `- ${s.q} → выбрал: «${s.answer}»`);
  return [
    name ? `Название проекта: ${name}` : "",
    niche ? `Занятие (назвал сам): ${niche}` : "",
    "Выборы пользователя:",
    ...lines,
  ].filter(Boolean).join("\n");
}

export function decisionLog(payload: {
  name?: string;
  niche?: string;
  calibration: Calibration;
  decisions: Decision[];
  links?: Record<string, string>;
}): string {
  const lines = [
    `Проект: ${payload.name || "без названия"}${payload.niche ? ` · Занятие: ${payload.niche}` : ""} · Индустрия: ${payload.calibration.industry} (${payload.calibration.model}) · Метрика ниши: ${payload.calibration.key_metric}`,
    "",
    "Лог решений (trade-offs):",
  ];
  payload.decisions.forEach((d, i) => {
    lines.push(`${i + 1}. «${d.situation}» → выбрал: «${d.chosen}» [${d.chosenAxis}] · пожертвовал: «${d.rejected}» [${d.rejectedAxis}]`);
  });
  const links = Object.entries(payload.links ?? {}).filter(([, v]) => v?.trim());
  if (links.length) lines.push("", `Ссылки: ${links.map(([k, v]) => `${k}: ${v}`).join(" · ")}`);
  return lines.join("\n");
}

// Директива языка вывода. JSON-ключи не трогаем, локализуем только значения-тексты.
export function langRule(lang?: string): string {
  const name = lang === "ru" ? "русском" : lang === "en" ? "English (US)" : "украинском";
  return `\n\nЯЗЫК ОТВЕТА: пиши ВЕСЬ видимый пользователю текст (значения полей) на ${name} языке. Ключи JSON оставляй как в схеме.`;
}

export function runCalibrator(seed: SeedAnswer[], name: string | undefined, niche: string | undefined, usage: LlmUsage[], lang?: string): Promise<Calibration> {
  return llmJson<Calibration>("gate", CALIBRATOR_SYSTEM + langRule(lang), seedLog(seed, name, niche), usage, 250);
}

export async function runGenerator(cal: Calibration, seed: SeedAnswer[], name: string | undefined, niche: string | undefined, usage: LlmUsage[], lang?: string): Promise<TradeoffCard[]> {
  const res = await llmJson<{ cards: TradeoffCard[] }>("assessor", generatorSystem(cal) + langRule(lang), seedLog(seed, name, niche), usage, 1600);
  return (res.cards ?? [])
    .filter((c) => c?.situation && c?.left && c?.right && AXES_KEYS.includes(c.leftAxis) && AXES_KEYS.includes(c.rightAxis))
    .slice(0, 7)
    .map((c, i) => ({ ...c, id: `t${i}` }));
}

export function runDiagnost(log: string, usage: LlmUsage[], rejectionIssues?: string[], lang?: string): Promise<Diagnosis> {
  let user = log;
  if (rejectionIssues?.length) {
    user += `\n\nПредыдущий диагноз отклонён валидатором:\n- ${rejectionIssues.join("\n- ")}\nСделай новый, устранив проблемы.`;
  }
  return llmJson<Diagnosis>("assessor", DIAGNOST_SYSTEM + langRule(lang), user, usage, 1200);
}

export function runDiagValidator(log: string, diagnosis: Diagnosis, usage: LlmUsage[]): Promise<ValidationResult> {
  const user = `ЛОГ РЕШЕНИЙ:\n${log}\n\nДИАГНОЗ:\n${JSON.stringify(diagnosis)}`;
  return llmJson<ValidationResult>("validator", VALIDATOR_SYSTEM, user, usage, 500);
}

export async function runMethodist(diagnosis: Diagnosis, cal: Calibration, usage: LlmUsage[], lang?: string): Promise<Sprint[]> {
  const user = `Диагноз: ${diagnosis.diagnosis}\nСлабое место: ${diagnosis.weakness.title} (${AXIS_NAMES[diagnosis.weakness.axis] ?? diagnosis.weakness.axis}) — ${diagnosis.weakness.note}`;
  const res = await llmJson<{ sprints: Sprint[] }>("assessor", methodistSystem(cal) + langRule(lang), user, usage, 700);
  return (res.sprints ?? []).filter((s) => s?.title).slice(0, 3);
}

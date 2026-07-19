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

const CALIBRATOR_SYSTEM = `Ты — бизнес-аналитик. Пользователь сделал несколько выборов в формате «или-или». По ним определи:
- industry: индустрия (GameDev, Мобильные приложения, SaaS, E-commerce, Услуги/Агентство, Локальный бизнес, Личный бренд, Другое)
- model: B2B или B2C
- key_metric: главная метрика этой ниши (одна, конкретная)

Верни ТОЛЬКО JSON: {"industry":"...","model":"B2B|B2C","key_metric":"..."}`;

function generatorSystem(cal: Calibration): string {
  return `Ты — жёсткий кризис-менеджер в индустрии ${cal.industry} (${cal.model}). Сгенерируй 7 полярных бизнес-сценариев (trade-offs) для основателя.

Правила:
- Обе опции реалистичны и привлекательны, но каждая требует жертвы. Никаких очевидно правильных ответов.
- Каждая опция тестирует одну из осей: product (Продукт), marketing (Маркетинг), operations (Операционка), brand (Бренд). Пары осей в сценариях не должны повторяться подряд.
- Конкретика индустрии ${cal.industry}: реальные ситуации, деньги, сроки, метрика «${cal.key_metric}».
- situation — сама дилемма одной фразой, до 90 знаков, без нумерации.
- Опции — до 60 знаков, живым языком.

Верни ТОЛЬКО JSON: {"cards":[{"situation":"...","left":"...","leftAxis":"ключ оси","right":"...","rightAxis":"ключ оси"}]}`;
}

const DIAGNOST_SYSTEM = `Ты — топовый бизнес-консультант. Тебе дают лог решений фаундера в формате trade-off: что выбрал и чем пожертвовал. Найди системный паттерн мышления.

1. Суперсила — то, что он выбирает постоянно.
2. Слабое место — ось, которую он стабильно игнорирует (product, marketing, operations, brand).
3. Диагноз — ровно 3 предложения. Безжалостно к решениям, уважительно к человеку: бей по паттерну, не по личности. Тон уверенного эксперта, без воды и клише. Обращайся на «ты», ссылайся на конкретные выборы из лога.
4. Оцени каждую из 4 осей 1–5: сколько внимания фаундер ей уделяет в решениях.

Если решения противоречат друг другу — это и есть главная находка, назови её.

Верни ТОЛЬКО JSON: {"diagnosis":"3 предложения","superpower":{"axis":"ключ","title":"2–4 слова","note":"1 предложение"},"weakness":{"axis":"ключ","title":"2–4 слова","note":"1 предложение"},"axes":[{"key":"product","name":"Продукт","score":число},{"key":"marketing","name":"Маркетинг","score":число},{"key":"operations","name":"Операционка","score":число},{"key":"brand","name":"Бренд","score":число}]}`;

function methodistSystem(cal: Calibration): string {
  return `Ты — EdTech-методист. На основе диагноза фаундера составь план микро-обучения на первый месяц, закрывающий его слабое место. Индустрия: ${cal.industry} (${cal.model}), ключевая метрика: ${cal.key_metric}.

Сгенерируй 3 практических микро-спринта. Названия должны звучать как конкретные решения его проблемы в его индустрии, без общих слов и без «Неделя 1».

Верни ТОЛЬКО JSON: {"sprints":[{"title":"до 60 знаков","outcome":"что получит на выходе, 1 предложение"}]}`;
}

const VALIDATOR_SYSTEM = `Ты — валидатор качества бизнес-диагноза. На входе лог решений фаундера и JSON-диагноз.

Проверь:
1. Конкретность: диагноз ссылается на реальные решения из лога, не применим к любому человеку.
2. Тон: уверенный эксперт, бьёт по паттерну решений, но не унижает личность. Оскорбления и высокомерие — причина отклонить.
3. Полнота: суперсила, слабость, ровно 4 оси со score 1–5.
4. Логика: слабое место действительно следует из лога, не выдумано.

Верни ТОЛЬКО JSON: {"approved":true,"issues":[]} либо {"approved":false,"issues":["конкретная проблема"]}`;

function seedLog(seed: SeedAnswer[], name?: string): string {
  const lines = seed.map((s) => `- ${s.q} → выбрал: «${s.answer}»`);
  return `${name ? `Название проекта: ${name}\n` : ""}Выборы пользователя:\n${lines.join("\n")}`;
}

export function decisionLog(payload: {
  name?: string;
  calibration: Calibration;
  decisions: Decision[];
  links?: Record<string, string>;
}): string {
  const lines = [
    `Проект: ${payload.name || "без названия"} · Индустрия: ${payload.calibration.industry} (${payload.calibration.model}) · Метрика ниши: ${payload.calibration.key_metric}`,
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

export function runCalibrator(seed: SeedAnswer[], name: string | undefined, usage: LlmUsage[]): Promise<Calibration> {
  return llmJson<Calibration>("gate", CALIBRATOR_SYSTEM, seedLog(seed, name), usage, 250);
}

export async function runGenerator(cal: Calibration, seed: SeedAnswer[], name: string | undefined, usage: LlmUsage[]): Promise<TradeoffCard[]> {
  const res = await llmJson<{ cards: TradeoffCard[] }>("assessor", generatorSystem(cal), seedLog(seed, name), usage, 1600);
  return (res.cards ?? [])
    .filter((c) => c?.situation && c?.left && c?.right && AXES_KEYS.includes(c.leftAxis) && AXES_KEYS.includes(c.rightAxis))
    .slice(0, 7)
    .map((c, i) => ({ ...c, id: `t${i}` }));
}

export function runDiagnost(log: string, usage: LlmUsage[], rejectionIssues?: string[]): Promise<Diagnosis> {
  let user = log;
  if (rejectionIssues?.length) {
    user += `\n\nПредыдущий диагноз отклонён валидатором:\n- ${rejectionIssues.join("\n- ")}\nСделай новый, устранив проблемы.`;
  }
  return llmJson<Diagnosis>("assessor", DIAGNOST_SYSTEM, user, usage, 1200);
}

export function runDiagValidator(log: string, diagnosis: Diagnosis, usage: LlmUsage[]): Promise<ValidationResult> {
  const user = `ЛОГ РЕШЕНИЙ:\n${log}\n\nДИАГНОЗ:\n${JSON.stringify(diagnosis)}`;
  return llmJson<ValidationResult>("validator", VALIDATOR_SYSTEM, user, usage, 500);
}

export async function runMethodist(diagnosis: Diagnosis, cal: Calibration, usage: LlmUsage[]): Promise<Sprint[]> {
  const user = `Диагноз: ${diagnosis.diagnosis}\nСлабое место: ${diagnosis.weakness.title} (${AXIS_NAMES[diagnosis.weakness.axis] ?? diagnosis.weakness.axis}) — ${diagnosis.weakness.note}`;
  const res = await llmJson<{ sprints: Sprint[] }>("assessor", methodistSystem(cal), user, usage, 700);
  return (res.sprints ?? []).filter((s) => s?.title).slice(0, 3);
}

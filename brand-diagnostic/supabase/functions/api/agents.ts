import { llmJson, type LlmUsage } from "./llm.ts";

export const LEVEL_NAMES = ["Хаос", "Ремесленник", "Согласованность", "Позиционирование", "Магнит"];

export interface CardAnswer {
  id: string;
  axis: string;
  q: string;
  answer: "yes" | "no" | "skip";
}

export interface Answers {
  building: string;
  name?: string;
  cards?: CardAnswer[];
  offer?: string;
  audience?: string;
  differentiation?: string;
  selfBrand?: string;
  assets?: string[];
  touchpoints?: string[];
  links?: { store?: string; landing?: string; social?: string };
  clarification?: string;
  selfScores?: Record<string, number>;
}

export interface Axis {
  key: string;
  name: string;
  score: number;
  note: string;
}

export interface Assessment {
  overallLevel: number;
  levelName: string;
  summary: string;
  axes: Axis[];
  gaps: string[];
  nextStep: string;
  unclearAxes?: string[];
}

export interface ProbeCard {
  id: string;
  type: "bool" | "scale" | "duo";
  axis: string;
  q: string;
  sub?: string;
  left?: string;
  right?: string;
}

export interface GateResult {
  sufficient: boolean;
  question?: string;
}

export interface ValidationResult {
  approved: boolean;
  issues: string[];
}

const RUBRIC = `Оси оценки (каждая 1–5):
1. positioning — Позиционирование и оффер: ясно ли, кому и зачем нужен продукт.
2. visual — Визуальная идентичность: есть ли система (лого, палитра, типографика), а не случайный визуал.
3. consistency — Консистентность: единство бренда на всех точках контакта.
4. differentiation — Дифференциация: отстройка от конкурентов.
5. conversion — Конверсионность: работает ли бренд на установки и продажи (иконка, скриншоты стора, оффер).

Уровни зрелости (1–5):
1 Хаос — есть продукт, нет бренда; случайный визуал, оффер не сформулирован.
2 Ремесленник — есть название/лого, но нет системы; визуал несогласован, оффер размыт.
3 Согласованность — есть визуальная система и понятный оффер, но нет дифференциации.
4 Позиционирование — чёткая ЦА, tone of voice, отстройка; бренд работает на конверсию.
5 Магнит — узнаваемый бренд как актив привлечения, консистентность везде.

Общий уровень определяется по двум слабейшим осям (их среднее, округление вниз) — бренд не сильнее своих слабых звеньев, но одна пустая ось не перечёркивает остальные.`;

const GATE_SYSTEM = `Ты — гейт качества ввода перед диагностикой зрелости бренда.
Твоя задача: решить, достаточно ли данных для осмысленной оценки по рубрике (позиционирование, визуал, консистентность, дифференциация, конверсия).

Правила:
- НЕ будь строгим. Отклоняй только если оценка физически невозможна: бессмысленный текст, спам, пустые отписки («ну игра и игра»), полное отсутствие сути продукта.
- Краткость — не повод отклонять. Инди-разработчик с оффером в одну строку и парой фактов — валидный ввод.
- Если данных не хватает, сформулируй ОДИН конкретный уточняющий вопрос на русском, который закроет самый большой пробел.

Верни ТОЛЬКО валидный JSON: {"sufficient": true} либо {"sufficient": false, "question": "строка"}`;

const ASSESSOR_SYSTEM = `Ты — ассессор зрелости бренда для инди-разработчиков и соло-фаундеров.

${RUBRIC}

Правила:
- Оценивай строго по вводу пользователя. Будь конкретен к ЕГО продукту: ссылайся на его название, тип и конкретные ответы. Генерик недопустим.
- Ввод — самоотчёт: да/нет/не знаю, шкалы 0–5 и выборы из двух. Используй ВЕСЬ диапазон score 1–5: 1 — полное отсутствие, 2 — есть зачатки, 3 — база на месте, 4 — система работает, 5 — эталон. Уверенные «да» и высокие шкалы без противоречий = высокий score, не занижай. «не знаю» — слабый минус, не приговор.
- Ищи ПРОТИВОРЕЧИЯ между ответами (например, «ясно вижу пользователя 5/5», но «не знаю», новичок он или профи). Противоречие важнее самих ответов: мягко назови его в note или gaps — это самое ценное наблюдение.
- Если по оси данных объективно мало или ответы противоречат так, что score будет гаданием, добавь ключ оси в unclearAxes — тебе дадут задать уточняющие вопросы. Не добавляй оси, где картина ясна.
- Ответы с осью tone — предпочтения о характере бренда. Используй их, чтобы попасть в тон summary, gaps и nextStep, но НЕ для расчёта score.
- Ответы с осью context — бизнес-контекст (каналы клиентов, ритм контента, YouTube, окупаемость, размер команды). Используй для точности оценки конверсии и чтобы nextStep был реалистичен под ресурсы: соло-фаундеру не советуй «наймите SMM», окупающемуся бизнесу можно смелее. НЕ отдельная ось score.
- Если пользователь дал ссылки — учитывай сам факт их наличия как сигнал (есть точки контакта), но не выдумывай их содержимое.
- ТОН: ты поддерживающий коуч, а не экзаменатор. Никакого осуждения, стыда и менторства. Слабые оси — «зоны роста», не провалы. Низкий уровень подавай как нормальную точку старта с понятной дорогой вверх. Пользователь должен захотеть расти, а не закрыть вкладку.
- Заметки (note) короткие, по делу, на русском.
- gaps — 2–3 конкретных разрыва именно у этого бренда, отсортированы по влиянию на конверсию.
- nextStep — один конкретный шаг, выполнимый за неделю без бюджета.
- Верни ТОЛЬКО валидный JSON без markdown. Схема:
{"overallLevel":число,"levelName":"строка","summary":"1–2 предложения","axes":[{"key":"positioning","name":"Позиционирование и оффер","score":число,"note":"строка"},{"key":"visual","name":"Визуальная идентичность","score":число,"note":"строка"},{"key":"consistency","name":"Консистентность","score":число,"note":"строка"},{"key":"differentiation","name":"Дифференциация","score":число,"note":"строка"},{"key":"conversion","name":"Конверсионность","score":число,"note":"строка"}],"gaps":["строка"],"nextStep":"строка","unclearAxes":["ключ оси, опционально"]}`;

const VALIDATOR_SYSTEM = `Ты — валидатор качества брендовой диагностики. На входе: ввод пользователя и JSON-оценка ассессора.

${RUBRIC}

Проверь оценку по критериям:
1. Конкретность: заметки и разрывы ссылаются на факты ЭТОГО бренда, а не применимы к любому продукту.
2. Обоснованность: каждый score согласуется со своей заметкой (нет «системы нет» при score 4).
3. Правило уровня: overallLevel ≈ среднее двух слабейших осей (точную арифметику исправит сервер, грубое завышение — причина отклонить).
4. Полнота: все 5 осей, 2–3 разрыва, выполнимый nextStep.
5. Нет выдумок: оценка не приписывает пользователю того, чего нет во вводе.
6. Тон: поддерживающий, без осуждения, стыда и менторства. Формулировки, которые могут задеть («ты не знаешь», «у тебя нет понимания»), — причина для отклонения.

Верни ТОЛЬКО валидный JSON: {"approved": true, "issues": []} либо {"approved": false, "issues": ["конкретная проблема", "..."]}`;

const ANSWER_LABELS: Record<string, string> = { yes: "да", no: "нет", skip: "не знаю" };

// selfScores намеренно не попадают в промпт: самооценка юзера не должна смещать ассессора.
export function buildUserMessage(a: Answers): string {
  const lines = [`Тип продукта: ${a.building}${a.name ? ` («${a.name}»)` : ""}`];

  if (a.cards?.length) {
    lines.push("", "Самоотчёт (да/нет/не знаю · шкалы 0–5 · выборы из двух):");
    const byAxis = new Map<string, CardAnswer[]>();
    for (const c of a.cards) {
      byAxis.set(c.axis, [...(byAxis.get(c.axis) ?? []), c]);
    }
    for (const [axis, cards] of byAxis) {
      lines.push(`[${axis}]`);
      for (const c of cards) lines.push(`- ${c.q} → ${ANSWER_LABELS[c.answer] ?? c.answer}`);
    }
  } else {
    lines.push(
      `Оффер: ${a.offer}`,
      `Целевая аудитория: ${a.audience}`,
      `Отличие от альтернатив: ${a.differentiation}`,
      `Как описывает бренд: ${a.selfBrand}`,
      `Есть из визуала: ${a.assets?.length ? a.assets.join(", ") : "ничего не отмечено"}`,
      `Точки контакта: ${a.touchpoints?.length ? a.touchpoints.join(", ") : "не указаны"}`,
    );
  }

  const links = Object.entries(a.links ?? {}).filter(([, v]) => v?.trim());
  if (links.length) lines.push(`Ссылки: ${links.map(([k, v]) => `${k}: ${v}`).join(" · ")}`);
  if (a.clarification?.trim()) lines.push(`Уточнение по запросу: ${a.clarification}`);
  return lines.join("\n");
}

export function runGate(answers: Answers, usage: LlmUsage[]): Promise<GateResult> {
  return llmJson<GateResult>("gate", GATE_SYSTEM, buildUserMessage(answers), usage, 300);
}

export function runAssessor(answers: Answers, usage: LlmUsage[], rejectionIssues?: string[]): Promise<Assessment> {
  let user = buildUserMessage(answers);
  if (rejectionIssues?.length) {
    user += `\n\nПредыдущая оценка отклонена валидатором. Причины:\n- ${rejectionIssues.join("\n- ")}\nСделай новую оценку, устранив эти проблемы.`;
  }
  return llmJson<Assessment>("assessor", ASSESSOR_SYSTEM, user, usage, 1400);
}

export function runValidator(answers: Answers, assessment: Assessment, usage: LlmUsage[]): Promise<ValidationResult> {
  const user = `ВВОД ПОЛЬЗОВАТЕЛЯ:\n${buildUserMessage(answers)}\n\nОЦЕНКА АССЕССОРА:\n${JSON.stringify(assessment)}`;
  return llmJson<ValidationResult>("validator", VALIDATOR_SYSTEM, user, usage, 500);
}

const PROBE_SYSTEM = `Ты придумываешь уточняющие вопросы-карточки для диагностики бренда: по некоторым осям данных не хватило или ответы противоречивы.

Правила:
- 3–5 карточек, ТОЛЬКО по указанным неясным осям.
- Вопросы про КОНКРЕТНЫЙ продукт пользователя: используй его название, тип и уже данные ответы. Никаких общих вопросов.
- Простые слова, без жаргона. Тон дружелюбный, без осуждения — нет неправильных ответов.
- Типы: "bool" (да/нет), "scale" (0–5), "duo" (выбор из двух — заполни left и right).
- q — до 70 знаков, sub — поясняющая строка до 90 знаков.

Верни ТОЛЬКО JSON: {"cards":[{"id":"строка","type":"bool|scale|duo","axis":"ключ оси","q":"строка","sub":"строка","left":"строка","right":"строка"}]}`;

const VALID_AXES = ["positioning", "visual", "consistency", "differentiation", "conversion"];

export async function runProbeGen(answers: Answers, unclearAxes: string[], usage: LlmUsage[]): Promise<ProbeCard[]> {
  const user = `${buildUserMessage(answers)}\n\nНеясные оси: ${unclearAxes.join(", ")}`;
  const res = await llmJson<{ cards: ProbeCard[] }>("gate", PROBE_SYSTEM, user, usage, 800);
  return (res.cards ?? [])
    .filter((c) => c?.q && ["bool", "scale", "duo"].includes(c.type) && VALID_AXES.includes(c.axis))
    .slice(0, 5)
    .map((c, i) => ({ ...c, id: `probe_${c.id ?? i}` }));
}

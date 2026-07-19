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

Общий уровень определяется по слабейшим осям, не по среднему — бренд не сильнее своего слабого звена.`;

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
- Ввод — самоотчёт: да/нет/не знаю, шкалы 0–5 и выборы из двух. Люди склонны себе льстить — оценивай консервативно. «не знаю» трактуй как слабое «нет», шкальные 4–5 принимай со скепсисом без подтверждающих фактов, шкальные 0–1 — честный сигнал отсутствия.
- Ответы с осью tone — предпочтения о характере бренда. Используй их, чтобы попасть в тон summary, gaps и nextStep, но НЕ для расчёта score.
- Если пользователь дал ссылки — учитывай сам факт их наличия как сигнал (есть точки контакта), но не выдумывай их содержимое.
- ТОН: ты поддерживающий коуч, а не экзаменатор. Никакого осуждения, стыда и менторства. Слабые оси — «зоны роста», не провалы. Низкий уровень подавай как нормальную точку старта с понятной дорогой вверх. Пользователь должен захотеть расти, а не закрыть вкладку.
- Заметки (note) короткие, по делу, на русском.
- gaps — 2–3 конкретных разрыва именно у этого бренда, отсортированы по влиянию на конверсию.
- nextStep — один конкретный шаг, выполнимый за неделю без бюджета.
- Верни ТОЛЬКО валидный JSON без markdown. Схема:
{"overallLevel":число,"levelName":"строка","summary":"1–2 предложения","axes":[{"key":"positioning","name":"Позиционирование и оффер","score":число,"note":"строка"},{"key":"visual","name":"Визуальная идентичность","score":число,"note":"строка"},{"key":"consistency","name":"Консистентность","score":число,"note":"строка"},{"key":"differentiation","name":"Дифференциация","score":число,"note":"строка"},{"key":"conversion","name":"Конверсионность","score":число,"note":"строка"}],"gaps":["строка"],"nextStep":"строка"}`;

const VALIDATOR_SYSTEM = `Ты — валидатор качества брендовой диагностики. На входе: ввод пользователя и JSON-оценка ассессора.

${RUBRIC}

Проверь оценку по критериям:
1. Конкретность: заметки и разрывы ссылаются на факты ЭТОГО бренда, а не применимы к любому продукту.
2. Обоснованность: каждый score согласуется со своей заметкой (нет «системы нет» при score 4).
3. Правило слабого звена: overallLevel не выше минимального score по осям.
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

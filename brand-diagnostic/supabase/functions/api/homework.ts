import { llmJson, type LlmUsage } from "./llm.ts";
import type { Calibration } from "./agents.ts";

// ─────────────────────────────────────────────────────────────────────────────
// СТАТИЧНАЯ ШКАЛА ОЦЕНИВАНИЯ. Это то, что заполняет Vadim.
// Критерии НЕ генерируются моделью — они фиксированы, поэтому оценка объективна и
// воспроизводима. Модель лишь проверяет ответ пользователя против этих критериев.
//
// Как заполнять:
//   1. DEFAULT_CRITERIA — универсальная сетка, применяется, если под урок нет своей.
//   2. HOMEWORK_OVERRIDES[axis][lessonIndex] — своя сетка под конкретный урок.
//      Сумма points по критериям должна давать 10.
//   3. Можно задать и свой текст задания (prompt); по умолчанию берётся task урока.
// ─────────────────────────────────────────────────────────────────────────────

export interface Criterion {
  label: string; // что проверяем
  points: number; // максимум баллов за критерий
  hint?: string; // подсказка модели, что считать выполненным (необязательно)
}

export interface Homework {
  prompt?: string; // текст задания; если пусто — берётся task урока
  criteria: Criterion[];
}

// Универсальная сетка на 10 баллов. Vadim заменит на предметные варианты.
export const DEFAULT_CRITERIA: Criterion[] = [
  { label: "По делу: ответ про свой продукт и по теме урока", points: 4, hint: "не общие слова, а про конкретный бизнес пользователя" },
  { label: "Конкретика: есть примеры, цифры или детали, а не абстракции", points: 3, hint: "видно, что человек реально применил, а не пересказал" },
  { label: "Применимость: из ответа понятен следующий шаг", points: 3, hint: "есть вывод или действие, а не просто рассуждение" },
];

// Свои сетки под конкретные уроки. Формат: HOMEWORK_OVERRIDES[axis][lessonIndex].
// Пример (закомментирован) — Vadim раскомментирует и заполнит:
export const HOMEWORK_OVERRIDES: Record<string, Record<number, Homework>> = {
  // marketing: {
  //   0: {
  //     prompt: "Нарисуй свою воронку в три шага: где человек тебя встречает → что делает дальше → чем платит.",
  //     criteria: [
  //       { label: "Все три шага названы", points: 4 },
  //       { label: "Шаги про реальный путь клиента, а не абстракция", points: 3 },
  //       { label: "Виден разрыв или узкое место", points: 3 },
  //     ],
  //   },
  // },
};

export function homeworkFor(axis: string, index: number, taskFallback: string): Homework {
  const override = HOMEWORK_OVERRIDES[axis]?.[index];
  return {
    prompt: override?.prompt || taskFallback,
    criteria: override?.criteria?.length ? override.criteria : DEFAULT_CRITERIA,
  };
}

export interface GradeBreakdown {
  label: string;
  max: number;
  awarded: number;
  note: string;
}

export interface GradeResult {
  total: number;
  breakdown: GradeBreakdown[];
  comment: string;
}

export async function gradeHomework(
  homework: Homework,
  submission: string,
  cal: Calibration,
  niche: string | undefined,
  usage: LlmUsage[],
): Promise<GradeResult> {
  const criteriaText = homework.criteria
    .map((c, i) => `${i + 1}. «${c.label}» (макс ${c.points}${c.hint ? `; выполнено, если: ${c.hint}` : ""})`)
    .join("\n");

  const system = `Ты — строгий, но честный проверяющий домашних заданий. Ниша ученика: ${niche ?? cal.industry} (${cal.model}).

Задание: ${homework.prompt}

ФИКСИРОВАННАЯ шкала (оценивай ТОЛЬКО по ней, ничего не добавляй):
${criteriaText}

Правила оценивания:
- По каждому критерию поставь от 0 до его максимума. Оценивай объективно: пусто/не по теме — 0; частично — половина; полностью — максимум.
- Не завышай из вежливости и не занижай придирками. Одинаковый ответ должен получать одинаковый балл.
- note по каждому критерию — 1 короткая фраза, что засчитано или чего не хватило.
- comment — 1–2 предложения по-доброму: что сделать, чтобы добрать баллы.
- Пиши простыми словами, без жаргона.

Верни ТОЛЬКО JSON: {"breakdown":[{"label":"точный текст критерия","awarded":число,"note":"строка"}],"comment":"строка"}`;

  const res = await llmJson<{ breakdown: { label: string; awarded: number; note: string }[]; comment: string }>(
    "validator",
    system,
    `Ответ ученика:\n${submission}`,
    usage,
    600,
  );

  // Итог считаем сами по фиксированным максимумам — модели доверяем только awarded, но клампим его.
  const breakdown: GradeBreakdown[] = homework.criteria.map((c, i) => {
    const got = res.breakdown?.[i];
    const awarded = Math.max(0, Math.min(c.points, Math.round(Number(got?.awarded) || 0)));
    return { label: c.label, max: c.points, awarded, note: got?.note || "" };
  });
  const total = breakdown.reduce((s, b) => s + b.awarded, 0);
  return { total, breakdown, comment: res.comment || "" };
}

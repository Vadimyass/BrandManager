// Память профиля Мелио. Живёт в progress.data.melio_memory (jsonb), пишется клиентом
// под его RLS. Агент только ПРЕДЛАГАЕТ memory_delta — применяем его здесь, безопасно.
import type { Diagnosis } from "./agents.ts";

export interface MelioMemory {
  business: { niche: string; model?: string; profile?: string | null; src?: string };
  level: number; // L1..L5
  focus_weakspot: string; // ось слабого места
  learning: {
    concepts_used: string[];
    stories_used: string[];
    quiz_log: { lesson?: number; correct?: boolean; note?: string }[];
    difficulty_pos: number; // 0..100
  };
  diagnostic: {
    weakness?: { axis: string; title: string; note?: string };
    superpower?: { axis: string; title: string };
    summary?: string;
    history?: { at: string; level: number }[];
  };
  work: { at?: string; kind?: string; note?: string }[];
}

export function buildInitialMemory(opts: {
  diagnosis?: Diagnosis;
  niche?: string;
  model?: string;
  profile?: string;
  level?: number;
}): MelioMemory {
  const d = opts.diagnosis;
  return {
    business: { niche: opts.niche || "", model: opts.model, profile: opts.profile ?? null, src: opts.niche ? "stated" : "inferred" },
    level: clampLevel(opts.level ?? 1),
    focus_weakspot: d?.weakness?.axis ?? "marketing",
    learning: { concepts_used: [], stories_used: [], quiz_log: [], difficulty_pos: 30 },
    diagnostic: d
      ? {
        weakness: { axis: d.weakness.axis, title: d.weakness.title, note: d.weakness.note },
        superpower: { axis: d.superpower.axis, title: d.superpower.title },
        summary: d.diagnosis,
        history: [{ at: new Date().toISOString(), level: clampLevel(opts.level ?? 1) }],
      }
      : { history: [] },
    work: [],
  };
}

// Разрешённые верхнеуровневые ветки. Всё остальное агенту писать нельзя.
const ALLOWED = ["business", "level", "focus_weakspot", "learning", "diagnostic", "work"];
// Грубый фильтр чувствительного — такие ключи в память не пускаем.
const SENSITIVE = /(health|болезн|диагноз врач|passport|паспорт|card|карта банк|cvv|password|пароль|ssn|инн)/i;

type Delta = { add?: { path?: string; value?: unknown; src?: string }[]; update?: { path?: string; value?: unknown }[] };

export function applyDelta(memory: MelioMemory, delta?: Delta): MelioMemory {
  const mem = structuredClone(memory);
  if (!delta) return mem;

  for (const op of delta.add ?? []) {
    if (!okPath(op?.path)) continue;
    const v = capValue(op!.value);
    if (v === undefined) continue;
    const arr = ensureArray(mem, op!.path!);
    if (arr && arr.length < 200) arr.push(v);
  }
  for (const op of delta.update ?? []) {
    if (!okPath(op?.path)) continue;
    const v = capValue(op!.value);
    if (v === undefined) continue;
    setScalar(mem, op!.path!, v);
  }
  // Нормализация ключевых полей.
  mem.level = clampLevel(mem.level);
  if (typeof mem.learning?.difficulty_pos === "number") {
    mem.learning.difficulty_pos = Math.min(100, Math.max(0, Math.round(mem.learning.difficulty_pos)));
  }
  return mem;
}

function okPath(path?: string): boolean {
  if (!path || typeof path !== "string") return false;
  if (SENSITIVE.test(path)) return false;
  const top = path.split(".")[0];
  return ALLOWED.includes(top);
}
function capValue(v: unknown): unknown {
  if (v == null) return undefined;
  if (typeof v === "string") { if (SENSITIVE.test(v)) return undefined; return v.slice(0, 400); }
  if (typeof v === "number" || typeof v === "boolean") return v;
  if (typeof v === "object") {
    try { const s = JSON.stringify(v); if (SENSITIVE.test(s) || s.length > 800) return undefined; } catch { return undefined; }
    return v;
  }
  return undefined;
}
// deno-lint-ignore no-explicit-any
function ensureArray(root: any, path: string): any[] | null {
  const parts = path.split(".");
  let cur = root;
  for (let i = 0; i < parts.length - 1; i++) {
    const k = parts[i];
    if (cur[k] == null || typeof cur[k] !== "object") cur[k] = {};
    cur = cur[k];
  }
  const last = parts[parts.length - 1];
  if (!Array.isArray(cur[last])) cur[last] = [];
  return cur[last];
}
// deno-lint-ignore no-explicit-any
function setScalar(root: any, path: string, value: unknown): void {
  const parts = path.split(".");
  let cur = root;
  for (let i = 0; i < parts.length - 1; i++) {
    const k = parts[i];
    if (cur[k] == null || typeof cur[k] !== "object") cur[k] = {};
    cur = cur[k];
  }
  cur[parts[parts.length - 1]] = value;
}
function clampLevel(n: unknown): number {
  return Math.min(5, Math.max(1, Math.round(Number(n) || 1)));
}

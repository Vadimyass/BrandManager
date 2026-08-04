import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  AXES_KEYS,
  AXIS_NAMES,
  type Calibration,
  type Decision,
  decisionLog,
  type Diagnosis,
  runCalibrator,
  runDiagnost,
  runDiagValidator,
  runGenerator,
  runMethodist,
  type SeedAnswer,
} from "./agents.ts";
import { courseLength, runCourse } from "./course.ts";
import { gradeHomework, homeworkFor } from "./homework.ts";
import { type CourseConfig, DEFAULT_CONFIG, normalizeConfig } from "./config.ts";
import type { LlmUsage } from "./llm.ts";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const db = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "method not allowed" }, 405);

  const route = new URL(req.url).pathname.split("/").filter(Boolean).pop();
  try {
    const body = await req.json();
    switch (route) {
      case "deck":
        return json(await deck(body));
      case "diagnose":
        return json(await diagnose(body));
      case "course":
        return json(await course(body));
      case "grade":
        return json(await grade(body));
      case "config":
        return json(await config(req, body));
      case "track":
        return json(await track(body));
      case "feedback":
        return json(await feedback(body));
      case "waitlist":
        return json(await waitlist(body));
      default:
        return json({ error: "not found" }, 404);
    }
  } catch (e) {
    console.error(e);
    return json({ error: e instanceof Error ? e.message : String(e) }, 500);
  }
});

async function deck(body: { seedAnswers: SeedAnswer[]; name?: string; niche?: string; lang?: string }) {
  const { seedAnswers, name, niche, lang } = body;
  if (!seedAnswers?.length || seedAnswers.length < 2) throw new Error("seed answers incomplete");

  const usage: LlmUsage[] = [];
  const calibration = await runCalibrator(seedAnswers, name, niche, usage, lang);
  let cards = await runGenerator(calibration, seedAnswers, name, niche, usage, lang);
  if (cards.length < 5) cards = await runGenerator(calibration, seedAnswers, name, niche, usage, lang);
  if (cards.length < 5) throw new Error("deck generation failed");

  return { status: "ok", calibration, cards, usage };
}

interface DiagnosePayload {
  name?: string;
  niche?: string;
  version?: string;
  lang?: string;
  seedAnswers: SeedAnswer[];
  calibration: Calibration;
  decisions: Decision[];
  links?: Record<string, string>;
  deckUsage?: LlmUsage[];
}

async function diagnose(body: DiagnosePayload) {
  if (!body.calibration || (body.decisions?.length ?? 0) < 5) throw new Error("decisions incomplete");

  const started = Date.now();
  const usage: LlmUsage[] = [...(body.deckUsage ?? [])];
  const log = decisionLog(body);
  const lang = body.lang;

  let diagnosis = await runDiagnost(log, usage, undefined, lang);
  let validation = await runDiagValidator(log, diagnosis, usage);
  let retried = false;
  if (!validation.approved) {
    retried = true;
    diagnosis = await runDiagnost(log, usage, validation.issues, lang);
    validation = await runDiagValidator(log, diagnosis, usage);
  }
  normalizeDiagnosis(diagnosis);

  const sprints = await runMethodist(diagnosis, body.calibration, usage, lang);

  const { data, error } = await db
    .from("diagnostics")
    .insert({
      input: { name: body.name, niche: body.niche, version: body.version, seedAnswers: body.seedAnswers, calibration: body.calibration, decisions: body.decisions, links: body.links },
      result: { ...diagnosis, sprints },
      validator: { ...validation, retried },
      usage,
      latency_ms: Date.now() - started,
    })
    .select("id")
    .single();
  if (error) throw error;

  return { status: "ok", id: data.id, result: { ...diagnosis, sprints } };
}

async function loadConfig(): Promise<CourseConfig> {
  const { data } = await db.from("course_config").select("data").eq("id", 1).maybeSingle();
  return normalizeConfig(data?.data);
}

async function course(body: { calibration: Calibration; niche?: string; diagnosis: Diagnosis; lang?: string; profile?: string }) {
  if (!body.diagnosis?.weakness || !body.calibration) throw new Error("diagnosis required");
  const usage: LlmUsage[] = [];
  const axis = body.diagnosis.weakness.axis;
  const cfg = await loadConfig();
  const lessons = await runCourse(axis, body.calibration, body.niche, body.diagnosis, usage, body.lang, body.profile, cfg);
  return { status: "ok", lessons, total: courseLength(axis) };
}

// Правила построения курса. GET — читать (не секрет), POST — сохранять по admin-ключу.
async function config(req: Request, body: { action?: string; adminKey?: string; config?: unknown }) {
  const method = req.method;
  if (method === "POST" && body?.action === "save") {
    const key = Deno.env.get("CONFIG_ADMIN_KEY");
    if (!key) throw new Error("CONFIG_ADMIN_KEY не задан на сервере");
    if (body.adminKey !== key) throw new Error("неверный admin-ключ");
    const clean = normalizeConfig(body.config);
    const { error } = await db.from("course_config").upsert({ id: 1, data: clean, updated_at: new Date().toISOString() });
    if (error) throw error;
    return { status: "ok", config: clean };
  }
  // По умолчанию — вернуть текущий конфиг (или дефолт).
  return { status: "ok", config: await loadConfig(), defaults: DEFAULT_CONFIG };
}

async function track(body: { sessionId: string; name: string; props?: unknown; niche?: string; referrer?: string }) {
  if (!body.sessionId || !body.name) return { status: "skip" };
  // Аналитику не даём валить основной поток — ошибки глотаем.
  const { error } = await db.from("events").insert({
    session_id: String(body.sessionId).slice(0, 64),
    name: String(body.name).slice(0, 64),
    props: body.props ?? null,
    niche: body.niche ? String(body.niche).slice(0, 80) : null,
    referrer: body.referrer ? String(body.referrer).slice(0, 300) : null,
  });
  if (error) console.error("track error:", error.message);
  return { status: "ok" };
}

async function grade(body: { axis: string; index: number; task: string; submission: string; calibration: Calibration; niche?: string; lang?: string }) {
  const submission = (body.submission ?? "").trim();
  if (submission.length < 3) throw new Error("empty submission");
  const usage: LlmUsage[] = [];
  const hw = homeworkFor(body.axis, body.index ?? 0, body.task ?? "");
  const result = await gradeHomework(hw, submission, body.calibration, body.niche, usage, body.lang);
  return { status: "ok", ...result, max: 10 };
}

function normalizeDiagnosis(d: Diagnosis) {
  const byKey = new Map((d.axes ?? []).map((a) => [a.key, a]));
  d.axes = AXES_KEYS.map((key) => {
    const a = byKey.get(key);
    const score = Math.min(5, Math.max(1, Math.round(Number(a?.score) || 1)));
    return { key, name: AXIS_NAMES[key], score };
  });
  if (!AXES_KEYS.includes(d.weakness?.axis)) d.weakness.axis = d.axes.reduce((m, a) => (a.score < m.score ? a : m)).key;
  if (!AXES_KEYS.includes(d.superpower?.axis)) d.superpower.axis = d.axes.reduce((m, a) => (a.score > m.score ? a : m)).key;
}

async function feedback(body: { id: string; verdict: "accurate" | "miss" }) {
  if (!body.id || !["accurate", "miss"].includes(body.verdict)) throw new Error("bad feedback payload");
  const { error } = await db
    .from("diagnostics")
    .update({ feedback: body.verdict, feedback_at: new Date().toISOString() })
    .eq("id", body.id);
  if (error) throw error;
  return { status: "ok" };
}

async function waitlist(body: { email: string; diagnosticId?: string; intent?: string }) {
  const email = body.email?.trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("invalid email");
  const intent = body.intent === "purchase" ? "purchase" : "plan";
  const { error } = await db
    .from("waitlist")
    .upsert({ email, diagnostic_id: body.diagnosticId ?? null, intent }, { onConflict: "email" });
  if (error) throw error;
  return { status: "ok" };
}

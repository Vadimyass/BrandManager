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

async function deck(body: { seedAnswers: SeedAnswer[]; name?: string }) {
  const { seedAnswers, name } = body;
  if (!seedAnswers?.length || seedAnswers.length < 2) throw new Error("seed answers incomplete");

  const usage: LlmUsage[] = [];
  const calibration = await runCalibrator(seedAnswers, name, usage);
  let cards = await runGenerator(calibration, seedAnswers, name, usage);
  if (cards.length < 5) cards = await runGenerator(calibration, seedAnswers, name, usage);
  if (cards.length < 5) throw new Error("deck generation failed");

  return { status: "ok", calibration, cards, usage };
}

interface DiagnosePayload {
  name?: string;
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

  let diagnosis = await runDiagnost(log, usage);
  let validation = await runDiagValidator(log, diagnosis, usage);
  let retried = false;
  if (!validation.approved) {
    retried = true;
    diagnosis = await runDiagnost(log, usage, validation.issues);
    validation = await runDiagValidator(log, diagnosis, usage);
  }
  normalizeDiagnosis(diagnosis);

  const sprints = await runMethodist(diagnosis, body.calibration, usage);

  const { data, error } = await db
    .from("diagnostics")
    .insert({
      input: { name: body.name, seedAnswers: body.seedAnswers, calibration: body.calibration, decisions: body.decisions, links: body.links },
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

async function waitlist(body: { email: string; diagnosticId?: string }) {
  const email = body.email?.trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("invalid email");
  const { error } = await db
    .from("waitlist")
    .upsert({ email, diagnostic_id: body.diagnosticId ?? null }, { onConflict: "email" });
  if (error) throw error;
  return { status: "ok" };
}

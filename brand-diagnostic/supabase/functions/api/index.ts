import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  type Answers,
  type Assessment,
  LEVEL_NAMES,
  runAssessor,
  runGate,
  runProbeGen,
  runValidator,
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

const MAX_PROBE_ROUNDS = 2;

async function diagnose(body: { answers: Answers; skipGate?: boolean; round?: number }) {
  const { answers, skipGate } = body;
  const round = body.round ?? 0;
  const hasCards = (answers?.cards?.length ?? 0) >= 10;
  if (!answers?.building || (!hasCards && (!answers?.offer || !answers?.selfBrand))) {
    throw new Error("answers incomplete");
  }

  const started = Date.now();
  const usage: LlmUsage[] = [];

  // Гейт нужен только свободному тексту: карточные ответы мусорными не бывают.
  let gate = null;
  if (!skipGate && !hasCards) {
    gate = await runGate(answers, usage);
    if (!gate.sufficient) return { status: "clarify", question: gate.question };
  }

  let assessment = await runAssessor(answers, usage);

  const unclear = assessment.unclearAxes ?? [];
  if (round < MAX_PROBE_ROUNDS && unclear.length > 0) {
    try {
      const cards = await runProbeGen(answers, unclear, usage);
      if (cards.length >= 2) return { status: "probe", cards, axes: unclear, round };
    } catch (e) {
      console.error("probe generation failed, falling through to final result:", e);
    }
  }

  let validation = await runValidator(answers, assessment, usage);
  let retried = false;
  if (!validation.approved) {
    retried = true;
    assessment = await runAssessor(answers, usage, validation.issues);
    validation = await runValidator(answers, assessment, usage);
  }

  enforceWeakestLinkRule(assessment);

  const { data, error } = await db
    .from("diagnostics")
    .insert({
      input: answers,
      gate,
      result: assessment,
      validator: { ...validation, retried },
      usage,
      latency_ms: Date.now() - started,
    })
    .select("id")
    .single();
  if (error) throw error;

  return { status: "ok", id: data.id, result: assessment };
}

// Правило рубрики детерминировано, модели не доверяем арифметику.
// Среднее двух слабейших: одна пустая ось не топит весь бренд в L1, но слабые звенья решают.
function enforceWeakestLinkRule(a: Assessment) {
  const scores = (a.axes ?? []).map((x) => Number(x.score)).filter((n) => n >= 1 && n <= 5);
  if (scores.length !== 5) throw new Error("assessor returned malformed axes");
  const [w1, w2] = scores.sort((x, y) => x - y);
  a.overallLevel = Math.max(1, Math.floor((w1 + w2) / 2));
  a.levelName = LEVEL_NAMES[a.overallLevel - 1];
  delete a.unclearAxes;
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

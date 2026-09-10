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
  runGeneratorSituational,
  runMethodist,
  type SeedAnswer,
  situationalLog,
} from "./agents.ts";
import { courseLength, planFor, programLength, runCourse, runGlobalCourse, runLesson } from "./course.ts";
import { runMelio, runMelioChat } from "./melio.ts";
import { applyDelta, buildInitialMemory, type MelioMemory } from "./memory.ts";
import { paymentAdapter } from "./payments.ts";
import { gradeHomework, homeworkFor } from "./homework.ts";
import { type CourseConfig, DEFAULT_CONFIG, normalizeConfig } from "./config.ts";
import { analyzeSocial, socialContext, type SocialProfile } from "./social.ts";
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

// Дорогие роуты (жгут кредиты LLM) — под рейт-лимитом.
const EXPENSIVE = new Set(["deck", "diagnose", "course", "grade", "melio", "testlesson", "social-analyze"]);
// Служебные инструменты rules-lab — только под admin-ключом.
const ADMIN_ONLY = new Set(["testlesson", "melio"]);
// Роуты Telegram-бота — под общим секретом (x-bot-secret). tg-token авторизуется JWT сам.
const BOT_ONLY = new Set(["tg-link", "tg-chat", "tg-entitlement"]);
const RATE_LIMIT = Number(Deno.env.get("RATE_LIMIT_PER_HOUR")) || 40;

function clientId(req: Request, body: { sessionId?: string }): string {
  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() ||
    req.headers.get("cf-connecting-ip") || "";
  return ip || (body?.sessionId ? `s:${String(body.sessionId).slice(0, 64)}` : "anon");
}

// Скользящее окно 1 час на клиента (IP/сессия), общее по дорогим роутам.
async function underRateLimit(req: Request, body: { sessionId?: string }): Promise<boolean> {
  try {
    const key = `llm:${clientId(req, body)}`;
    const since = new Date(Date.now() - 3600_000).toISOString();
    await db.from("rate_limits").delete().eq("key", key).lt("created_at", since);
    const { count } = await db.from("rate_limits").select("id", { count: "exact", head: true })
      .eq("key", key).gte("created_at", since);
    if ((count ?? 0) >= RATE_LIMIT) return false;
    await db.from("rate_limits").insert({ key });
    return true;
  } catch (e) {
    console.error("rate limit:", e);
    return true; // не блокируем легитимных из-за сбоя счётчика
  }
}

function adminOk(body: { adminKey?: string }): boolean {
  const key = Deno.env.get("CONFIG_ADMIN_KEY");
  return !!key && body?.adminKey === key;
}

// Роуты для Telegram-бота: доверенный вызов от нашего же бота по общему секрету.
function botOk(req: Request): boolean {
  const key = Deno.env.get("BOT_API_SECRET");
  return !!key && req.headers.get("x-bot-secret") === key;
}

// Обрезка пользовательского ввода — чтобы раздутым payload не гнать лишние токены.
function capStr(v: unknown, n: number): string | undefined {
  if (v == null) return undefined;
  return String(v).slice(0, n);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "method not allowed" }, 405);

  const route = new URL(req.url).pathname.split("/").filter(Boolean).pop();
  try {
    // Вебхуку провайдера нужно СЫРОЕ тело для проверки подписи — читаем до json.
    if (route === "payment-webhook") return json(await paymentWebhook(req));

    const body = await req.json();

    // Рейт-лимит на дорогих (LLM) роутах — защита от «постман сжёг кредиты».
    if (EXPENSIVE.has(route ?? "")) {
      const ok = await underRateLimit(req, body);
      if (!ok) return json({ error: "Слишком много запросов. Подожди немного и попробуй снова." }, 429);
    }
    // Служебные роуты (инструменты rules-lab) — только с admin-ключом.
    if (ADMIN_ONLY.has(route ?? "") && !adminOk(body)) {
      return json({ error: "forbidden" }, 403);
    }
    // Роуты бота — только по общему секрету от нашего Telegram-бота.
    if (BOT_ONLY.has(route ?? "") && !botOk(req)) {
      return json({ error: "forbidden" }, 403);
    }

    switch (route) {
      case "checkout":
        return json(await checkout(body));
      case "entitlement":
        return json(await entitlement(body));
      case "deck":
        return json(await deck(body));
      case "diagnose":
        return json(await diagnose(body));
      case "social-analyze":
        return json(await socialAnalyze(body));
      case "course":
        return json(await course(body));
      case "grade":
        return json(await grade(body));
      case "config":
        return json(await config(req, body));
      case "testlesson":
        return json(await testLesson(body));
      case "melio":
        return json(await melio(body));
      case "tg-token":
        return json(await tgToken(body));
      case "tg-link":
        return json(await tgLink(body));
      case "tg-chat":
        return json(await tgChat(body));
      case "tg-entitlement":
        return json(await tgEntitlement(body));
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

async function deck(body: { seedAnswers: SeedAnswer[]; name?: string; niche?: string; lang?: string; arm?: string }) {
  const seedAnswers = (Array.isArray(body.seedAnswers) ? body.seedAnswers : []).slice(0, 14).map((s) => ({
    id: capStr(s?.id, 40) ?? "",
    q: capStr(s?.q, 200) ?? "",
    answer: capStr(s?.answer, 300) ?? "",
  }));
  const name = capStr(body.name, 120);
  const niche = capStr(body.niche, 120);
  const lang = body.lang;
  if (!seedAnswers.length || seedAnswers.length < 2) throw new Error("seed answers incomplete");

  const usage: LlmUsage[] = [];
  const calibration = await runCalibrator(seedAnswers, name, niche, usage, lang);

  // A/B: вариант B — мягкий ситуативный опрос вместо дилемм.
  if (body.arm === "gentle") {
    let questions = await runGeneratorSituational(calibration, seedAnswers, name, niche, usage, lang);
    if (questions.length < 5) questions = await runGeneratorSituational(calibration, seedAnswers, name, niche, usage, lang);
    if (questions.length < 5) throw new Error("situational generation failed");
    return { status: "ok", calibration, questions, arm: "gentle", usage };
  }

  let cards = await runGenerator(calibration, seedAnswers, name, niche, usage, lang);
  if (cards.length < 5) cards = await runGenerator(calibration, seedAnswers, name, niche, usage, lang);
  if (cards.length < 5) throw new Error("deck generation failed");

  return { status: "ok", calibration, cards, arm: "deck", usage };
}

// Анализ публичной страницы (IG/TikTok): по ссылке возвращаем нормализованный профиль.
// Фронт зовёт до диагностики и передаёт результат в diagnose как observed-контекст.
async function socialAnalyze(body: { url?: string }) {
  const url = capStr(body.url, 300);
  if (!url) throw new Error("url required");
  const profile = await analyzeSocial(url);
  if (!profile) return { status: "ok", profile: null, note: "no data (нет ключа провайдера, приватный/пустой аккаунт или неподдерживаемая ссылка)" };
  return { status: "ok", profile };
}

interface DiagnosePayload {
  name?: string;
  niche?: string;
  version?: string;
  lang?: string;
  arm?: string;
  seedAnswers: SeedAnswer[];
  calibration: Calibration;
  decisions: Decision[];
  answers?: { situation: string; chosen: string; chosenAxis: string }[];
  links?: Record<string, string>;
  social?: SocialProfile;
  deckUsage?: LlmUsage[];
}

async function diagnose(body: DiagnosePayload) {
  const gentle = body.arm === "gentle";
  const answersLen = Array.isArray(body.answers) ? body.answers.length : 0;
  if (!body.calibration || (gentle ? answersLen < 5 : (body.decisions?.length ?? 0) < 5)) {
    throw new Error("answers incomplete");
  }

  // Обрезаем ввод: не даём раздутым payload гнать лишние токены.
  body.name = capStr(body.name, 120);
  body.niche = capStr(body.niche, 120);
  if (gentle) {
    body.answers = (body.answers ?? []).slice(0, 20).map((a) => ({
      situation: capStr(a?.situation, 200) ?? "",
      chosen: capStr(a?.chosen, 160) ?? "",
      chosenAxis: capStr(a?.chosenAxis, 24) ?? "",
    }));
  }
  body.decisions = (body.decisions ?? []).slice(0, 20).map((d) => ({
    situation: capStr(d?.situation, 200) ?? "",
    chosen: capStr(d?.chosen, 160) ?? "",
    chosenAxis: capStr(d?.chosenAxis, 24) ?? "",
    rejected: capStr(d?.rejected, 160) ?? "",
    rejectedAxis: capStr(d?.rejectedAxis, 24) ?? "",
  })) as Decision[];
  if (body.links) {
    const lim: Record<string, string> = {};
    for (const [k, v] of Object.entries(body.links).slice(0, 6)) lim[capStr(k, 24)!] = capStr(v, 300) ?? "";
    body.links = lim;
  }
  body.deckUsage = Array.isArray(body.deckUsage) ? body.deckUsage.slice(0, 20) : [];

  const started = Date.now();
  const usage: LlmUsage[] = [...(body.deckUsage ?? [])];
  const baseLog = gentle
    ? situationalLog({ name: body.name, niche: body.niche, calibration: body.calibration, answers: body.answers ?? [] })
    : decisionLog(body);
  const log = body.social?.platform
    ? `${baseLog}\n\n${socialContext(body.social)}`
    : baseLog;
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
      input: { name: body.name, niche: body.niche, version: body.version, arm: body.arm ?? "deck", seedAnswers: body.seedAnswers, calibration: body.calibration, decisions: body.decisions, answers: body.answers, links: body.links, social: body.social ?? null },
      result: { ...diagnosis, sprints },
      validator: { ...validation, retried },
      usage,
      latency_ms: Date.now() - started,
    })
    .select("id")
    .single();
  if (error) throw error;

  // Начальная память Мелио — из диагноза. Клиент сохранит её в progress.melio_memory.
  const memory = buildInitialMemory({ diagnosis, niche: body.niche, model: body.calibration.model });

  return { status: "ok", id: data.id, result: { ...diagnosis, sprints }, memory };
}

async function loadConfig(): Promise<CourseConfig> {
  const { data } = await db.from("course_config").select("data").eq("id", 1).maybeSingle();
  return normalizeConfig(data?.data);
}

async function course(body: { calibration: Calibration; niche?: string; diagnosis: Diagnosis; lang?: string; profile?: string }) {
  if (!body.diagnosis?.weakness || !body.calibration) throw new Error("diagnosis required");
  const niche = capStr(body.niche, 120);
  const profile = capStr(body.profile, 600);
  const usage: LlmUsage[] = [];
  const axis = body.diagnosis.weakness.axis;
  const cfg = await loadConfig();
  if (cfg.scope === "global") {
    const lessons = await runGlobalCourse(body.calibration, niche, body.diagnosis, usage, body.lang, profile, cfg);
    return { status: "ok", lessons, total: programLength(body.diagnosis, cfg), scope: "global" };
  }
  const lessons = await runCourse(axis, body.calibration, niche, body.diagnosis, usage, body.lang, profile, cfg);
  return { status: "ok", lessons, total: courseLength(axis), scope: "focus" };
}

// Тестовый урок для лаборатории: генерит ОДИН урок по переданному (несохранённому)
// конфигу и примерным вводным — чтобы видеть эффект весов на реальном ответе модели.
async function testLesson(body: {
  config?: unknown; niche?: string; axis?: string; index?: number;
  model?: string; lang?: string; profile?: string; weaknessTitle?: string;
}) {
  const cfg = normalizeConfig(body.config);
  const axes = ["product", "marketing", "operations", "brand"];
  const axis = axes.includes(body.axis ?? "") ? body.axis! : "marketing";
  const total = courseLength(axis);
  const index = Math.min(Math.max(Math.floor(Number(body.index) || 0), 0), total - 1);
  const niche = String(body.niche ?? "").slice(0, 120);
  const superAxis = axes.find((a) => a !== axis) ?? "product";
  const cal: Calibration = { industry: niche || "малый бизнес", model: body.model === "B2B" ? "B2B" : "B2C", key_metric: "продажи в месяц" };
  const wTitle = String(body.weaknessTitle ?? "").slice(0, 60) || AXIS_NAMES[axis];
  const diagnosis: Diagnosis = {
    diagnosis: `Ты силён в направлении «${AXIS_NAMES[superAxis]}», но проседаешь в «${AXIS_NAMES[axis]}» — почти не уделяешь этому внимания.`,
    weakness: { axis, title: wTitle, note: `почти не занимаешься направлением «${AXIS_NAMES[axis]}»` },
    superpower: { axis: superAxis, title: AXIS_NAMES[superAxis], note: "делаешь это лучше всего" },
    axes: [],
  };
  const usage: LlmUsage[] = [];
  const lesson = await runLesson(index, axis, cal, niche, diagnosis, usage, body.lang, body.profile, cfg);
  return { status: "ok", lesson, usage };
}

// Агент Мелио — все три режима. Память приходит от клиента (progress.melio_memory) либо
// собирается из простых полей теста. Агент возвращает memory_delta — применяем безопасно
// и отдаём memory_new (его сохраняет клиент под своим RLS).
async function melio(body: {
  mode?: string; lang?: string;
  memory?: unknown; input?: unknown;
  niche?: string; axis?: string; level?: number; index?: number;
  artifact?: string; answers?: unknown[];
}) {
  const mode = (["lesson", "review", "reassess"].includes(body.mode ?? "") ? body.mode : "lesson") as "lesson" | "review" | "reassess";
  const axes = ["product", "marketing", "operations", "brand"];
  const axis = axes.includes(body.axis ?? "") ? body.axis! : "marketing";
  const plan = planFor(axis);
  const idx = Math.min(Math.max(Math.floor(Number(body.index) || 0), 0), plan.length - 1);
  const niche = String(body.niche ?? "").slice(0, 120);
  const level = Math.min(Math.max(Math.floor(Number(body.level) || 1), 1), 5);

  const memory = (body.memory as MelioMemory) ?? buildInitialMemory({ niche, level });
  if (!body.memory) memory.focus_weakspot = axis;

  let input: unknown;
  if (mode === "review") {
    input = { artifact: String(body.artifact ?? "").slice(0, 6000) };
  } else if (mode === "reassess") {
    input = { answers: Array.isArray(body.answers) ? body.answers.slice(0, 40) : [], artifact: String(body.artifact ?? "").slice(0, 6000) };
  } else {
    input = body.input ?? {
      facts: [{ id: `f-${axis}-${idx}`, text: plan[idx].anchor, src: "observed" }],
      hint: { term: plan[idx].term, focus: plan[idx].focus },
    };
  }

  const usage: LlmUsage[] = [];
  const out = await runMelio(mode, memory, input, usage, body.lang);
  const memory_new = applyDelta(memory, out.memory_delta);
  return { status: "ok", ...out, memory_new, usage };
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

// Оплата: создаём ссылку checkout у текущего провайдера. Привязку (user_id/email) кладём
// в custom-данные — вернётся в вебхуке.
async function checkout(body: { product?: string; email?: string; userId?: string; redirectUrl?: string }) {
  const product = body.product || "course";
  const url = await paymentAdapter().createCheckout({
    product,
    email: body.email,
    userId: body.userId,
    redirectUrl: body.redirectUrl || "https://melyo.tech/#/cabinet",
  });
  return { status: "ok", url };
}

// Вебхук провайдера: проверяем подпись, нормализуем, пишем доступ. Идемпотентно по external_id.
async function paymentWebhook(req: Request) {
  const raw = await req.text();
  const adapter = paymentAdapter();
  const valid = await adapter.verifyWebhook(raw, req.headers);
  if (!valid) return { status: "bad signature" };
  const p = adapter.parseWebhook(raw);
  if (!p || !p.ok || !p.externalId) return { status: "ignored" };

  // Defense-in-depth: если задан минимум суммы — не выдаём доступ за оплату ниже цены.
  const minAmount = Number(Deno.env.get("ENTITLEMENT_MIN_AMOUNT"));
  if (minAmount > 0 && typeof p.amount === "number" && p.amount < minAmount) {
    console.warn(`webhook amount ${p.amount} < min ${minAmount} — доступ не выдан`);
    return { status: "amount too low" };
  }

  const { error } = await db.from("entitlements").upsert({
    email: p.email ?? null,
    user_id: p.userId || null,
    product: p.product,
    provider: adapter.name,
    status: p.status,
    external_id: p.externalId,
    amount: p.amount ?? null,
    currency: p.currency ?? null,
  }, { onConflict: "provider,external_id" });
  if (error) console.error("entitlement upsert:", error.message);
  return { status: "ok" };
}

// Проверка доступа. Для залогиненных ЛИЧНОСТЬ берём из проверенного JWT (accessToken),
// а не из тела запроса — иначе можно было бы прислать чужой userId. email — мягкий фолбэк
// для гостевых покупок (по природе слабее; жёсткий замок должен опираться на JWT).
async function entitlement(body: { product?: string; userId?: string; email?: string; accessToken?: string }) {
  const product = capStr(body.product, 40) || "course";
  let userId = "";
  let email = "";

  if (body.accessToken) {
    const { data } = await db.auth.getUser(body.accessToken);
    if (data?.user) { userId = data.user.id; email = (data.user.email ?? "").toLowerCase(); }
  }
  // Без токена принимаем email как незаверенный фолбэк (гость). userId из тела НЕ доверяем.
  if (!userId && !email) email = (capStr(body.email, 160) ?? "").trim().toLowerCase();
  if (!email && !userId) return { active: false };

  let q = db.from("entitlements").select("id").eq("product", product).eq("status", "active");
  q = userId && email ? q.or(`user_id.eq.${userId},email.eq.${email}`) : userId ? q.eq("user_id", userId) : q.eq("email", email);
  const { data, error } = await q.limit(1);
  if (error) { console.error("entitlement check:", error.message); return { active: false }; }
  return { active: (data?.length ?? 0) > 0 };
}

// ── Telegram ────────────────────────────────────────────────────────────────

// Фронт (залогинен) заводит одноразовый токен для deep-link «Подключить Telegram».
async function tgToken(body: { accessToken?: string }) {
  if (!body.accessToken) throw new Error("auth required");
  const { data } = await db.auth.getUser(body.accessToken);
  const userId = data?.user?.id;
  if (!userId) throw new Error("auth required");
  const token = crypto.randomUUID().replace(/-/g, "");
  const { error } = await db.from("telegram_tokens").insert({ token, user_id: userId });
  if (error) throw error;
  const bot = Deno.env.get("BOT_USERNAME");
  return { status: "ok", token, deepLink: bot ? `https://t.me/${bot}?start=${token}` : null };
}

// Бот гасит токен при /start и связывает чат с пользователем.
async function tgLink(body: { token?: string; chatId?: number }) {
  const token = capStr(body.token, 64);
  const chatId = Number(body.chatId);
  if (!token || !Number.isFinite(chatId)) throw new Error("token and chatId required");
  const { data: tok } = await db.from("telegram_tokens")
    .select("user_id, used").eq("token", token).maybeSingle();
  if (!tok || tok.used) return { status: "invalid" };
  await db.from("telegram_tokens").update({ used: true }).eq("token", token);
  await db.from("telegram_links").upsert({ chat_id: chatId, user_id: tok.user_id, active: true });
  const { data: prog } = await db.from("progress").select("data").eq("user_id", tok.user_id).maybeSingle();
  const name = (prog?.data as { name?: string } | null)?.name ?? null;
  return { status: "ok", userId: tok.user_id, name };
}

async function chatUserId(chatId: number): Promise<string | null> {
  const { data } = await db.from("telegram_links")
    .select("user_id").eq("chat_id", chatId).eq("active", true).maybeSingle();
  return data?.user_id ?? null;
}

// Реплика Мелио в переписке: грузим память по chatId, отвечаем, дописываем дельту.
async function tgChat(body: { chatId?: number; text?: string; mode?: string; lang?: string }) {
  const chatId = Number(body.chatId);
  const text = capStr(body.text, 2000);
  if (!Number.isFinite(chatId) || !text) throw new Error("chatId and text required");
  const userId = await chatUserId(chatId);
  if (!userId) return { reply: "Похоже, аккаунт ещё не подключён. Открой меня из приложения Melyo по кнопке «Подключить Telegram»." };

  const { data: prog } = await db.from("progress").select("data").eq("user_id", userId).maybeSingle();
  const pdata = (prog?.data ?? {}) as Record<string, unknown>;
  const memory = pdata.melio_memory ?? buildInitialMemory({});
  const history = Array.isArray(pdata.tg_history) ? pdata.tg_history as { role: string; content: string }[] : [];

  const usage: LlmUsage[] = [];
  const out = await runMelioChat(memory, text, history, usage, body.lang);
  const reply = String(out?.reply ?? "").trim() || "Дай мне секунду — сформулирую. Повтори, пожалуйста, чуть иначе?";

  const memory_new = applyDelta(memory as MelioMemory, out?.memory_delta);
  const nextHistory = [...history, { role: "user", content: text }, { role: "melio", content: reply }].slice(-20);
  await db.from("progress").upsert({
    user_id: userId,
    data: { ...pdata, melio_memory: memory_new, tg_history: nextHistory },
    updated_at: new Date().toISOString(),
  });
  return { reply, usage };
}

async function tgEntitlement(body: { chatId?: number; product?: string }) {
  const chatId = Number(body.chatId);
  if (!Number.isFinite(chatId)) return { active: false };
  const userId = await chatUserId(chatId);
  if (!userId) return { active: false };
  const product = capStr(body.product, 40) || "course";
  const { data } = await db.from("entitlements").select("id")
    .eq("product", product).eq("status", "active").eq("user_id", userId).limit(1);
  return { active: (data?.length ?? 0) > 0 };
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

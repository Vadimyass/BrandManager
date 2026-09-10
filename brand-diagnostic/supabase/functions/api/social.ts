// Анализ публичных бизнес-страниц (Instagram/TikTok) через провайдера-скрейпер.
// Провайдер-агностик: сейчас Apify (актор за env-ключом). Тянем ТОЛЬКО публичное:
// bio, категорию, число подписчиков и тексты последних постов — без данных подписчиков.
// Ключи и id акторов — из окружения; без ключа функция мягко возвращает null.

import { computeInsights, type Insight, insightsToCard } from "./insights.ts";

export type SocialPlatform = "instagram" | "tiktok";

export interface PostStat {
  type: "photo" | "carousel" | "video" | "unknown";
  likes: number;
  comments: number;
  ts?: string; // ISO-дата публикации
}

export interface SocialProfile {
  platform: SocialPlatform;
  handle: string;
  url: string;
  bio: string;
  category?: string;
  followers?: number;
  externalUrl?: string; // ссылка из шапки (для инсайта «воронка-тупик»)
  posts: string[]; // тексты/подписи последних постов (контекст для агентов)
  postStats?: PostStat[]; // тип/вовлечение/дата — для движка инсайтов
  insights?: Insight[]; // сработавшие наблюдения
  stat?: { value: string; label: string }; // топ-инсайт для карточки
  highlights?: string[]; // ещё 1–2 наблюдения для карточки
}

const APIFY_BASE = "https://api.apify.com/v2";
const POSTS_LIMIT = 12;
const POST_TEXT_CAP = 400;

// Актор по умолчанию можно переопределить env-переменной под свой аккаунт/тариф.
const IG_ACTOR = Deno.env.get("APIFY_IG_ACTOR") || "apify~instagram-scraper";
const TT_ACTOR = Deno.env.get("APIFY_TT_ACTOR") || "clockworks~tiktok-scraper";

export function detectPlatform(url: string): SocialPlatform | null {
  const u = url.toLowerCase();
  if (u.includes("instagram.com")) return "instagram";
  if (u.includes("tiktok.com")) return "tiktok";
  return null;
}

function handleFrom(url: string): string {
  const m = url.match(/(?:instagram\.com|tiktok\.com)\/@?([A-Za-z0-9_.]+)/i);
  return m?.[1] ?? "";
}

async function runActor(actor: string, input: unknown, token: string): Promise<unknown[]> {
  const res = await fetch(
    `${APIFY_BASE}/acts/${actor}/run-sync-get-dataset-items?token=${encodeURIComponent(token)}&clean=true`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(input),
    },
  );
  if (!res.ok) throw new Error(`apify ${actor} ${res.status}`);
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

function pickText(v: unknown): string {
  return typeof v === "string" ? v.trim().slice(0, POST_TEXT_CAP) : "";
}

// Достаём подписи постов из разношёрстного вывода актора (форматы отличаются).
function extractPosts(items: Record<string, unknown>[]): string[] {
  const out: string[] = [];
  for (const it of items) {
    const cap = pickText(it.caption ?? it.text ?? it.title ?? it.description);
    if (cap) out.push(cap);
    const latest = it.latestPosts ?? it.posts;
    if (Array.isArray(latest)) {
      for (const p of latest) {
        const c = pickText((p as Record<string, unknown>)?.caption ?? (p as Record<string, unknown>)?.text);
        if (c) out.push(c);
      }
    }
  }
  return out.slice(0, POSTS_LIMIT);
}

function toNumber(v: unknown): number | undefined {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? Math.round(n) : undefined;
}

function num(v: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? Math.round(n) : 0;
}

// Собираем сырые объекты постов из разных форматов вывода актора.
function collectPostRows(items: Record<string, unknown>[]): Record<string, unknown>[] {
  const rows: Record<string, unknown>[] = [];
  for (const it of items) {
    const latest = it.latestPosts ?? it.posts ?? it.topPosts;
    if (Array.isArray(latest)) rows.push(...(latest as Record<string, unknown>[]));
    else if (it.caption != null || it.likesCount != null || it.type != null) rows.push(it);
  }
  return rows.slice(0, POSTS_LIMIT);
}

function mapPostType(raw: unknown): PostStat["type"] {
  const t = String(raw ?? "").toLowerCase();
  if (t.includes("sidecar") || t.includes("carousel")) return "carousel";
  if (t.includes("video") || t.includes("reel") || t.includes("clips")) return "video";
  if (t.includes("image") || t.includes("photo") || t.includes("graphimage")) return "photo";
  return "unknown";
}

function extractPostStats(rows: Record<string, unknown>[]): PostStat[] {
  return rows.map((p) => ({
    type: mapPostType(p.type ?? p.productType ?? p.mediaType),
    likes: num(p.likesCount ?? p.likes ?? p.diggCount),
    comments: num(p.commentsCount ?? p.comments ?? p.commentCount),
    ts: typeof (p.timestamp ?? p.taken_at ?? p.createTimeISO) === "string"
      ? String(p.timestamp ?? p.taken_at ?? p.createTimeISO)
      : undefined,
  }));
}

async function analyzeInstagram(url: string, handle: string, token: string): Promise<SocialProfile> {
  const items = (await runActor(IG_ACTOR, {
    directUrls: [url],
    resultsType: "details",
    resultsLimit: POSTS_LIMIT,
    addParentData: false,
  }, token)) as Record<string, unknown>[];
  const head = items[0] ?? {};
  const rows = collectPostRows(items);
  return {
    platform: "instagram",
    handle: String(head.username ?? handle),
    url,
    bio: pickText(head.biography ?? head.bio),
    category: pickText(head.businessCategoryName ?? head.category) || undefined,
    followers: toNumber(head.followersCount ?? head.followers),
    externalUrl: pickText(head.externalUrl ?? head.external_url ?? head.bioLink) || "",
    posts: extractPosts(items),
    postStats: extractPostStats(rows),
  };
}

async function analyzeTikTok(url: string, handle: string, token: string): Promise<SocialProfile> {
  const items = (await runActor(TT_ACTOR, {
    profiles: [handle],
    resultsPerPage: POSTS_LIMIT,
    shouldDownloadVideos: false,
    shouldDownloadCovers: false,
  }, token)) as Record<string, unknown>[];
  const head = items[0] ?? {};
  const authorMeta = (head.authorMeta ?? {}) as Record<string, unknown>;
  const rows = collectPostRows(items).length ? collectPostRows(items) : (items as Record<string, unknown>[]);
  return {
    platform: "tiktok",
    handle: String(authorMeta.name ?? handle),
    url,
    bio: pickText(authorMeta.signature ?? head.signature),
    category: undefined,
    followers: toNumber(authorMeta.fans ?? head.fans),
    externalUrl: pickText(authorMeta.bioLink ?? head.bioLink) || "",
    posts: extractPosts(items),
    postStats: extractPostStats(rows.map((r) => ({ ...r, type: r.type ?? "video" }))),
  };
}

// Главная точка входа: по ссылке возвращает нормализованный публичный профиль или null.
export async function analyzeSocial(url: string): Promise<SocialProfile | null> {
  const token = Deno.env.get("APIFY_TOKEN");
  if (!token) return null;
  const platform = detectPlatform(url);
  const handle = handleFrom(url);
  if (!platform || !handle) return null;
  try {
    const profile = platform === "instagram"
      ? await analyzeInstagram(url, handle, token)
      : await analyzeTikTok(url, handle, token);
    if (!(profile.bio || profile.posts.length)) return null;
    const insights = computeInsights(profile);
    const card = insightsToCard(insights);
    profile.insights = insights;
    if (card.stat) profile.stat = card.stat;
    if (card.highlights.length) profile.highlights = card.highlights;
    return profile;
  } catch (e) {
    console.error("analyzeSocial", e instanceof Error ? e.message : String(e));
    return null;
  }
}

// Компактный observed-контекст для агентов диагностики (только публичные тексты).
export function socialContext(profile: SocialProfile): string {
  const lines = [
    `ПУБЛИЧНАЯ СТРАНИЦА (${profile.platform}, @${profile.handle}) — наблюдаемые факты, не самооценка:`,
    profile.followers ? `Подписчиков: ${profile.followers}.` : "",
    profile.category ? `Категория: ${profile.category}.` : "",
    profile.bio ? `Био: «${profile.bio}»` : "",
  ].filter(Boolean);
  if (profile.externalUrl != null) {
    lines.push(profile.externalUrl ? `Ссылка в шапке: есть.` : `Ссылки/оффера в шапке нет.`);
  }
  if (profile.insights?.length) {
    lines.push("Замеченные сигналы (данные страницы против бенчмарков):");
    profile.insights.forEach((i) => lines.push(`— ${i.value}: ${i.label}`));
  }
  if (profile.posts.length) {
    lines.push("Тексты последних постов:");
    profile.posts.forEach((p, i) => lines.push(`${i + 1}. ${p}`));
  }
  return lines.join("\n");
}

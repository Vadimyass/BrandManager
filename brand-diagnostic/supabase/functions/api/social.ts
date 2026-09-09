// Анализ публичных бизнес-страниц (Instagram/TikTok) через провайдера-скрейпер.
// Провайдер-агностик: сейчас Apify (актор за env-ключом). Тянем ТОЛЬКО публичное:
// bio, категорию, число подписчиков и тексты последних постов — без данных подписчиков.
// Ключи и id акторов — из окружения; без ключа функция мягко возвращает null.

export type SocialPlatform = "instagram" | "tiktok";

export interface SocialProfile {
  platform: SocialPlatform;
  handle: string;
  url: string;
  bio: string;
  category?: string;
  followers?: number;
  posts: string[]; // тексты/подписи последних постов
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

async function analyzeInstagram(url: string, handle: string, token: string): Promise<SocialProfile> {
  const items = (await runActor(IG_ACTOR, {
    directUrls: [url],
    resultsType: "details",
    resultsLimit: POSTS_LIMIT,
    addParentData: false,
  }, token)) as Record<string, unknown>[];
  const head = items[0] ?? {};
  return {
    platform: "instagram",
    handle: String(head.username ?? handle),
    url,
    bio: pickText(head.biography ?? head.bio),
    category: pickText(head.businessCategoryName ?? head.category) || undefined,
    followers: toNumber(head.followersCount ?? head.followers),
    posts: extractPosts(items),
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
  return {
    platform: "tiktok",
    handle: String(authorMeta.name ?? handle),
    url,
    bio: pickText(authorMeta.signature ?? head.signature),
    category: undefined,
    followers: toNumber(authorMeta.fans ?? head.fans),
    posts: extractPosts(items),
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
    return (profile.bio || profile.posts.length) ? profile : null;
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
  if (profile.posts.length) {
    lines.push("Тексты последних постов:");
    profile.posts.forEach((p, i) => lines.push(`${i + 1}. ${p}`));
  }
  return lines.join("\n");
}

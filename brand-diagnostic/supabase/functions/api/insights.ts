// Движок «инсайдерских» наблюдений по публичному профилю. Берём то, что видно
// (посты, вовлечение, формат, ритм, шапка) и сталкиваем с бенчмарками 2026 →
// получаем неожиданные, но честные выводы. Каждое наблюдение срабатывает ТОЛЬКО
// при наличии данных под него — не выдумываем. Возвращаем самые острые.
import type { SocialProfile } from "./social.ts";

export interface Insight {
  id: string;
  severity: number; // 1..3 — насколько острое (3 = самое сильное)
  value: string; // короткая цифра для крупной подачи
  label: string; // человеческая расшифровка наблюдения
  lesson: string; // мостик: что с этим сделаем в курсе
}

// Мостик к курсу для каждого наблюдения (намёк, что в платной части починим).
const LESSON: Record<string, string> = {
  er: "В курсе — как растить внимание, а не просто число подписчиков",
  format: "Разберём, какой формат под какую задачу и как их чередовать",
  passive: "Покажу, как писать так, чтобы сохраняли и пересылали, а не пролистывали",
  cadence: "Соберём простой ритм постинга, который реально держать",
  niche: "Как выделиться оффером там, где контентом уже не пробиться",
  funnel: "Настроим путь от поста к заявке, чтобы внимание не утекало",
};

const SATURATED = ["beauty", "красот", "космет", "retail", "магазин", "одежд", "fashion", "мода"];

function mean(xs: number[]): number {
  return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0;
}
function sum(xs: number[]): number {
  return xs.reduce((a, b) => a + b, 0);
}
function medianGapDays(timestamps: number[]): number | null {
  const ts = timestamps.filter((t) => t > 0).sort((a, b) => b - a);
  if (ts.length < 3) return null;
  const gaps: number[] = [];
  for (let i = 1; i < ts.length; i++) gaps.push((ts[i - 1] - ts[i]) / 86400000);
  gaps.sort((a, b) => a - b);
  const m = gaps[Math.floor(gaps.length / 2)];
  return Math.max(1, Math.round(m));
}

export function computeInsights(p: SocialProfile): Insight[] {
  const posts = Array.isArray(p.postStats) ? p.postStats : [];
  const withEng = posts.filter((x) => (x.likes ?? 0) > 0 || (x.comments ?? 0) > 0);
  const out: Omit<Insight, "lesson">[] = [];

  // 1. Парадокс подписчиков: вовлечение против нормы для размера аккаунта.
  if (p.followers && p.followers > 0 && withEng.length >= 3) {
    const avg = mean(withEng.map((x) => (x.likes ?? 0) + (x.comments ?? 0)));
    const er = (avg / p.followers) * 100;
    const good = p.followers < 10000 ? 5 : p.followers < 50000 ? 2.5 : 1.2;
    if (er < good) {
      out.push({
        id: "er",
        severity: er < good / 2 ? 3 : 2,
        value: `${er.toFixed(1)}%`,
        label: `реагируют ~${er.toFixed(1)}% подписчиков — для твоего размера норма около ${good}%. Подписчики есть, а внимания нет`,
      });
    }
  }

  // 2. Формат работает против тебя: перекос в одиночные фото.
  if (posts.length >= 4) {
    const photos = posts.filter((x) => x.type === "photo").length;
    const share = photos / posts.length;
    if (share >= 0.6) {
      out.push({
        id: "format",
        severity: 2,
        value: `${Math.round(share * 100)}%`,
        label: `постов — одиночные фото, самый слабый формат. Карусели дают вовлечение вдвое выше, reels — охват; ты между ними`,
      });
    }
  }

  // 3. Пассивное вовлечение: лайки есть, разговора нет (алгоритм это не любит).
  if (withEng.length >= 3) {
    const likes = sum(withEng.map((x) => x.likes ?? 0));
    const comments = sum(withEng.map((x) => x.comments ?? 0));
    if (likes > 0 && comments / likes < 0.02) {
      out.push({
        id: "passive",
        severity: 2,
        value: `${((comments / likes) * 100).toFixed(1)}%`,
        label: `комментариев к лайкам почти нет — алгоритм читает это как «посмотрели и забыли», поэтому охват не растёт`,
      });
    }
  }

  // 5. Рваный ритм: регулярные растут ~на 25% быстрее.
  const gap = medianGapDays(posts.map((x) => (x.ts ? Date.parse(x.ts) : 0)));
  if (gap && gap > 4) {
    out.push({
      id: "cadence",
      severity: 2,
      value: `раз в ${gap} дн.`,
      label: `постишь рывками. Аккаунты с ровным ритмом растут примерно на 25% быстрее на том же контенте`,
    });
  }

  // 6. Ниша-потолок: в перенасыщенных нишах выигрывают не контентом.
  const cat = (p.category || "").toLowerCase();
  if (cat && SATURATED.some((s) => cat.includes(s))) {
    out.push({
      id: "niche",
      severity: 1,
      value: "низкий потолок",
      label: `твоя ниша перенасыщена — тут побеждают оффером и узнаваемостью, а не количеством постов`,
    });
  }

  // 7. Шапка-тупик: нет ссылки/оффера — контенту некуда вести.
  if (p.externalUrl === "" || p.externalUrl == null) {
    out.push({
      id: "funnel",
      severity: 2,
      value: "нет ссылки",
      label: `в шапке нет ссылки на заявку или оффера — люди досматривают и не знают, что делать дальше`,
    });
  }

  return out
    .map((i) => ({ ...i, lesson: LESSON[i.id] ?? "" }))
    .sort((a, b) => b.severity - a.severity);
}

// Верхний инсайт → крупная цифра карточки; ещё 1–2 → наблюдения списком.
export function insightsToCard(insights: Insight[]): { stat: { value: string; label: string; lesson?: string } | null; highlights: string[] } {
  if (!insights.length) return { stat: null, highlights: [] };
  const [top, ...rest] = insights;
  return {
    stat: { value: top.value, label: top.label, lesson: top.lesson },
    highlights: rest.slice(0, 2).map((i) => i.label),
  };
}

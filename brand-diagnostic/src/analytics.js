const BASE = import.meta.env.VITE_SUPABASE_URL;
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const SID_KEY = "bd_sid";

function sessionId() {
  try {
    let sid = localStorage.getItem(SID_KEY);
    if (!sid) {
      sid = (crypto?.randomUUID?.() ?? String(Date.now()) + Math.random().toString(36).slice(2));
      localStorage.setItem(SID_KEY, sid);
    }
    return sid;
  } catch {
    return "anon";
  }
}

let niche = null;
export function setTrackNiche(n) { niche = n; }

// Выстрелил и забыл: аналитика никогда не блокирует и не роняет поток.
export function track(name, props) {
  try {
    const body = JSON.stringify({
      sessionId: sessionId(),
      name,
      props: props ?? null,
      niche,
      referrer: document.referrer || null,
    });
    // fetch+keepalive (не sendBeacon): Supabase-функции нужен apikey в заголовке, а beacon его не передаёт.
    fetch(`${BASE}/functions/v1/api/track`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${KEY}`, apikey: KEY },
      body,
      keepalive: true,
    }).catch(() => {});
  } catch { /* ignore */ }
}

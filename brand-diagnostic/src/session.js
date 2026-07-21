const KEY = "bd_session_v1";
const TTL_MS = 24 * 60 * 60 * 1000;

// Фазы, на которых в момент ухода со вкладки висел незавершённый запрос — их надо повторить при возврате.
export const PENDING_PHASES = ["prep", "analyzing", "building"];

export function saveSession(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ savedAt: Date.now(), state }));
  } catch { /* приватный режим или переполнение — не критично */ }
}

export function loadSession() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const { savedAt, state } = JSON.parse(raw);
    if (!savedAt || Date.now() - savedAt > TTL_MS) {
      localStorage.removeItem(KEY);
      return null;
    }
    return state ?? null;
  } catch {
    return null;
  }
}

export function clearSession() {
  try {
    localStorage.removeItem(KEY);
  } catch { /* ignore */ }
}

const BASE = import.meta.env.VITE_SUPABASE_URL;
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

async function post(route, body) {
  const res = await fetch(`${BASE}/functions/v1/api/${route}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${KEY}`,
      apikey: KEY,
    },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

export const getDeck = (seedAnswers, name) => post("deck", { seedAnswers, name });
export const diagnose = (payload) => post("diagnose", payload);
export const sendFeedback = (id, verdict) => post("feedback", { id, verdict });
export const joinWaitlist = (email, diagnosticId) => post("waitlist", { email, diagnosticId });

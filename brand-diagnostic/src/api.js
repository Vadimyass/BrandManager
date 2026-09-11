import { getLang } from "./i18n.js";

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
    body: JSON.stringify({ lang: getLang(), ...body }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

export const getDeck = (seedAnswers, name, niche, arm) => post("deck", { seedAnswers, name, niche, arm });
export const analyzeSocial = (url) => post("social-analyze", { url });
export const diagnose = (payload) => post("diagnose", payload);
export const sendFeedback = (id, verdict) => post("feedback", { id, verdict });
export const joinWaitlist = (email, diagnosticId, intent) => post("waitlist", { email, diagnosticId, intent });
export const getLesson = (index, calibration, niche, diagnosis) => post("lesson", { index, calibration, niche, diagnosis });
export const getCourse = (calibration, niche, diagnosis, profile) => post("course", { calibration, niche, diagnosis, profile });
export const gradeHomework = (axis, index, task, submission, calibration, niche) =>
  post("grade", { axis, index, task, submission, calibration, niche });
export const startCheckout = (payload) => post("checkout", payload);
export const checkEntitlement = (payload) => post("entitlement", payload);
export const getTelegramLink = (accessToken) => post("tg-token", { accessToken });
export const reviewArtifact = (accessToken, artifact) => post("review", { accessToken, artifact });
export const reassessProgress = (accessToken, artifact) => post("reassess", { accessToken, artifact });
export const craftArtifact = (accessToken, kind) => post("craft", { accessToken, kind });
export const getPlan = (accessToken) => post("plan", { accessToken, action: "get" });
export const generatePlan = (accessToken) => post("plan", { accessToken, action: "generate" });
export const togglePlanStep = (accessToken, index) => post("plan", { accessToken, action: "done", index });

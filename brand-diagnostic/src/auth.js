import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Отдельный клиент supabase-js — только для авторизации и таблицы progress (через RLS с JWT пользователя).
// Основной поток (диагностика/курс) по-прежнему идёт через Edge Function с service role.
// flowType: "implicit" — токен возвращается в #hash и подхватывается на статике (GitHub Pages)
// без обмена кода. PKCE (дефолт) требует серверного обмена и на статике часто молча не срабатывает.
export const supabase = createClient(url, key, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: "implicit",
  },
});

// Если Google/Supabase вернули ошибку в адресе — достаём её, чтобы показать, а не молчать.
export function authErrorFromUrl() {
  try {
    const h = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const q = new URLSearchParams(window.location.search);
    return h.get("error_description") || h.get("error") || q.get("error_description") || q.get("error") || null;
  } catch {
    return null;
  }
}

export function signInWithGoogle() {
  const redirectTo = window.location.origin + window.location.pathname;
  return supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo } });
}

export function signOut() {
  return supabase.auth.signOut();
}

export async function loadProgress(userId) {
  const { data, error } = await supabase.from("progress").select("data").eq("user_id", userId).maybeSingle();
  if (error) { console.warn("loadProgress", error.message); return null; }
  return data?.data ?? null;
}

export async function saveProgress(userId, data) {
  const { error } = await supabase
    .from("progress")
    .upsert({ user_id: userId, data, updated_at: new Date().toISOString() });
  if (error) console.warn("saveProgress", error.message);
}

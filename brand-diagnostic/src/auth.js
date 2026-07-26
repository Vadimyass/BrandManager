import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Отдельный клиент supabase-js — только для авторизации и таблицы progress (через RLS с JWT пользователя).
// Основной поток (диагностика/курс) по-прежнему идёт через Edge Function с service role.
export const supabase = createClient(url, key, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
});

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

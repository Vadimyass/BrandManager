export type AgentRole = "gate" | "assessor" | "validator";

const DEFAULT_MODELS: Record<AgentRole, string> = {
  gate: "deepseek/deepseek-chat",
  assessor: "anthropic/claude-sonnet-4.6",
  validator: "anthropic/claude-haiku-4.5",
};

export function modelFor(role: AgentRole): string {
  const envKey = `MODEL_${role.toUpperCase()}`;
  return Deno.env.get(envKey) ?? DEFAULT_MODELS[role];
}

export interface LlmUsage {
  role: AgentRole;
  model: string;
  prompt_tokens?: number;
  completion_tokens?: number;
}

// Уровень-1 кэш промптов: системный промпт статичен в каждом вызове роли.
// Для Claude-моделей помечаем его cache_control — кэш-риды дают скидку до 90% на входную часть.
// Для остальных моделей отправляем обычной строкой (массив-контент они могут не принять).
function systemContent(model: string, system: string): unknown {
  if (model.startsWith("anthropic/")) {
    return [{ type: "text", text: system, cache_control: { type: "ephemeral" } }];
  }
  return system;
}

const JSON_REMINDER =
  "Верни ТОЛЬКО валидный JSON одним объектом. Без markdown, без пояснений до и после. " +
  "Внутри строк не используй перевод строки и двойные кавычки. Не ставь запятую перед закрывающей скобкой.";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function callModel(
  role: AgentRole,
  model: string,
  system: string,
  user: string,
  maxTokens: number,
  usageLog: LlmUsage[],
): Promise<string> {
  const body = JSON.stringify({
    model,
    max_tokens: maxTokens,
    temperature: 0.2,
    messages: [
      { role: "system", content: systemContent(model, system) },
      { role: "user", content: user },
    ],
  });

  // Бесплатные модели часто отдают 429/503 при всплеске — повторяем с нарастающей паузой.
  const MAX_ATTEMPTS = 4;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${Deno.env.get("OPENROUTER_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body,
    });

    if (res.ok) {
      const data = await res.json();
      usageLog.push({ role, model, ...data.usage });
      return data.choices?.[0]?.message?.content ?? "";
    }

    const text = await res.text();
    const retriable = res.status === 429 || res.status === 503 || res.status === 502;
    if (!retriable || attempt === MAX_ATTEMPTS) {
      throw new Error(`OpenRouter ${res.status} (${role}/${model}): ${text}`);
    }
    const hinted = Number(text.match(/"retry_after_seconds":\s*(\d+)/)?.[1]);
    const waitMs = (hinted ? hinted * 1000 : 0) + 700 * attempt + Math.random() * 400;
    console.warn(`OpenRouter ${res.status} (${role}/${model}), attempt ${attempt}/${MAX_ATTEMPTS}, wait ${Math.round(waitMs)}ms`);
    await sleep(waitMs);
  }
  throw new Error(`OpenRouter unreachable (${role}/${model})`);
}

export async function llmJson<T>(
  role: AgentRole,
  system: string,
  user: string,
  usageLog: LlmUsage[],
  maxTokens = 1200,
): Promise<T> {
  const model = modelFor(role);
  const raw = await callModel(role, model, system, user, maxTokens, usageLog);
  try {
    return extractJson<T>(raw);
  } catch (first) {
    console.error(`JSON parse failed (${role}/${model}), retrying once:`, first);
    // Слабые модели регулярно ломают формат на длинной генерации — одна повторная попытка со строгим напоминанием.
    const retry = await callModel(role, model, `${system}\n\n${JSON_REMINDER}`, user, maxTokens, usageLog);
    try {
      return extractJson<T>(retry);
    } catch (second) {
      throw new Error(
        `Модель вернула неразборный ответ (${role}/${model}). ` +
          `Попробуй ещё раз или переключи модель на более сильную. Детали: ${String(second)}`,
      );
    }
  }
}

function extractJson<T>(text: string): T {
  let t = text.trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();
  const a = t.indexOf("{");
  const b = t.lastIndexOf("}");
  if (a !== -1 && b !== -1) t = t.slice(a, b + 1);

  try {
    return JSON.parse(t) as T;
  } catch {
    return JSON.parse(repairJson(t)) as T;
  }
}

// Чинит три типовые поломки: сырые переводы строк внутри строк, висячие запятые, оборванный хвост.
function repairJson(input: string): string {
  let out = "";
  let inString = false;
  let escaped = false;
  const stack: string[] = [];

  for (const ch of input) {
    if (escaped) {
      out += ch;
      escaped = false;
      continue;
    }
    if (ch === "\\") {
      out += ch;
      escaped = true;
      continue;
    }
    if (ch === '"') {
      inString = !inString;
      out += ch;
      continue;
    }
    if (inString) {
      if (ch === "\n") out += "\\n";
      else if (ch === "\r") continue;
      else if (ch === "\t") out += "\\t";
      else out += ch;
      continue;
    }
    if (ch === "{" || ch === "[") stack.push(ch === "{" ? "}" : "]");
    if (ch === "}" || ch === "]") stack.pop();
    out += ch;
  }

  if (inString) out += '"';
  out = out.replace(/,(\s*[}\]])/g, "$1");
  while (stack.length) out += stack.pop();
  return out.replace(/,(\s*[}\]])/g, "$1");
}

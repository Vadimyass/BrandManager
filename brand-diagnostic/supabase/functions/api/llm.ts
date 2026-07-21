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

const JSON_REMINDER =
  "Верни ТОЛЬКО валидный JSON одним объектом. Без markdown, без пояснений до и после. " +
  "Внутри строк не используй перевод строки и двойные кавычки. Не ставь запятую перед закрывающей скобкой.";

async function callModel(
  role: AgentRole,
  model: string,
  system: string,
  user: string,
  maxTokens: number,
  usageLog: LlmUsage[],
): Promise<string> {
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${Deno.env.get("OPENROUTER_API_KEY")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      temperature: 0.2,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });
  if (!res.ok) {
    throw new Error(`OpenRouter ${res.status} (${role}/${model}): ${await res.text()}`);
  }
  const data = await res.json();
  usageLog.push({ role, model, ...data.usage });
  return data.choices?.[0]?.message?.content ?? "";
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

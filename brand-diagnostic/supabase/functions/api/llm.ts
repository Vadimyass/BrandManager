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

export async function llmJson<T>(
  role: AgentRole,
  system: string,
  user: string,
  usageLog: LlmUsage[],
  maxTokens = 1200,
): Promise<T> {
  const model = modelFor(role);
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
  return extractJson<T>(data.choices?.[0]?.message?.content ?? "");
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
  return JSON.parse(t) as T;
}

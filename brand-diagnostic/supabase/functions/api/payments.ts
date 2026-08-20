// Платёжный слой, независимый от провайдера. Провайдер прячется за адаптером с двумя
// функциями: createCheckout (ссылка на оплату) и parseWebhook (нормализованное событие).
// Переезд на Mono/WayForPay = новый адаптер + флип PAYMENT_PROVIDER. Остальное не меняется.

export interface CheckoutCtx {
  product: string;
  email?: string;
  userId?: string;
  redirectUrl?: string;
}

export interface NormalizedPurchase {
  ok: boolean;
  email?: string;
  userId?: string;
  product: string;
  externalId: string;
  amount?: number;
  currency?: string;
  status: string;
}

export interface PaymentAdapter {
  name: string;
  createCheckout(ctx: CheckoutCtx): Promise<string>;
  verifyWebhook(rawBody: string, headers: Headers): Promise<boolean>;
  parseWebhook(rawBody: string): NormalizedPurchase | null;
}

function env(k: string): string {
  return Deno.env.get(k) ?? "";
}

// ——— Lemon Squeezy (Merchant of Record) ———
const lemonSqueezy: PaymentAdapter = {
  name: "lemonsqueezy",

  async createCheckout(ctx) {
    const apiKey = env("LEMONSQUEEZY_API_KEY");
    const storeId = env("LEMONSQUEEZY_STORE_ID");
    const variantId = env("LEMONSQUEEZY_VARIANT_ID");
    if (!apiKey || !storeId || !variantId) throw new Error("Lemon Squeezy не настроен (ключ/стор/вариант)");

    const body = {
      data: {
        type: "checkouts",
        attributes: {
          checkout_data: {
            email: ctx.email || undefined,
            custom: { user_id: ctx.userId || "", product: ctx.product },
          },
          product_options: ctx.redirectUrl ? { redirect_url: ctx.redirectUrl } : {},
        },
        relationships: {
          store: { data: { type: "stores", id: String(storeId) } },
          variant: { data: { type: "variants", id: String(variantId) } },
        },
      },
    };
    const res = await fetch("https://api.lemonsqueezy.com/v1/checkouts", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Accept": "application/vnd.api+json",
        "Content-Type": "application/vnd.api+json",
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`Lemon Squeezy checkout ${res.status}: ${await res.text()}`);
    const data = await res.json();
    const url = data?.data?.attributes?.url;
    if (!url) throw new Error("Lemon Squeezy не вернул ссылку checkout");
    return url;
  },

  async verifyWebhook(rawBody, headers) {
    const secret = env("LEMONSQUEEZY_WEBHOOK_SECRET");
    const sig = headers.get("X-Signature") ?? "";
    if (!secret || !sig) return false;
    const expected = await hmacHex(secret, rawBody);
    return timingSafeEqual(expected, sig);
  },

  parseWebhook(rawBody) {
    let p: {
      meta?: { event_name?: string; custom_data?: { user_id?: string; product?: string } };
      data?: { id?: string; attributes?: { user_email?: string; total?: number; currency?: string; status?: string } };
    };
    try { p = JSON.parse(rawBody); } catch { return null; }
    const event = p?.meta?.event_name ?? "";
    if (event !== "order_created") return null; // разовая покупка курса
    const attr = p.data?.attributes ?? {};
    const custom = p.meta?.custom_data ?? {};
    return {
      ok: true,
      email: attr.user_email,
      userId: custom.user_id || undefined,
      product: custom.product || "course",
      externalId: String(p.data?.id ?? ""),
      amount: typeof attr.total === "number" ? attr.total / 100 : undefined,
      currency: attr.currency,
      status: "active",
    };
  },
};

const ADAPTERS: Record<string, PaymentAdapter> = { lemonsqueezy: lemonSqueezy };

export function paymentAdapter(): PaymentAdapter {
  const name = env("PAYMENT_PROVIDER") || "lemonsqueezy";
  return ADAPTERS[name] ?? lemonSqueezy;
}

async function hmacHex(secret: string, body: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}

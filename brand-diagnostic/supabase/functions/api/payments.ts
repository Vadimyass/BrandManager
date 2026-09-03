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

// ——— monopay (monobank acquiring, украинский ФОП) ———
// Комиссия ~1.3–1.5%, выплаты на счёт ФОП в гривне. Привязку кладём в reference.
let monoPubKey: CryptoKey | null = null;

const mono: PaymentAdapter = {
  name: "mono",

  async createCheckout(ctx) {
    const token = env("MONO_TOKEN");
    if (!token) throw new Error("monopay не настроен (нет MONO_TOKEN)");
    const amount = Number(env("MONO_COURSE_AMOUNT")) || 50000; // копейки, 50000 = 500.00 грн
    const reference = `${ctx.userId || ""}~${ctx.email || ""}~${ctx.product}`;
    const body = {
      amount,
      ccy: Number(env("MONO_CCY")) || 980, // 980 = UAH
      merchantPaymInfo: { reference, destination: "Курс Melyo" },
      redirectUrl: ctx.redirectUrl,
      webHookUrl: env("MONO_WEBHOOK_URL") || undefined,
    };
    const res = await fetch("https://api.monobank.ua/api/merchant/invoice/create", {
      method: "POST",
      headers: { "X-Token": token, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`monopay invoice/create ${res.status}: ${await res.text()}`);
    const data = await res.json();
    if (!data?.pageUrl) throw new Error("monopay не вернул pageUrl");
    return data.pageUrl;
  },

  async verifyWebhook(rawBody, headers) {
    const token = env("MONO_TOKEN");
    const sigB64 = headers.get("X-Sign") ?? "";
    if (!token || !sigB64) return false;
    try {
      if (!monoPubKey) {
        const r = await fetch("https://api.monobank.ua/api/merchant/pubkey", { headers: { "X-Token": token } });
        const pem = atob((await r.json()).key); // key = base64(PEM)
        const der = pemToDer(pem);
        monoPubKey = await crypto.subtle.importKey("spki", der, { name: "ECDSA", namedCurve: "P-256" }, false, ["verify"]);
      }
      const raw = derToRawSig(b64ToBytes(sigB64));
      return await crypto.subtle.verify(
        { name: "ECDSA", hash: "SHA-256" },
        monoPubKey,
        raw,
        new TextEncoder().encode(rawBody),
      );
    } catch (e) {
      console.error("mono verify:", e);
      return false;
    }
  },

  parseWebhook(rawBody) {
    let p: { invoiceId?: string; status?: string; reference?: string; amount?: number; ccy?: number };
    try { p = JSON.parse(rawBody); } catch { return null; }
    if (p.status !== "success") return null; // ждём успешную оплату
    const [userId, email, product] = String(p.reference ?? "").split("~");
    return {
      ok: true,
      email: email || undefined,
      userId: userId || undefined,
      product: product || "course",
      externalId: String(p.invoiceId ?? ""),
      amount: typeof p.amount === "number" ? p.amount / 100 : undefined,
      currency: p.ccy === 980 ? "UAH" : undefined,
      status: "active",
    };
  },
};

function pemToDer(pem: string): ArrayBuffer {
  const b64 = pem.replace(/-----[^-]+-----/g, "").replace(/\s+/g, "");
  return b64ToBytes(b64).buffer;
}
function b64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
// DER (SEQUENCE{INTEGER r, INTEGER s}) → raw 64 байта (r||s), P-256.
function derToRawSig(der: Uint8Array): Uint8Array {
  let o = 2; // skip 0x30 len
  if (der[o] !== 0x02) throw new Error("bad DER");
  let rLen = der[o + 1]; o += 2;
  let r = der.slice(o, o + rLen); o += rLen;
  if (der[o] !== 0x02) throw new Error("bad DER");
  let sLen = der[o + 1]; o += 2;
  let s = der.slice(o, o + sLen);
  const norm = (x: Uint8Array) => {
    x = x[0] === 0 ? x.slice(1) : x; // strip leading zero
    const out = new Uint8Array(32);
    out.set(x, 32 - x.length);
    return out;
  };
  const raw = new Uint8Array(64);
  raw.set(norm(r), 0);
  raw.set(norm(s), 32);
  return raw;
}

const ADAPTERS: Record<string, PaymentAdapter> = { lemonsqueezy: lemonSqueezy, mono };

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

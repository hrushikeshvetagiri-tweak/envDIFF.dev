import type { Env } from "./types";
import { createRazorpayOrder, verifyRazorpaySignature } from "./lib/razorpay";
import { generateLicenseKey } from "./lib/license";
import { PRICE } from "./lib/pricing";

const JSON_HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), { status, headers: JSON_HEADERS });
}

function badRequest(message: string): Response {
  return json({ error: message }, 400);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "OPTIONS" && url.pathname.startsWith("/api/")) {
      return new Response(null, { headers: JSON_HEADERS });
    }

    if (url.pathname === "/api/checkout/create-order" && request.method === "POST") {
      return handleCreateOrder(env);
    }

    if (url.pathname === "/api/checkout/verify" && request.method === "POST") {
      return handleVerifyCheckout(request, env);
    }

    if (url.pathname === "/api/license/verify" && request.method === "POST") {
      return handleVerifyLicense(request, env);
    }

    return env.ASSETS.fetch(request);
  },
};

async function handleCreateOrder(env: Env): Promise<Response> {
  if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
    return json({ error: "Payments are not configured yet." }, 503);
  }

  try {
    const receipt = `envdiff_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`;

    const order = await createRazorpayOrder({
      keyId: env.RAZORPAY_KEY_ID,
      keySecret: env.RAZORPAY_KEY_SECRET,
      amountPaise: PRICE.amountPaise,
      currency: PRICE.currency,
      receipt,
    });

    await env.DB.prepare(
      `INSERT INTO orders (razorpay_order_id, amount_paise, currency, status) VALUES (?, ?, ?, 'created')`
    )
      .bind(order.id, PRICE.amountPaise, PRICE.currency)
      .run();

    return json({
      orderId: order.id,
      amount: PRICE.amountPaise,
      currency: PRICE.currency,
      keyId: env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error("create-order failed", err);
    return json({ error: "Could not start checkout. Please try again." }, 502);
  }
}

async function handleVerifyCheckout(request: Request, env: Env): Promise<Response> {
  if (!env.RAZORPAY_KEY_SECRET) {
    return json({ error: "Payments are not configured yet." }, 503);
  }

  let body: {
    razorpay_order_id?: string;
    razorpay_payment_id?: string;
    razorpay_signature?: string;
    email?: string;
  };

  try {
    body = await request.json();
  } catch {
    return badRequest("Invalid JSON body.");
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, email } = body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return badRequest("Missing payment fields.");
  }

  const order = await env.DB.prepare(`SELECT * FROM orders WHERE razorpay_order_id = ?`)
    .bind(razorpay_order_id)
    .first<{ razorpay_order_id: string; amount_paise: number; currency: string; status: string }>();

  if (!order) {
    return badRequest("Unknown order.");
  }

  if (order.status === "paid") {
    // Already verified once — return the existing license instead of issuing a second one.
    const existing = await env.DB.prepare(`SELECT license_key FROM licenses WHERE razorpay_order_id = ?`)
      .bind(razorpay_order_id)
      .first<{ license_key: string }>();
    if (existing) return json({ licenseKey: existing.license_key });
  }

  const isValid = await verifyRazorpaySignature({
    orderId: razorpay_order_id,
    paymentId: razorpay_payment_id,
    signature: razorpay_signature,
    keySecret: env.RAZORPAY_KEY_SECRET,
  });

  if (!isValid) {
    return json({ error: "Payment signature did not verify." }, 400);
  }

  const licenseKey = generateLicenseKey();

  try {
    await env.DB.batch([
      env.DB.prepare(
        `INSERT INTO licenses (license_key, email, razorpay_order_id, razorpay_payment_id, amount_paise, currency)
         VALUES (?, ?, ?, ?, ?, ?)`
      ).bind(licenseKey, email ?? null, razorpay_order_id, razorpay_payment_id, order.amount_paise, order.currency),
      env.DB.prepare(`UPDATE orders SET status = 'paid' WHERE razorpay_order_id = ?`).bind(razorpay_order_id),
    ]);
  } catch (err) {
    console.error("license issuance failed", err);
    return json({ error: "Payment verified, but we couldn't generate your license. Contact support." }, 500);
  }

  return json({ licenseKey });
}

const MAX_DEVICES_PER_LICENSE = 2;

async function handleVerifyLicense(request: Request, env: Env): Promise<Response> {
  let body: { licenseKey?: string; deviceId?: string };
  try {
    body = await request.json();
  } catch {
    return badRequest("Invalid JSON body.");
  }

  const licenseKey = body.licenseKey?.trim().toUpperCase();
  const deviceId = body.deviceId?.trim();
  if (!licenseKey) return badRequest("Missing license key.");
  if (!deviceId) return badRequest("Missing device id.");

  const row = await env.DB.prepare(`SELECT status FROM licenses WHERE license_key = ?`)
    .bind(licenseKey)
    .first<{ status: string }>();

  if (row?.status !== "active") {
    return json({ valid: false });
  }

  const existingActivation = await env.DB.prepare(
    `SELECT id FROM license_activations WHERE license_key = ? AND device_id = ?`
  )
    .bind(licenseKey, deviceId)
    .first<{ id: number }>();

  if (existingActivation) {
    await env.DB.batch([
      env.DB.prepare(`UPDATE license_activations SET last_seen_at = datetime('now') WHERE id = ?`).bind(
        existingActivation.id
      ),
      env.DB.prepare(`UPDATE licenses SET last_verified_at = datetime('now') WHERE license_key = ?`).bind(
        licenseKey
      ),
    ]);
    return json({ valid: true });
  }

  const countRow = await env.DB.prepare(`SELECT COUNT(*) as n FROM license_activations WHERE license_key = ?`)
    .bind(licenseKey)
    .first<{ n: number }>();

  if ((countRow?.n ?? 0) >= MAX_DEVICES_PER_LICENSE) {
    return json({
      valid: false,
      reason: `This license is already active on ${MAX_DEVICES_PER_LICENSE} devices. Deactivate one first or contact support.`,
    });
  }

  await env.DB.batch([
    env.DB.prepare(`INSERT INTO license_activations (license_key, device_id) VALUES (?, ?)`).bind(
      licenseKey,
      deviceId
    ),
    env.DB.prepare(`UPDATE licenses SET last_verified_at = datetime('now') WHERE license_key = ?`).bind(
      licenseKey
    ),
  ]);

  return json({ valid: true });
}

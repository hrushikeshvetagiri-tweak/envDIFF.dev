import type { Env } from "../types.js";
import { createRazorpayOrder, verifyRazorpaySignature } from "../lib/razorpay.js";
import { generateLicenseKey } from "../lib/license.js";
import { PRICE } from "../lib/pricing.js";
import { badRequest, json, readJsonBody } from "../lib/http.js";

export async function handleCreateOrder(env: Env): Promise<Response> {
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

interface VerifyCheckoutBody {
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
  email?: string;
}

export async function handleVerifyCheckout(request: Request, env: Env): Promise<Response> {
  if (!env.RAZORPAY_KEY_SECRET) {
    return json({ error: "Payments are not configured yet." }, 503);
  }

  const body = await readJsonBody<VerifyCheckoutBody>(request);
  if (!body) return badRequest("Invalid JSON body.");

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

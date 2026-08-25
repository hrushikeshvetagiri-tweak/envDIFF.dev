interface CreateOrderParams {
  keyId: string;
  keySecret: string;
  amountPaise: number;
  currency: string;
  receipt: string;
}

export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  status: string;
}

export async function createRazorpayOrder({
  keyId,
  keySecret,
  amountPaise,
  currency,
  receipt,
}: CreateOrderParams): Promise<RazorpayOrder> {
  const auth = btoa(`${keyId}:${keySecret}`);

  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: amountPaise,
      currency,
      receipt,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Razorpay order creation failed (${res.status}): ${text}`);
  }

  return res.json();
}

/**
 * Razorpay's checkout signature is HMAC-SHA256 of `${orderId}|${paymentId}`,
 * keyed with the account's key secret. Must match byte-for-byte or the
 * payment is rejected as unverified.
 */
export async function verifyRazorpaySignature({
  orderId,
  paymentId,
  signature,
  keySecret,
}: {
  orderId: string;
  paymentId: string;
  signature: string;
  keySecret: string;
}): Promise<boolean> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(keySecret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signatureBytes = await crypto.subtle.sign("HMAC", key, encoder.encode(`${orderId}|${paymentId}`));
  const expected = Array.from(new Uint8Array(signatureBytes))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return timingSafeEqual(expected, signature);
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

const STORAGE_KEY = "envdiff:license";
const DEVICE_ID_KEY = "envdiff:device_id";

/** A stable per-browser id (not a hardware fingerprint) used to cap how many
 * browsers a single license can be active on. Clearing site data resets it —
 * that's an accepted soft limit, not hard DRM. */
export function getDeviceId(): string {
  try {
    let id = localStorage.getItem(DEVICE_ID_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(DEVICE_ID_KEY, id);
    }
    return id;
  } catch {
    return "unknown-device";
  }
}

export function getStoredLicense(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function storeLicense(licenseKey: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, licenseKey);
  } catch {
    /* localStorage unavailable (private browsing etc.) — license just won't persist */
  }
}

export function clearLicense(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export interface VerifyLicenseResult {
  valid: boolean;
  reason?: string;
}

export async function verifyLicense(licenseKey: string): Promise<VerifyLicenseResult> {
  const res = await fetch("/api/license/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ licenseKey, deviceId: getDeviceId() }),
  });

  if (!res.ok) return { valid: false };
  const data = await res.json();
  return { valid: Boolean(data.valid), reason: data.reason };
}

export interface CreateOrderResponse {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
}

export async function createOrder(): Promise<CreateOrderResponse> {
  const res = await fetch("/api/checkout/create-order", { method: "POST" });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error ?? "Could not start checkout.");
  }
  return res.json();
}

export interface RazorpayPaymentResult {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export async function verifyCheckout(
  result: RazorpayPaymentResult,
  email?: string
): Promise<string> {
  const res = await fetch("/api/checkout/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...result, email }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error ?? "Payment could not be verified.");
  }

  const data = await res.json();
  return data.licenseKey as string;
}

import type { DiffRowMeta } from "./env-diff.js";

export interface VerifyLicenseResult {
  valid: boolean;
  reason?: string;
}

export interface CreateOrderResponse {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
}

export interface RazorpayPaymentResult {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface CreateShareResponse {
  shareId: string;
  url: string;
  expiresAt: string;
}

export interface ShareData {
  leftLabel: string;
  rightLabel: string;
  rows: DiffRowMeta[];
  createdAt: string;
  expiresAt: string;
}

async function readJson<T>(res: Response): Promise<T> {
  return res.json() as Promise<T>;
}

async function readError(res: Response): Promise<string> {
  const body = await res.json().catch(() => null);
  return body?.error ?? `Request failed (${res.status})`;
}

/**
 * Talks to the EnvDiff Worker API. `baseUrl` is empty for the web app (same-origin,
 * relative paths) and the full site origin for the CLI, which has no origin of its own.
 */
export function createApiClient(baseUrl = "") {
  const url = (path: string) => `${baseUrl}${path}`;

  return {
    /** Browser flow: activates a license on this device, subject to the per-license device cap. */
    async verifyLicense(licenseKey: string, deviceId: string): Promise<VerifyLicenseResult> {
      const res = await fetch(url("/api/license/verify"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ licenseKey, deviceId }),
      });
      if (!res.ok) return { valid: false };
      return readJson<VerifyLicenseResult>(res);
    },

    /** CLI/CI flow: confirms a license is active. No device cap — CI runners are ephemeral. */
    async checkLicense(licenseKey: string): Promise<VerifyLicenseResult> {
      const res = await fetch(url("/api/license/check"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ licenseKey }),
      });
      if (!res.ok) return { valid: false };
      return readJson<VerifyLicenseResult>(res);
    },

    async createOrder(): Promise<CreateOrderResponse> {
      const res = await fetch(url("/api/checkout/create-order"), { method: "POST" });
      if (!res.ok) throw new Error(await readError(res));
      return readJson<CreateOrderResponse>(res);
    },

    async verifyCheckout(result: RazorpayPaymentResult, email?: string): Promise<string> {
      const res = await fetch(url("/api/checkout/verify"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...result, email }),
      });
      if (!res.ok) throw new Error(await readError(res));
      const data = await readJson<{ licenseKey: string }>(res);
      return data.licenseKey;
    },

    async createShare(params: {
      licenseKey: string;
      leftLabel: string;
      rightLabel: string;
      rows: DiffRowMeta[];
    }): Promise<CreateShareResponse> {
      const res = await fetch(url("/api/share/create"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
      if (!res.ok) throw new Error(await readError(res));
      return readJson<CreateShareResponse>(res);
    },

    async getShare(shareId: string): Promise<ShareData> {
      const res = await fetch(url(`/api/share/${shareId}`));
      if (!res.ok) throw new Error(await readError(res));
      return readJson<ShareData>(res);
    },
  };
}

export type ApiClient = ReturnType<typeof createApiClient>;

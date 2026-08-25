import { createApiClient, type VerifyLicenseResult } from "@envdiff/core";

const STORAGE_KEY = "envdiff:license";
const DEVICE_ID_KEY = "envdiff:device_id";

/** Same-origin client — the Worker serves both the API and this site from one domain. */
export const api = createApiClient("");

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

export function verifyLicense(licenseKey: string): Promise<VerifyLicenseResult> {
  return api.verifyLicense(licenseKey, getDeviceId());
}

export const createOrder = api.createOrder;
export const verifyCheckout = api.verifyCheckout;

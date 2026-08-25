import type { Env } from "../types.js";
import { badRequest, json, readJsonBody } from "../lib/http.js";

const MAX_DEVICES_PER_LICENSE = 2;

export async function isLicenseActive(env: Env, licenseKey: string): Promise<boolean> {
  const row = await env.DB.prepare(`SELECT status FROM licenses WHERE license_key = ?`)
    .bind(licenseKey)
    .first<{ status: string }>();
  return row?.status === "active";
}

interface VerifyLicenseBody {
  licenseKey?: string;
  deviceId?: string;
}

/** Browser flow: activates a license on this device, subject to the per-license device cap. */
export async function handleVerifyLicense(request: Request, env: Env): Promise<Response> {
  const body = await readJsonBody<VerifyLicenseBody>(request);
  if (!body) return badRequest("Invalid JSON body.");

  const licenseKey = body.licenseKey?.trim().toUpperCase();
  const deviceId = body.deviceId?.trim();
  if (!licenseKey) return badRequest("Missing license key.");
  if (!deviceId) return badRequest("Missing device id.");

  if (!(await isLicenseActive(env, licenseKey))) {
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

interface CheckLicenseBody {
  licenseKey?: string;
}

/**
 * CLI/CI flow: confirms a license is active, nothing more. Deliberately does NOT
 * touch license_activations or the device cap — CI runners are ephemeral (a fresh
 * "device" on every run), so treating a CI check as a device activation would burn
 * through the 2-device cap within a couple of pipeline runs and permanently lock
 * a paying customer out. This is a read-mostly validity check, not a seat.
 */
export async function handleCheckLicense(request: Request, env: Env): Promise<Response> {
  const body = await readJsonBody<CheckLicenseBody>(request);
  if (!body) return badRequest("Invalid JSON body.");

  const licenseKey = body.licenseKey?.trim().toUpperCase();
  if (!licenseKey) return badRequest("Missing license key.");

  const valid = await isLicenseActive(env, licenseKey);

  if (valid) {
    await env.DB.prepare(`UPDATE licenses SET last_verified_at = datetime('now') WHERE license_key = ?`)
      .bind(licenseKey)
      .run();
  }

  return json({ valid });
}

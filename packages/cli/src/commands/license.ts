import pc from "picocolors";
import { createApiClient } from "@envdiff/core";
import { clearStoredLicense, configPath, getStoredLicense, setStoredLicense } from "../lib/config.js";
import { fail } from "../lib/output.js";

export async function setLicense(key: string, apiBase: string): Promise<void> {
  const licenseKey = key.trim().toUpperCase();
  const api = createApiClient(apiBase);
  const { valid, reason } = await api.checkLicense(licenseKey);

  if (!valid) {
    fail(reason ?? "That license key wasn't recognized.");
  }

  setStoredLicense(licenseKey);
  console.log(pc.green(`✔ License saved to ${configPath}`));
}

export function showLicense(): void {
  const key = getStoredLicense();
  if (!key) {
    console.log(pc.dim("No license configured. Run `envdiff license set <key>`."));
    return;
  }
  console.log(`${key.slice(0, 8)}${"*".repeat(Math.max(0, key.length - 8))}`);
}

export function removeLicense(): void {
  clearStoredLicense();
  console.log(pc.green("✔ License removed from local config."));
}

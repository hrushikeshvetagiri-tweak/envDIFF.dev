import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const CONFIG_DIR = join(homedir(), ".envdiff");
const CONFIG_FILE = join(CONFIG_DIR, "config.json");

interface CliConfig {
  licenseKey?: string;
}

function readConfig(): CliConfig {
  if (!existsSync(CONFIG_FILE)) return {};
  try {
    return JSON.parse(readFileSync(CONFIG_FILE, "utf8"));
  } catch {
    return {};
  }
}

function writeConfig(config: CliConfig): void {
  if (!existsSync(CONFIG_DIR)) mkdirSync(CONFIG_DIR, { recursive: true });
  writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2) + "\n", { mode: 0o600 });
}

export function getStoredLicense(): string | undefined {
  return readConfig().licenseKey;
}

export function setStoredLicense(licenseKey: string): void {
  writeConfig({ ...readConfig(), licenseKey });
}

export function clearStoredLicense(): void {
  writeConfig({ ...readConfig(), licenseKey: undefined });
}

export const configPath = CONFIG_FILE;

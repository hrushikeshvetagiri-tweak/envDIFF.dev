import { readFileSync } from "node:fs";
import pc from "picocolors";
import {
  createApiClient,
  diffEnv,
  findProject,
  listEnvVars,
  listProjects,
  parseEnv,
  summarize,
  VercelApiError,
  type VercelTarget,
} from "@envdiff/core";
import { getStoredLicense } from "../lib/config.js";
import { fail, info, printSummary, printTable } from "../lib/output.js";

export interface CheckOptions {
  local: string;
  against?: string;
  vercelProject?: string;
  vercelEnv: string;
  vercelToken?: string;
  license?: string;
  failOn: "missing" | "different" | "any" | "none";
  required?: string;
  api: string;
  json?: boolean;
}

function readEnvFile(path: string): string {
  try {
    return readFileSync(path, "utf8");
  } catch {
    fail(`Couldn't read "${path}" — check the path is correct.`);
  }
}

export async function runCheck(opts: CheckOptions): Promise<void> {
  const localText = readEnvFile(opts.local);
  const localMap = parseEnv(localText);

  // --required is a lighter-weight mode: just confirm keys exist locally.
  // No second source, no license needed — it's the same tier as pasting in the browser.
  if (opts.required) {
    const required = opts.required.split(",").map((k) => k.trim()).filter(Boolean);
    const missing = required.filter((key) => !(key in localMap) || localMap[key] === "");

    if (opts.json) {
      console.log(JSON.stringify({ required, missing }, null, 2));
    } else if (missing.length === 0) {
      console.log(pc.green(`✔ All ${required.length} required keys are present in ${opts.local}.`));
    } else {
      console.log(pc.red(`✘ Missing ${missing.length} required key${missing.length === 1 ? "" : "s"}:`));
      for (const key of missing) console.log(`  ${pc.red(key)}`);
    }

    process.exit(missing.length > 0 ? 1 : 0);
  }

  let rightText: string;
  let rightLabel: string;

  if (opts.against) {
    rightText = readEnvFile(opts.against);
    rightLabel = opts.against;
  } else if (opts.vercelProject) {
    const licenseKey = opts.license ?? process.env.ENVDIFF_LICENSE ?? getStoredLicense();
    if (!licenseKey) {
      fail(
        "Connecting to Vercel needs a license. Pass --license, set ENVDIFF_LICENSE, or run `envdiff license set <key>`."
      );
    }

    const api = createApiClient(opts.api);
    const { valid, reason } = await api.checkLicense(licenseKey);
    if (!valid) {
      fail(reason ?? "That license isn't active. Check it at envdiff.dev.");
    }

    const token = opts.vercelToken ?? process.env.VERCEL_TOKEN;
    if (!token) {
      fail("Fetching from Vercel needs a token. Pass --vercel-token or set VERCEL_TOKEN.");
    }

    info(`Fetching ${opts.vercelEnv} env vars from Vercel project "${opts.vercelProject}"...`);

    try {
      const projects = await listProjects(token);
      const project = findProject(projects, opts.vercelProject);
      if (!project) {
        fail(`No Vercel project found matching "${opts.vercelProject}".`);
      }
      const vars = await listEnvVars(token, project.id, opts.vercelEnv as VercelTarget);
      rightText = vars.map((v) => (v.value !== undefined ? `${v.key}=${v.value}` : "")).join("\n");
      rightLabel = `Vercel:${opts.vercelProject}:${opts.vercelEnv}`;
    } catch (err) {
      fail(err instanceof VercelApiError ? err.message : "Couldn't reach Vercel.");
    }
  } else {
    fail("Nothing to compare against — pass --against <file>, --vercel-project <id>, or --required <keys>.");
  }

  const rows = diffEnv(localMap, parseEnv(rightText));
  const stats = summarize(rows);

  if (opts.json) {
    console.log(JSON.stringify({ leftLabel: opts.local, rightLabel, rows, stats }, null, 2));
  } else {
    console.log(pc.bold(`${opts.local} → ${rightLabel}`));
    printTable(rows);
    printSummary(stats);
  }

  const shouldFail =
    opts.failOn === "none"
      ? false
      : opts.failOn === "missing"
        ? stats.missing > 0
        : opts.failOn === "different"
          ? stats.different > 0
          : stats.missing > 0 || stats.different > 0; // "any"

  if (shouldFail && !opts.json) {
    console.log("");
    console.log(pc.red(`✘ Failing build: drift found (--fail-on=${opts.failOn}).`));
  }

  process.exit(shouldFail ? 1 : 0);
}

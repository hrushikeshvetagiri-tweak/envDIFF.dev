#!/usr/bin/env node
import { Command } from "commander";
import { runCheck } from "./commands/check.js";
import { removeLicense, setLicense, showLicense } from "./commands/license.js";

const DEFAULT_API = "https://envdiff.dev";

const program = new Command();

program
  .name("envdiff")
  .description("Catch config drift before it breaks prod — from the command line.")
  .version("0.1.0");

program
  .command("check")
  .description("Compare env sources and exit non-zero on drift — built for CI.")
  .option("--local <path>", "local .env file to check", ".env")
  .option("--against <path>", "compare against another local file (free, no license needed)")
  .option("--vercel-project <idOrName>", "fetch env vars from a Vercel project (requires a license)")
  .option("--vercel-env <target>", "production | preview | development", "production")
  .option("--vercel-token <token>", "Vercel access token (or set VERCEL_TOKEN)")
  .option("--license <key>", "EnvDiff license key (or set ENVDIFF_LICENSE, or run `envdiff license set`)")
  .option("--required <keys>", "comma-separated keys that must exist in --local — no second source needed")
  .option("--fail-on <mode>", "missing | different | any | none", "missing")
  .option("--api <url>", "override the EnvDiff API base URL", DEFAULT_API)
  .option("--json", "machine-readable output")
  .action(async (opts) => {
    await runCheck(opts);
  });

const license = program.command("license").description("Manage the license key used for premium checks.");

license
  .command("set <key>")
  .description("save a license key locally so `envdiff check` doesn't need --license every run")
  .option("--api <url>", "override the EnvDiff API base URL", DEFAULT_API)
  .action(async (key, opts) => {
    await setLicense(key, opts.api);
  });

license
  .command("show")
  .description("show the currently configured license key (masked)")
  .action(() => showLicense());

license
  .command("remove")
  .description("remove the locally stored license key")
  .action(() => removeLicense());

program.parseAsync(process.argv);

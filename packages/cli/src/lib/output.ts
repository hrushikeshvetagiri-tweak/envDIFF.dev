import pc from "picocolors";
import type { DiffRow } from "@envdiff/core";

const STATUS_STYLE: Record<DiffRow["status"], (s: string) => string> = {
  match: (s) => pc.dim(s),
  different: (s) => pc.yellow(s),
  "missing-left": (s) => pc.red(s),
  "missing-right": (s) => pc.red(s),
};

const STATUS_LABEL: Record<DiffRow["status"], string> = {
  match: "match",
  different: "different",
  "missing-left": "missing in local",
  "missing-right": "missing in remote",
};

export function printTable(rows: DiffRow[]): void {
  if (rows.length === 0) {
    console.log(pc.dim("No keys found on either side."));
    return;
  }

  const keyWidth = Math.max(3, ...rows.map((r) => r.key.length));
  const header = `  ${"KEY".padEnd(keyWidth)}  ${"STATUS".padEnd(18)}`;
  console.log(pc.dim(header));
  console.log(pc.dim("  " + "-".repeat(header.length - 2)));

  for (const row of rows) {
    if (row.status === "match") continue; // keep CI output focused on what needs attention
    const style = STATUS_STYLE[row.status];
    const label = STATUS_LABEL[row.status];
    console.log(`  ${row.key.padEnd(keyWidth)}  ${style(label)}`);
  }

  const matching = rows.filter((r) => r.status === "match").length;
  if (matching > 0) {
    console.log(pc.dim(`  ...and ${matching} matching key${matching === 1 ? "" : "s"} (hidden)`));
  }
}

export function printSummary(counts: { total: number; missing: number; different: number; match: number }): void {
  console.log("");
  console.log(
    `  ${pc.bold(String(counts.total))} keys · ${pc.red(String(counts.missing))} missing · ${pc.yellow(
      String(counts.different)
    )} different · ${pc.dim(String(counts.match) + " matching")}`
  );
}

export function fail(message: string): never {
  console.error(pc.red(`✘ ${message}`));
  process.exit(2);
}

export function info(message: string): void {
  console.log(pc.dim(message));
}

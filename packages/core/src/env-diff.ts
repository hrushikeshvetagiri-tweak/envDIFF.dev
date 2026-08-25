export type EnvMap = Record<string, string>;

export type DiffStatus = "match" | "different" | "missing-right" | "missing-left";

export interface DiffRow {
  key: string;
  left: string | null;
  right: string | null;
  status: DiffStatus;
}

/** A DiffRow with values stripped — all that ever leaves the browser for a shared link. */
export interface DiffRowMeta {
  key: string;
  status: DiffStatus;
}

const LINE_RE = /^\s*(?:export\s+)?([\w.-]+)\s*=\s*(.*)\s*$/;

/** Parses raw .env text into an ordered key/value map. Ignores comments and blank lines. */
export function parseEnv(text: string): EnvMap {
  const result: EnvMap = {};

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const match = LINE_RE.exec(line);
    if (!match) continue;

    const [, key, rawValue] = match;
    result[key] = stripQuotes(rawValue.trim());
  }

  return result;
}

function stripQuotes(value: string): string {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  return value;
}

/** Compares two env maps and returns one row per key found in either side. */
export function diffEnv(left: EnvMap, right: EnvMap): DiffRow[] {
  const keys = new Set([...Object.keys(left), ...Object.keys(right)]);
  const rows: DiffRow[] = [];

  for (const key of keys) {
    const hasLeft = key in left;
    const hasRight = key in right;

    let status: DiffStatus;
    if (!hasRight) status = "missing-right";
    else if (!hasLeft) status = "missing-left";
    else if (left[key] !== right[key]) status = "different";
    else status = "match";

    rows.push({
      key,
      left: hasLeft ? left[key] : null,
      right: hasRight ? right[key] : null,
      status,
    });
  }

  return rows.sort((a, b) => {
    const rank = { "missing-right": 0, "missing-left": 0, different: 1, match: 2 };
    const diff = rank[a.status] - rank[b.status];
    return diff !== 0 ? diff : a.key.localeCompare(b.key);
  });
}

export function summarize(rows: DiffRow[] | DiffRowMeta[]) {
  return {
    total: rows.length,
    missing: rows.filter((r) => r.status === "missing-right" || r.status === "missing-left").length,
    different: rows.filter((r) => r.status === "different").length,
    match: rows.filter((r) => r.status === "match").length,
  };
}

/** Heuristic: does this key look like a secret that should probably be masked by default. */
export function looksSecret(key: string): boolean {
  return /(secret|key|token|password|pwd|auth|credential|private)/i.test(key);
}

/** Strips values, keeping only key + status — the shape that's safe to send to a server. */
export function toMeta(rows: DiffRow[]): DiffRowMeta[] {
  return rows.map(({ key, status }) => ({ key, status }));
}

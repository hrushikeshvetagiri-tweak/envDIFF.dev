import type { Env } from "../types.js";
import { badRequest, json, notFound, readJsonBody } from "../lib/http.js";
import { generateShareId, shareExpiryTimestamp } from "../lib/share.js";
import { isLicenseActive } from "./license.js";

interface DiffRowMeta {
  key: string;
  status: string;
}

interface CreateShareBody {
  licenseKey?: string;
  leftLabel?: string;
  rightLabel?: string;
  rows?: DiffRowMeta[];
}

const VALID_STATUSES = new Set(["match", "different", "missing-right", "missing-left"]);

export async function handleCreateShare(request: Request, env: Env): Promise<Response> {
  const body = await readJsonBody<CreateShareBody>(request);
  if (!body) return badRequest("Invalid JSON body.");

  const licenseKey = body.licenseKey?.trim().toUpperCase();
  if (!licenseKey) return badRequest("A license is required to create a share link.");
  if (!(await isLicenseActive(env, licenseKey))) {
    return json({ error: "That license isn't active." }, 403);
  }

  if (!Array.isArray(body.rows) || body.rows.length === 0) {
    return badRequest("Nothing to share.");
  }

  // Reconstruct rows from scratch server-side — key + status only. Even if a client
  // sent actual values by mistake or by tampering, they never make it into storage.
  const rows: DiffRowMeta[] = [];
  for (const row of body.rows) {
    if (typeof row?.key !== "string" || !VALID_STATUSES.has(row?.status)) {
      return badRequest("Malformed diff row.");
    }
    rows.push({ key: row.key, status: row.status });
  }

  const shareId = generateShareId();
  const expiresAt = shareExpiryTimestamp();
  const leftLabel = (body.leftLabel || "local").slice(0, 40);
  const rightLabel = (body.rightLabel || "production").slice(0, 40);

  await env.DB.prepare(
    `INSERT INTO shared_diffs (share_id, left_label, right_label, rows_json, license_key, expires_at)
     VALUES (?, ?, ?, ?, ?, ?)`
  )
    .bind(shareId, leftLabel, rightLabel, JSON.stringify(rows), licenseKey, expiresAt)
    .run();

  const origin = new URL(request.url).origin;

  return json({
    shareId,
    url: `${origin}/s/${shareId}`,
    expiresAt,
  });
}

export async function handleGetShare(shareId: string, env: Env): Promise<Response> {
  const row = await env.DB.prepare(
    `SELECT left_label, right_label, rows_json, created_at, expires_at
     FROM shared_diffs WHERE share_id = ? AND expires_at > datetime('now')`
  )
    .bind(shareId)
    .first<{
      left_label: string;
      right_label: string;
      rows_json: string;
      created_at: string;
      expires_at: string;
    }>();

  if (!row) {
    return notFound("This link doesn't exist or has expired.");
  }

  return json({
    leftLabel: row.left_label,
    rightLabel: row.right_label,
    rows: JSON.parse(row.rows_json),
    createdAt: row.created_at,
    expiresAt: row.expires_at,
  });
}

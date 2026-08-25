-- Shared diff links. Metadata only, by design: key names and their status
-- (match / different / missing), never the actual values. This is what makes
-- "share a link with your team" honest under the site's own privacy claims.
CREATE TABLE IF NOT EXISTS shared_diffs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  share_id TEXT NOT NULL UNIQUE,
  left_label TEXT NOT NULL,
  right_label TEXT NOT NULL,
  rows_json TEXT NOT NULL,
  license_key TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_shares_share_id ON shared_diffs (share_id);
CREATE INDEX IF NOT EXISTS idx_shares_expires_at ON shared_diffs (expires_at);

CREATE TABLE IF NOT EXISTS license_activations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  license_key TEXT NOT NULL,
  device_id TEXT NOT NULL,
  first_seen_at TEXT NOT NULL DEFAULT (datetime('now')),
  last_seen_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (license_key, device_id)
);

CREATE INDEX IF NOT EXISTS idx_activations_key ON license_activations (license_key);

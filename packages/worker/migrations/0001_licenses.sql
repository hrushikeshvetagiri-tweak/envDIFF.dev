CREATE TABLE IF NOT EXISTS licenses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  license_key TEXT NOT NULL UNIQUE,
  email TEXT,
  razorpay_order_id TEXT NOT NULL UNIQUE,
  razorpay_payment_id TEXT NOT NULL UNIQUE,
  amount_paise INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  last_verified_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_licenses_key ON licenses (license_key);

CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  razorpay_order_id TEXT NOT NULL UNIQUE,
  amount_paise INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  status TEXT NOT NULL DEFAULT 'created' CHECK (status IN ('created', 'paid', 'failed')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

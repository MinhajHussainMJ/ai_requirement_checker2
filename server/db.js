// SQLite database (better-sqlite3) - simple file-based DB
const Database = require('better-sqlite3');
const path = require('path');
const crypto = require('crypto');

const db = new Database(path.join(__dirname, '..', 'data.db'));
db.pragma('journal_mode = WAL');

db.exec(`
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT
);
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'customer',          -- customer | admin
  status TEXT NOT NULL DEFAULT 'trial',           -- trial | payment_pending | active | expired | suspended
  full_name TEXT,
  trial_start TEXT,                               -- ISO datetime
  sub_start TEXT,                                 -- ISO date (admin set)
  sub_end TEXT,                                   -- ISO date (admin set)
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS profiles (
  user_id INTEGER PRIMARY KEY,
  name TEXT, highest_degree TEXT, field TEXT, cgpa TEXT, grad_year TEXT,
  english_test TEXT, english_score TEXT, work_exp TEXT, country TEXT,
  program TEXT, budget TEXT, extra TEXT, updated_at TEXT
);
CREATE TABLE IF NOT EXISTS payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  txn_id TEXT NOT NULL, amount TEXT NOT NULL, pay_date TEXT NOT NULL,
  method TEXT DEFAULT 'EasyPaisa', note TEXT,
  status TEXT DEFAULT 'pending',                  -- pending | approved | rejected
  reviewed_at TEXT, reviewed_by INTEGER,
  created_at TEXT DEFAULT (datetime('now'))
);
`);

function getSetting(key, fallback) {
  const r = db.prepare('SELECT value FROM settings WHERE key=?').get(key);
  return r ? r.value : fallback;
}
function setSetting(key, value) {
  db.prepare('INSERT INTO settings(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value')
    .run(key, String(value));
}

// Defaults for EasyPaisa placeholders (editable from Admin Dashboard)
if (getSetting('easypaisa_name') === undefined) setSetting('easypaisa_name', '[MY EASYPAISA NAME]');
if (getSetting('easypaisa_number') === undefined) setSetting('easypaisa_number', '[MY EASYPAISA NUMBER]');
if (getSetting('monthly_price') === undefined) setSetting('monthly_price', '500');
if (getSetting('session_secret') === undefined) {
  setSetting('session_secret', crypto.randomBytes(32).toString('hex')); // randomly generated, never hard-coded
}

module.exports = { db, getSetting, setSetting };

// trial-guard.js
// Stops repeat free trials. Put this file in /server and require it from your register route.
// Works with Express + better-sqlite3. No extra npm packages needed.

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Set TRIAL_PEPPER as an environment variable (any long random text).
const PEPPER = process.env.TRIAL_PEPPER || 'change-this-secret';
const MAX_SIGNUPS_PER_IP_PER_DAY = 3; // kept above 1 because mobile networks share IPs
const DEVICE_COOKIE = 'did';

// Extra well-known providers (including ones missing from the public blocklist, e.g. tempmail.com).
const EXTRA_DISPOSABLE_DOMAINS = [
  'mailinator.com', 'guerrillamail.com', 'guerrillamailblock.com', 'grr.la',
  '10minutemail.com', '10minutemail.net', 'tempmail.com', 'temp-mail.org',
  'temp-mail.io', 'temp-mail.lol', 'yopmail.com', 'yopmail.fr', 'trashmail.com',
  'sharklasers.com', 'getnada.com', 'throwawaymail.com', 'maildrop.cc',
  'dispostable.com', 'fakeinbox.com', 'mintemail.com', 'moakt.com',
  'emailondeck.com', 'mohmal.com', 'tempail.com', 'burnermail.io',
  'mailnesia.com', 'mail.tm', 'inboxkitten.com', 'dropmail.me',
  'minuteinbox.com', 'emailfake.com', 'generator.email', 'tmpmail.org',
  'tmpeml.com', 'guerrillamail.de', 'pokemail.net', 'spam4.me'
];

// Domain-name tokens used by throwaway providers. Applied to the host only, not the local part.
const DISPOSABLE_PATTERNS = [
  /temp-?mail/,
  /tmp-?mail/,
  /tmpeml/,
  /mail-?temp/,
  /guerrilla/,
  /yopmail/,
  /mailinator/,
  /10-?minute/,
  /throw-?away/,
  /trash-?mail/,
  /fake-?inbox/,
  /fake-?mail/,
  /disposable/,
  /burner-?mail/,
  /mailnesia/,
  /temp-?inbox/,
  /minute-?inbox/,
  /discard-?(mail|email)/,
  /getnada/,
  /maildrop/,
  /sharklasers/,
  /spam4\.?me/,
  /mohmal/,
  /moakt/,
  /inboxkitten/,
  /dropmail/,
  /email-?fake/,
  /tempail/,
  /dispostable/,
  /mintemail/,
  /emailondeck/,
  /trashdevil/,
  /wegwerf/,
  /jetable/,
  /mailnull/,
  /mailcatch/,
  /tempr\.email/,
  /tmpbox/,
  /nowmymail/,
  /getairmail/,
  /mailforspam/,
  /trashymail/,
  /mailexpire/,
  /mailzilla/,
  /guerrillamailblock/,
  /pokemail/,
  /spamherelots/,
  /veryrealemail/
];

function loadDisposableDomains() {
  const set = new Set(EXTRA_DISPOSABLE_DOMAINS);
  const file = path.join(__dirname, 'disposable-email-blocklist.txt');
  try {
    const text = fs.readFileSync(file, 'utf8');
    for (const line of text.split(/\r?\n/)) {
      const d = line.trim().toLowerCase();
      if (!d || d.startsWith('#')) continue;
      set.add(d);
    }
  } catch (e) {
    // File missing: extras + patterns still apply.
  }
  return set;
}

const DISPOSABLE_DOMAINS = loadDisposableDomains();

function emailDomain(email) {
  const raw = String(email || '').trim().toLowerCase();
  const at = raw.lastIndexOf('@');
  if (at < 0) return '';
  return raw.slice(at + 1).replace(/\.+$/, '');
}

// Match the domain or any parent (foo.bar.mailinator.com → mailinator.com). Never match a bare TLD.
function domainOrParentBlocked(domain) {
  if (DISPOSABLE_DOMAINS.has(domain)) return true;
  const parts = domain.split('.');
  for (let i = 1; i <= parts.length - 2; i++) {
    if (DISPOSABLE_DOMAINS.has(parts.slice(i).join('.'))) return true;
  }
  return false;
}

function domainMatchesPattern(domain) {
  return DISPOSABLE_PATTERNS.some((re) => re.test(domain));
}

const hash = (v) =>
  crypto.createHmac('sha256', PEPPER).update(String(v)).digest('hex');

// ali.khan+test@gmail.com -> alikhan@gmail.com
function normalizeEmail(email) {
  email = String(email || '').trim().toLowerCase();
  const [local, domain] = email.split('@');
  if (!local || !domain) return null;
  let l = local.split('+')[0];
  let d = domain;
  if (d === 'gmail.com' || d === 'googlemail.com') {
    l = l.replace(/\./g, '');
    d = 'gmail.com';
  }
  return `${l}@${d}`;
}

// 0300-1234567, +92 300 1234567, 3001234567 -> 3001234567
function normalizePhone(phone) {
  const digits = String(phone || '').replace(/\D/g, '');
  if (digits.length < 10) return null;
  return digits.slice(-10);
}

function isDisposable(email) {
  const domain = emailDomain(email);
  if (!domain) return true;
  return domainOrParentBlocked(domain) || domainMatchesPattern(domain);
}

// Call once at startup: initTrialGuard(db)
function initTrialGuard(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS trial_registry (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      kind TEXT NOT NULL,          -- email | phone | device | ip
      hash TEXT NOT NULL,
      created_at INTEGER NOT NULL  -- unix ms
    );
    CREATE INDEX IF NOT EXISTS idx_trial_registry ON trial_registry(kind, hash);
  `);
}

function readCookie(req, name) {
  const raw = req.headers.cookie || '';
  const match = raw.split(';').map((s) => s.trim()).find((s) => s.startsWith(name + '='));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : null;
}

// app.use(deviceMiddleware) -- gives every browser a long-lived anonymous ID
function deviceMiddleware(req, res, next) {
  let id = readCookie(req, DEVICE_COOKIE);
  if (!id || id.length < 20) {
    id = crypto.randomBytes(24).toString('hex');
    res.cookie(DEVICE_COOKIE, id, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 5 * 365 * 24 * 60 * 60 * 1000
    });
  }
  req.deviceId = id;
  next();
}

function seen(db, kind, value) {
  return !!db
    .prepare('SELECT 1 FROM trial_registry WHERE kind = ? AND hash = ? LIMIT 1')
    .get(kind, hash(value));
}

/**
 * Decide whether this signup may receive a free trial.
 * Returns { ok, trialAllowed, reason }
 *   ok = false          -> reject the registration entirely (disposable email, bad phone)
 *   trialAllowed = false -> create the account, but with NO trial (must pay to activate)
 */
function checkTrialEligibility(db, req, { email, phone }) {
  const cleanEmail = normalizeEmail(email);
  const cleanPhone = normalizePhone(phone);

  if (!cleanEmail) return { ok: false, reason: 'Please enter a valid email address.' };
  if (isDisposable(cleanEmail))
    return { ok: false, reason: 'Temporary email addresses are not allowed. Please use a real email.' };
  if (!cleanPhone)
    return { ok: false, reason: 'Please enter a valid mobile number.' };

  const ip = req.ip;
  const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
  const ipCount = db
    .prepare("SELECT COUNT(*) AS c FROM trial_registry WHERE kind = 'ip' AND hash = ? AND created_at > ?")
    .get(hash(ip), dayAgo).c;

  if (seen(db, 'email', cleanEmail) || seen(db, 'phone', cleanPhone) || seen(db, 'device', req.deviceId))
    return { ok: true, trialAllowed: false, reason: 'Free trial already used. Please subscribe to continue.' };

  if (ipCount >= MAX_SIGNUPS_PER_IP_PER_DAY)
    return { ok: true, trialAllowed: false, reason: 'Too many trials from this network. Please subscribe to continue.' };

  return { ok: true, trialAllowed: true, cleanEmail, cleanPhone };
}

// Call only when a trial was actually granted
function recordTrial(db, req, { email, phone }) {
  const now = Date.now();
  const ins = db.prepare('INSERT INTO trial_registry (kind, hash, created_at) VALUES (?, ?, ?)');
  db.transaction(() => {
    ins.run('email', hash(normalizeEmail(email)), now);
    ins.run('phone', hash(normalizePhone(phone)), now);
    ins.run('device', hash(req.deviceId), now);
    ins.run('ip', hash(req.ip), now);
  })();
}

module.exports = {
  initTrialGuard,
  deviceMiddleware,
  checkTrialEligibility,
  recordTrial,
  normalizeEmail,
  normalizePhone,
  isDisposable
};

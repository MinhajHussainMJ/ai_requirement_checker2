// AI University & Scholarship Advisor - main server
const express = require('express');
const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const { db, getSetting, setSetting } = require('./db');
const { analyze } = require('./recommend');
const { publicCatalog } = require('./catalog');
const { initTrialGuard, deviceMiddleware, checkTrialEligibility, recordTrial } = require('./trial-guard');

const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 3000;
const TRIAL_DAYS = 1;
const JWT_EXPIRES = '7d';
const SECRET = getSetting('session_secret'); // randomly generated on first run, stored in DB
initTrialGuard(db);

app.use(express.json());
app.use(cookieParser());
app.use(deviceMiddleware);   // new
app.use(express.static(path.join(__dirname, '..', 'public')));

/* ---------------- helpers ---------------- */
function hash(pw) { return bcrypt.hashSync(pw, 10); }

function sign(user) {
  return jwt.sign({ id: user.id, role: user.role }, SECRET, { expiresIn: JWT_EXPIRES });
}

function setCookie(res, token) {
  res.cookie('token', token, {
    httpOnly: true, sameSite: 'lax', maxAge: 7 * 24 * 3600 * 1000,
    secure: process.env.COOKIE_SECURE === '1'
  });
}

function publicUser(u) {
  return { id: u.id, email: u.email, username: u.username, role: u.role, status: u.status,
           full_name: u.full_name, trial_start: u.trial_start, sub_start: u.sub_start, sub_end: u.sub_end };
}

// Recompute derived status (trial expiry / subscription expiry). Suspended stays suspended.
function refreshStatus(u) {
  if (!u || u.role === 'admin' || u.status === 'suspended' || u.status === 'payment_pending') return u;
  let newStatus = u.status;
  if (u.status === 'trial') {
    const start = new Date(u.trial_start).getTime();
    if (Date.now() > start + TRIAL_DAYS * 86400 * 1000) newStatus = 'expired';
  } else if (u.status === 'active') {
    if (u.sub_end) {
      const end = new Date(u.sub_end + 'T23:59:59');
      if (Date.now() > end.getTime()) newStatus = 'expired';
    }
  } else if (u.status === 'expired') {
    // If admin later extended sub_end beyond now, reactivate automatically
    if (u.sub_end && new Date(u.sub_end + 'T23:59:59').getTime() > Date.now()) newStatus = 'active';
  }
  if (newStatus !== u.status) {
    db.prepare('UPDATE users SET status=? WHERE id=?').run(newStatus, u.id);
    u.status = newStatus;
  }
  return u;
}

function canAccessPaid(status) {
  return status === 'trial' || status === 'active';
}

function auth(req, res, next) {
  const token = req.cookies.token || (req.headers.authorization || '').replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Not logged in' });
  try {
    const payload = jwt.verify(token, SECRET);
    let u = db.prepare('SELECT * FROM users WHERE id=?').get(payload.id);
    u = refreshStatus(u);
    if (!u) return res.status(401).json({ error: 'Account not found' });
    req.user = u;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Session expired, please log in again' });
  }
}

function adminOnly(req, res, next) {
  if (req.user && req.user.role === 'admin') return next();
  return res.status(403).json({ error: 'Admin access required' });
}

function validPw(pw) { return typeof pw === 'string' && pw.length >= 8; }
function validEmail(e) { return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e || ''); }

/* ---------------- setup (first-run admin creation) ---------------- */
// CSRF-style protection for setup: a one-time code printed to the server console.
let SETUP_CODE = null;
function ensureSetupCode() {
  if (!SETUP_CODE) {
    SETUP_CODE = crypto.randomBytes(3).toString('hex').toUpperCase(); // e.g. "3F9A2C"
    console.log('\n============================================================');
    console.log('  FIRST-RUN SETUP: Admin account not created yet.');
    console.log('  Open http://localhost:' + PORT + '/setup and use this setup code:  ' + SETUP_CODE);
    console.log('  (The code is regenerated each time the server starts until an');
    console.log('   admin account exists. No password is hard-coded anywhere.)');
    console.log('============================================================\n');
  }
}
function adminExists() {
  return !!db.prepare("SELECT id FROM users WHERE role='admin' LIMIT 1").get();
}

app.get('/api/setup/status', (req, res) => {
  ensureSetupCode();
  res.json({ needed: !adminExists() });
});

app.post('/api/setup/admin', (req, res) => {
  if (adminExists()) return res.status(403).json({ error: 'Setup already completed' });
  const { email, username, password, code } = req.body || {};
  if (!code || code.trim().toUpperCase() !== SETUP_CODE) {
    return res.status(403).json({ error: 'Invalid setup code. Check the code printed in the server console.' });
  }
  if (!validEmail(email)) return res.status(400).json({ error: 'Enter a valid email' });
  if (!username || String(username).trim().length < 3) return res.status(400).json({ error: 'Username must be at least 3 characters' });
  if (!validPw(password)) return res.status(400).json({ error: 'Password must be at least 8 characters' });
  const info = db.prepare('INSERT INTO users(email,username,password_hash,role,status,full_name) VALUES(?,?,?,?,?,?)')
    .run(email.trim().toLowerCase(), String(username).trim().toLowerCase(), hash(password), 'admin', 'active', 'Administrator');
  SETUP_CODE = null; // consume the code
  const u = db.prepare('SELECT * FROM users WHERE id=?').get(info.lastInsertRowid);
  setCookie(res, sign(u));
  res.json({ ok: true, user: publicUser(u) });
});

/* ---------------- auth ---------------- */
app.get('/api/config', (req, res) => {
  res.json({
    setupNeeded: !adminExists(),
    easypaisa_name: getSetting('easypaisa_name'),
    easypaisa_number: getSetting('easypaisa_number'),
    monthly_price: getSetting('monthly_price'),
    trial_days: TRIAL_DAYS,
    ...publicCatalog()
  });
});
app.post('/api/register', (req, res) => {
  const { name, email, username, password, phone } = req.body || {};
  if (!name || String(name).trim().length < 2) return res.status(400).json({ error: 'Enter your full name' });
  if (!validEmail(email)) return res.status(400).json({ error: 'Enter a valid email' });
  if (!username || String(username).trim().length < 3) return res.status(400).json({ error: 'Username must be at least 3 characters' });
  if (!validPw(password)) return res.status(400).json({ error: 'Password must be at least 8 characters' });
  const dup = db.prepare('SELECT id FROM users WHERE email=? OR username=?').get(email.trim().toLowerCase(), String(username).trim().toLowerCase());
  if (dup) return res.status(409).json({ error: 'Email or username already in use' });

  // ---- trial abuse check ----
  const check = checkTrialEligibility(db, req, { email, phone });
  if (!check.ok) return res.status(400).json({ error: check.reason });

  const trialStart = new Date().toISOString();
  const status = check.trialAllowed ? 'trial' : 'expired';   // no free trial if already used
  const info = db.prepare('INSERT INTO users(email,username,password_hash,role,status,full_name,trial_start) VALUES(?,?,?,?,?,?,?)')
    .run(email.trim().toLowerCase(), String(username).trim().toLowerCase(), hash(password), 'customer', status, String(name).trim(), trialStart);
  if (check.trialAllowed) recordTrial(db, req, { email, phone });

  const u = db.prepare('SELECT * FROM users WHERE id=?').get(info.lastInsertRowid);
  setCookie(res, sign(u));
  res.json({
    ok: true, user: publicUser(u),
    message: check.trialAllowed
      ? `Account created. ${TRIAL_DAYS}-day free trial started.`
      : `Account created, but ${check.reason} Go to the Payment page to activate.`
  });
});

app.post('/api/login', (req, res) => {
  const { login, password } = req.body || {};
  const u = db.prepare('SELECT * FROM users WHERE email=? OR username=?').get(
    String(login || '').trim().toLowerCase(), String(login || '').trim().toLowerCase());
  if (!u || !bcrypt.compareSync(password || '', u.password_hash)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  refreshStatus(u);
  if (u.status === 'suspended') return res.status(403).json({ error: 'Your account is suspended. Contact the administrator.' });
  setCookie(res, sign(u));
  res.json({ ok: true, user: publicUser(u) });
});

app.post('/api/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ ok: true });
});

app.get('/api/me', auth, (req, res) => {
  const p = db.prepare('SELECT * FROM profiles WHERE user_id=?').get(req.user.id);
  res.json({ user: publicUser(req.user), profile: p || null,
             access: canAccessPaid(req.user.status), trial_days: TRIAL_DAYS });
});

/* ---------------- customer: profile + recommendations ---------------- */
app.post('/api/profile', auth, (req, res) => {
  if (req.user.role === 'admin') return res.status(400).json({ error: 'Admin accounts do not have candidate profiles' });
  const b = req.body || {};
  const fields = ['name','highest_degree','field','cgpa','grad_year','english_test','english_score','work_exp','country','program','budget','extra'];
  const vals = {};
  fields.forEach(f => vals[f] = b[f] != null ? String(b[f]).slice(0, 500) : '');
  if (!vals.name) return res.status(400).json({ error: 'Name is required' });
  db.prepare(`INSERT INTO profiles(user_id,${fields.join(',')},updated_at)
              VALUES(${Array(fields.length + 1).fill('?').join(',')},datetime('now'))
              ON CONFLICT(user_id) DO UPDATE SET ${fields.map(f => `${f}=excluded.${f}`)}, updated_at=datetime('now')`)
    .run(req.user.id, ...fields.map(f => vals[f]));
  res.json({ ok: true });
});

app.get('/api/profile', auth, (req, res) => {
  const p = db.prepare('SELECT * FROM profiles WHERE user_id=?').get(req.user.id);
  res.json({ profile: p || null });
});

app.post('/api/recommendations', auth, (req, res) => {
  if (req.user.role === 'admin') return res.status(400).json({ error: 'Use your customer account for recommendations' });
  if (!canAccessPaid(req.user.status)) {
    return res.status(403).json({ error: 'ACCESS_LOCKED', locked: true, status: req.user.status,
      message: 'Your free trial has ended. Subscribe via the Payment page to unlock AI recommendations.' });
  }
  const p = db.prepare('SELECT * FROM profiles WHERE user_id=?').get(req.user.id);
  if (!p || !p.name) return res.status(400).json({ error: 'Save your candidate profile first' });
  const result = analyze(p);
  res.json(result);
});

/* ---------------- customer: payments ---------------- */
app.post('/api/payments', auth, (req, res) => {
  if (req.user.role === 'admin') return res.status(400).json({ error: 'Admin does not submit payments' });
  const { txn_id, amount, pay_date, note } = req.body || {};
  if (!txn_id || String(txn_id).trim().length < 4) return res.status(400).json({ error: 'Enter the transaction/reference ID from EasyPaisa' });
  if (!amount || !(parseFloat(amount) > 0)) return res.status(400).json({ error: 'Enter the payment amount' });
  if (!pay_date) return res.status(400).json({ error: 'Enter the payment date' });
  db.prepare('INSERT INTO payments(user_id,txn_id,amount,pay_date,note) VALUES(?,?,?,?,?)')
    .run(req.user.id, String(txn_id).trim(), String(amount).trim(), String(pay_date).trim(), note ? String(note).trim() : '');
  if (req.user.status === 'expired' || req.user.status === 'trial') {
    db.prepare("UPDATE users SET status='payment_pending' WHERE id=? AND status IN ('trial','expired')").run(req.user.id);
  }
  const u = refreshStatus(db.prepare('SELECT * FROM users WHERE id=?').get(req.user.id));
  res.json({ ok: true, status: u.status, message: 'Payment submitted. Status: Payment Pending - awaiting admin approval.' });
});

app.get('/api/payments/mine', auth, (req, res) => {
  const rows = db.prepare('SELECT id,txn_id,amount,pay_date,method,status,reviewed_at,created_at FROM payments WHERE user_id=? ORDER BY id DESC').all(req.user.id);
  res.json({ payments: rows });
});

/* ---------------- admin ---------------- */
app.get('/api/admin/users', auth, adminOnly, (req, res) => {
  const users = db.prepare(`SELECT u.id,u.email,u.username,u.full_name,u.role,u.status,u.trial_start,u.sub_start,u.sub_end,u.created_at,
      (SELECT COUNT(*) FROM payments p WHERE p.user_id=u.id AND p.status='pending') AS pending_payments
    FROM users u ORDER BY u.id DESC`).all();
  users.forEach(refreshStatus);
  res.json({ users });
});

app.get('/api/admin/users/:id', auth, adminOnly, (req, res) => {
  const u = db.prepare('SELECT * FROM users WHERE id=?').get(req.params.id);
  if (!u) return res.status(404).json({ error: 'User not found' });
  refreshStatus(u);
  const profile = db.prepare('SELECT * FROM profiles WHERE user_id=?').get(u.id) || null;
  const payments = db.prepare('SELECT * FROM payments WHERE user_id=? ORDER BY id DESC').all(u.id);
  res.json({ user: publicUser(u), profile, payments });
});

app.get('/api/admin/payments', auth, adminOnly, (req, res) => {
  const rows = db.prepare(`SELECT p.*, u.email, u.username, u.full_name FROM payments p
    JOIN users u ON u.id=p.user_id ORDER BY p.status='pending' DESC, p.id DESC`).all();
  res.json({ payments: rows });
});

app.post('/api/admin/payments/:id/approve', auth, adminOnly, (req, res) => {
  const pm = db.prepare('SELECT * FROM payments WHERE id=?').get(req.params.id);
  if (!pm) return res.status(404).json({ error: 'Payment not found' });
  const { sub_start, sub_end } = req.body || {};
  if (!sub_start || !sub_end) return res.status(400).json({ error: 'Provide subscription start and end dates' });
  const s = new Date(sub_start), e = new Date(sub_end);
  if (isNaN(s) || isNaN(e) || e <= s) return res.status(400).json({ error: 'Invalid date range' });
  db.prepare("UPDATE payments SET status='approved', reviewed_at=datetime('now'), reviewed_by=? WHERE id=?").run(req.user.id, pm.id);
  db.prepare("UPDATE users SET status='active', sub_start=?, sub_end=? WHERE id=? AND role='customer'")
    .run(sub_start, sub_end, pm.user_id);
  res.json({ ok: true, message: 'Payment approved. Account active until ' + sub_end });
});

app.post('/api/admin/payments/:id/reject', auth, adminOnly, (req, res) => {
  const pm = db.prepare('SELECT * FROM payments WHERE id=?').get(req.params.id);
  if (!pm) return res.status(404).json({ error: 'Payment not found' });
  db.prepare("UPDATE payments SET status='rejected', reviewed_at=datetime('now'), reviewed_by=? WHERE id=?").run(req.user.id, pm.id);
  db.prepare("UPDATE users SET status='expired' WHERE id=? AND status='payment_pending'").run(pm.user_id);
  res.json({ ok: true, message: 'Payment rejected.' });
});

app.post('/api/admin/users/:id/status', auth, adminOnly, (req, res) => {
  const u = db.prepare('SELECT * FROM users WHERE id=?').get(req.params.id);
  if (!u) return res.status(404).json({ error: 'User not found' });
  if (u.role === 'admin') return res.status(400).json({ error: 'Cannot change admin account status' });
  const { action, sub_start, sub_end } = req.body || {};
  if (action === 'suspend') {
    db.prepare("UPDATE users SET status='suspended' WHERE id=?").run(u.id);
  } else if (action === 'activate') {
    if (!sub_start || !sub_end) return res.status(400).json({ error: 'Provide subscription start and end dates to activate' });
    const s = new Date(sub_start), e = new Date(sub_end);
    if (isNaN(s) || isNaN(e) || e <= s) return res.status(400).json({ error: 'Invalid date range' });
    db.prepare("UPDATE users SET status='active', sub_start=?, sub_end=? WHERE id=?").run(sub_start, sub_end, u.id);
  } else if (action === 'unsuspend') {
    db.prepare("UPDATE users SET status='expired' WHERE id=?").run(u.id);
  } else if (action === 'extend') {
    if (!sub_end) return res.status(400).json({ error: 'Provide a new end date' });
    if (isNaN(new Date(sub_end))) return res.status(400).json({ error: 'Invalid date' });
    db.prepare("UPDATE users SET sub_end=? WHERE id=?").run(sub_end, u.id);
    const nu = db.prepare('SELECT * FROM users WHERE id=?').get(u.id);
    refreshStatus(nu);
  } else {
    return res.status(400).json({ error: 'Unknown action' });
  }
  res.json({ ok: true });
});

app.get('/api/admin/settings', auth, adminOnly, (req, res) => {
  res.json({ easypaisa_name: getSetting('easypaisa_name'), easypaisa_number: getSetting('easypaisa_number'),
             monthly_price: getSetting('monthly_price') });
});

app.post('/api/admin/settings', auth, adminOnly, (req, res) => {
  const { easypaisa_name, easypaisa_number, monthly_price } = req.body || {};
  if (easypaisa_name != null) setSetting('easypaisa_name', String(easypaisa_name).slice(0, 100));
  if (easypaisa_number != null) setSetting('easypaisa_number', String(easypaisa_number).slice(0, 30));
  if (monthly_price != null && parseFloat(monthly_price) > 0) setSetting('monthly_price', String(parseFloat(monthly_price)));
  res.json({ ok: true, message: 'Settings saved' });
});

app.get('/api/admin/stats', auth, adminOnly, (req, res) => {
  const stats = {
    customers: db.prepare("SELECT COUNT(*) c FROM users WHERE role='customer'").get().c,
    trial: db.prepare("SELECT COUNT(*) c FROM users WHERE role='customer' AND status='trial'").get().c,
    active: db.prepare("SELECT COUNT(*) c FROM users WHERE role='customer' AND status='active'").get().c,
    payment_pending: db.prepare("SELECT COUNT(*) c FROM users WHERE role='customer' AND status='payment_pending'").get().c,
    expired: db.prepare("SELECT COUNT(*) c FROM users WHERE role='customer' AND status='expired'").get().c,
    suspended: db.prepare("SELECT COUNT(*) c FROM users WHERE role='customer' AND status='suspended'").get().c,
    pending_payments: db.prepare("SELECT COUNT(*) c FROM payments WHERE status='pending'").get().c
  };
  res.json(stats);
});

/* ---------------- SPA fallbacks ---------------- */
app.get(['/dashboard', '/profile', '/recommendations', '/payment', '/account', '/login', '/register', '/setup', '/admin'], (req, res) => {
  ensureSetupCode();
  if (!adminExists() && req.path !== '/setup') return res.redirect('/setup');
  if (adminExists() && req.path === '/setup') return res.redirect('/login');
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`AI University & Scholarship Advisor running at http://localhost:${PORT}`);
  if (!adminExists()) ensureSetupCode();
});

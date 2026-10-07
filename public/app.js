/* AI University & Scholarship Advisor - frontend SPA (vanilla JS, no build step) */
'use strict';

const app = document.getElementById('app');
let ME = null;          // { user, profile, access }
let CFG = null;         // /api/config

/* ---------------- utilities ---------------- */
async function api(path, opts = {}) {
  const res = await fetch(path, {
    method: opts.method || 'GET',
    headers: { 'Content-Type': 'application/json' },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
    credentials: 'same-origin'
  });
  let data = {};
  try { data = await res.json(); } catch (e) {}
  if (!res.ok) { const err = new Error(data.error || 'Request failed'); err.data = data; err.status = res.status; throw err; }
  return data;
}
function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function statusBadge(st) {
  const labels = { trial: 'Free Trial', active: 'Active', payment_pending: 'Payment Pending', expired: 'Expired', suspended: 'Suspended' };
  return `<span class="badge ${esc(st)}">${labels[st] || esc(st)}</span>`;
}
function daysLeft(user) {
  if (user.status === 'trial' && user.trial_start) {
    const end = new Date(user.trial_start).getTime() + 7 * 86400 * 1000;
    return Math.max(0, Math.ceil((end - Date.now()) / 86400000));
  }
  if (user.status === 'active' && user.sub_end) {
    return Math.max(0, Math.ceil((new Date(user.sub_end + 'T23:59:59') - Date.now()) / 86400000));
  }
  return 0;
}
const COUNTRIES = [['UK','United Kingdom'],['USA','United States'],['CA','Canada'],['AU','Australia'],['DE','Germany'],
  ['NL','Netherlands'],['TR','Turkey'],['MY','Malaysia'],['CN','China'],['HU','Hungary'],['IT','Italy'],['PK','Pakistan']];
const PROGRAMS = ['MSc Computer Science','MSc Data Science','MSc Artificial Intelligence','MBA','MSc Management','MSc Finance',
  'MSc Public Health','MSc Nursing','MSc Mechanical Engineering','MSc Electrical Engineering','MSc Cybersecurity',
  'MSc Information Technology','MSc Education','MSc Psychology'];

/* ---------------- shell ---------------- */
function shell(content, activeNav) {
  const role = ME && ME.user.role;
  let nav = '';
  if (role === 'customer') {
    nav = `
      <a href="/dashboard" data-nav="${activeNav === 'dashboard' ? 1 : ''}">Dashboard</a>
      <a href="/profile" data-nav="${activeNav === 'profile' ? 1 : ''}">My Profile</a>
      <a href="/recommendations" data-nav="${activeNav === 'rec' ? 1 : ''}">AI Recommendations</a>
      <a href="/payment" data-nav="${activeNav === 'payment' ? 1 : ''}">Payment</a>
      <a href="/account" data-nav="${activeNav === 'account' ? 1 : ''}">Account</a>`;
  } else if (role === 'admin') {
    nav = `<a href="/admin" data-nav="${activeNav === 'admin' ? 1 : ''}" class="active">Admin Dashboard</a>`;
  }
  const chip = ME ? `
    <div class="userchip"><div class="avatar">${esc((ME.user.full_name || ME.user.username || '?')[0].toUpperCase())}</div>
    <div><strong>${esc(ME.user.full_name || ME.user.username)}</strong><br>${statusBadge(ME.user.status)}</div></div>
    <button class="btn small secondary" id="logoutBtn">Logout</button>` :
    `<a class="btn small" href="/login">Login</a>`;
  return `
  <header class="topbar">
    <div class="brand"><div class="logo">🎓</div><div>AI University &amp; Scholarship Advisor<small>Universities · Scholarships · EasyPaisa subscriptions</small></div></div>
    <nav class="nav">${nav}</nav>
    <div class="spacer"></div>
    ${chip}
  </header>
  <main class="main">${content}</main>
  <footer class="footer">AI University &amp; Scholarship Advisor — simple. affordable. smart.</footer>`;
}
function setHTML(html) {
  app.innerHTML = html;
  document.querySelectorAll('[data-nav="1"]').forEach(a => a.classList.add('active'));
  const lo = document.getElementById('logoutBtn');
  if (lo) lo.onclick = async () => { await api('/api/logout', { method: 'POST' }); location = '/login'; };
}
function alertBox(type, msg) { return `<div class="alert ${type}">${msg}</div>`; }

/* ---------------- public pages ---------------- */
function landing() {
  setHTML(`
  <header class="topbar">
    <div class="brand"><div class="logo">🎓</div><div>AI University &amp; Scholarship Advisor</div></div>
    <div class="spacer"></div><a class="btn small secondary" href="/login">Login</a><a class="btn small" href="/register">Get Started Free</a>
  </header>
  <main class="main">
    <div class="hero">
      <h1>Find your university, program &amp; scholarship — with AI</h1>
      <p>Answer a few questions about your degree, CGPA, English score and budget. Get matched universities, programs, scholarships and a clear action plan. Start with a 7-day free trial.</p>
      <div class="btn-row" style="justify-content:center;margin-top:18px">
        <a class="btn" href="/register">Create free account</a>
        <a class="btn secondary" href="/login">Sign in</a>
      </div>
    </div>
    <div class="grid cols-3" style="margin-top:30px">
      <div class="card"><h3>🤖 AI Recommendations</h3><p class="subtitle">Suitable universities, programs, scholarships, countries, eligibility and match scores — instantly analysed from your profile.</p></div>
      <div class="card"><h3>💳 EasyPaisa Subscription</h3><p class="subtitle">7-day free trial. After that, send payment via EasyPaisa, submit your transaction ID and get approved by the admin.</p></div>
      <div class="card"><h3>🛡️ Secure Accounts</h3><p class="subtitle">Encrypted passwords, role-based access for customers and admins, automatic trial &amp; subscription locking.</p></div>
    </div>
  </main>
  <footer class="footer">AI University &amp; Scholarship Advisor</footer>`);
}

function authPage(tab) {
  const isReg = tab === 'register';
  setHTML(`
  <header class="topbar"><div class="brand"><div class="logo">🎓</div><div>AI University &amp; Scholarship Advisor</div></div><div class="spacer"></div>
    <a class="btn small secondary" href="${isReg ? '/login' : '/register'}">${isReg ? 'Sign in' : 'Create account'}</a></header>
  <main class="main"><div class="auth-wrap">
    <div class="card">
      <div class="auth-tabs">
        <button id="tLogin" class="${isReg ? '' : 'active'}">Login</button>
        <button id="tReg" class="${isReg ? 'active' : ''}">Register (7-day free trial)</button>
      </div>
      <div id="authAlert"></div>
      ${isReg ? `
      <div class="field"><label>Full Name</label><input id="rName" placeholder="e.g. Ali Raza" /></div>
      <div class="field"><label>Email</label><input id="rEmail" type="email" placeholder="you@example.com" /></div>
      <div class="field"><label>Username</label><input id="rUser" placeholder="min 3 characters" /></div>
      <div class="field"><label>Password</label><input id="rPass" type="password" placeholder="min 8 characters" /><div class="hint">Stored encrypted — never in plain text.</div></div>
      <button class="btn" style="width:100%" id="rBtn">Create account &amp; start free trial</button>` : `
      <div class="field"><label>Email or Username</label><input id="lLogin" /></div>
      <div class="field"><label>Password</label><input id="lPass" type="password" /></div>
      <button class="btn" style="width:100%" id="lBtn">Sign in</button>`}
    </div>
  </div></main>`);
  document.getElementById('tLogin').onclick = () => location = '/login';
  document.getElementById('tReg').onclick = () => location = '/register';
  const showErr = m => document.getElementById('authAlert').innerHTML = alertBox('error', esc(m));
  if (isReg) {
    document.getElementById('rBtn').onclick = async () => {
      try {
        await api('/api/register', { method: 'POST', body: {
          name: rName.value, email: rEmail.value, username: rUser.value, password: rPass.value } });
        location = '/profile';
      } catch (e) { showErr(e.message); }
    };
  } else {
    const go = async () => {
      try {
        const r = await api('/api/login', { method: 'POST', body: { login: lLogin.value, password: lPass.value } });
        location = r.user.role === 'admin' ? '/admin' : '/dashboard';
      } catch (e) { showErr(e.message); }
    };
    document.getElementById('lBtn').onclick = go;
    lPass.addEventListener('keydown', e => { if (e.key === 'Enter') go(); });
  }
}

function setupPage() {
  setHTML(`
  <header class="topbar"><div class="brand"><div class="logo">🎓</div><div>Initial Setup — Admin Account</div></div></header>
  <main class="main"><div class="auth-wrap">
    <div class="card">
      <h2>Create the Admin account</h2>
      <p class="subtitle">This is shown only on first run, before any admin exists. Enter the one-time <strong>setup code printed in the server console</strong> to prove you are the owner of this installation. No password is hard-coded in the app.</p>
      <div id="sAlert"></div>
      <div class="field"><label>Setup code (from server console)</label><input id="sCode" placeholder="e.g. 3F9A2C" /></div>
      <div class="field"><label>Admin email</label><input id="sEmail" type="email" /></div>
      <div class="field"><label>Admin username</label><input id="sUser" /></div>
      <div class="field"><label>Admin password</label><input id="sPass" type="password" placeholder="min 8 characters" /><div class="hint">Choose your own strong password — it is stored hashed.</div></div>
      <button class="btn" style="width:100%" id="sBtn">Create admin &amp; finish setup</button>
    </div>
  </div></main>`);
  document.getElementById('sBtn').onclick = async () => {
    try {
      await api('/api/setup/admin', { method: 'POST', body: { code: sCode.value, email: sEmail.value, username: sUser.value, password: sPass.value } });
      location = '/admin';
    } catch (e) { document.getElementById('sAlert').innerHTML = alertBox('error', esc(e.message)); }
  };
}

/* ---------------- customer pages ---------------- */
function dashboard() {
  const u = ME.user;
  let sub = '';
  if (u.status === 'trial') {
    const left = daysLeft(u);
    sub = `${alertBox('info', `Your <strong>7-day free trial</strong> is active — <strong>${left} day(s) left</strong>. When it ends, AI recommendations will lock until your subscription is approved.`)}
      <div class="progress-track"><div class="progress-fill" style="width:${(left / 7) * 100}%"></div></div>`;
  } else if (u.status === 'active') {
    sub = alertBox('ok', `Subscription <strong>Active</strong> until <strong>${esc(u.sub_end)}</strong> (${daysLeft(u)} day(s) left).`);
  } else if (u.status === 'payment_pending') {
    sub = alertBox('warn', 'Status: <strong>Payment Pending</strong> — your transaction was submitted and is awaiting admin approval.');
  } else if (u.status === 'expired') {
    sub = alertBox('error', 'Your access has ended. Go to the <a href="/payment">Payment page</a>, send the subscription fee via EasyPaisa and submit your transaction ID.');
  } else if (u.status === 'suspended') {
    sub = alertBox('error', 'Account suspended by administrator. Contact support.');
  }
  const p = ME.profile;
  const steps = [
    { t: '1. Create your profile', d: 'Degree, CGPA, IELTS, budget…', href: '/profile', done: !!p },
    { t: '2. Run AI analysis', d: 'Get universities, programs & scholarships', href: '/recommendations', done: false },
    { t: '3. Follow next steps', d: 'Requirements & application plan', href: '/recommendations', done: false }
  ];
  setHTML(shell(`
    <h2 style="margin-bottom:14px">Welcome, ${esc(u.full_name || u.username)} 👋</h2>
    <div class="card">${sub}</div>
    <div class="grid cols-3">
      ${steps.map(s => `<div class="card"><h3>${s.t} ${s.done ? '✅' : ''}</h3><p class="subtitle">${s.d}</p><a class="btn small secondary" href="${s.href}">Open</a></div>`).join('')}
    </div>
    <div class="card"><h3>Quick actions</h3><div class="btn-row" style="margin-top:8px">
      <a class="btn" href="/recommendations">🤖 Get AI Recommendations</a>
      <a class="btn secondary" href="/profile">✏️ Edit Profile</a>
      <a class="btn secondary" href="/payment">💳 Subscribe</a>
    </div></div>`, 'dashboard'));
}

function profilePage() {
  const p = ME.profile || {};
  const f = (id, label, val, ph) => `<div class="field"><label>${label}</label><input id="${id}" value="${esc(val || '')}" placeholder="${ph || ''}" /></div>`;
  const sel = (id, label, opts, val) => `<div class="field"><label>${label}</label><select id="${id}">${opts.map(o =>
    `<option value="${esc(o[0])}" ${String(val) === o[0] ? 'selected' : ''}>${esc(o[1])}</option>`).join('')}</select></div>`;
  setHTML(shell(`
    <div class="card">
      <h2>Candidate Profile</h2>
      <p class="subtitle">The AI uses these details to match universities, programs and scholarships. All fields are saved to your private account.</p>
      <div id="pfAlert"></div>
      <div class="grid cols-2">
        ${f('name', 'Name', p.name || ME.user.full_name, 'Full name')}
        ${sel('highest_degree', 'Highest degree', [['','Select…'],['Intermediate','Intermediate / FSc / A-Levels'],['Bachelor','Bachelor'],['Master','Master'],['Other','Other']], p.highest_degree)}
        ${f('field', 'Degree / Field of study', p.field, 'e.g. Computer Science, Business Administration')}
        ${f('cgpa', 'CGPA / Percentage', p.cgpa, 'e.g. 3.4 / 100 or 78%')}
        ${f('grad_year', 'Graduation year', p.grad_year, 'e.g. 2023')}
        ${sel('english_test', 'English test', [['None','Not taken yet'],['IELTS','IELTS'],['PTE','PTE'],['TOEFL','TOEFL']], p.english_test || 'None')}
        ${f('english_score', 'English score (band)', p.english_score, 'e.g. 6.5')}
        ${f('work_exp', 'Work experience (years)', p.work_exp, 'e.g. 2')}
        ${sel('country', 'Preferred country', [['','No preference'],...COUNTRIES], p.country)}
        ${sel('program', 'Preferred degree / program', [['','No preference'],...PROGRAMS.map(x=>[x,x])], p.program)}
        ${f('budget', 'Approximate budget (USD / year)', p.budget, 'e.g. 15000')}
      </div>
      <div class="field"><label>Other relevant information</label><textarea id="extra" placeholder="Publications, awards, dependents, health, visa history, preferences…">${esc(p.extra || '')}</textarea></div>
      <div class="btn-row">
        <button class="btn" id="savePf">💾 Save profile</button>
        <a class="btn secondary" href="/recommendations">Run AI analysis →</a>
      </div>
    </div>`, 'profile'));
  document.getElementById('savePf').onclick = async () => {
    const body = {};
    ['name','highest_degree','field','cgpa','grad_year','english_test','english_score','work_exp','country','program','budget','extra']
      .forEach(k => body[k] = document.getElementById(k).value);
    try {
      await api('/api/profile', { method: 'POST', body });
      ME.profile = body;
      document.getElementById('pfAlert').innerHTML = alertBox('ok', 'Profile saved ✔');
    } catch (e) { document.getElementById('pfAlert').innerHTML = alertBox('error', esc(e.message)); }
  };
}

function ring(score) {
  const r = 26, c = 2 * Math.PI * r, off = c * (1 - score / 100);
  const color = score >= 80 ? '#16a34a' : score >= 60 ? '#d97706' : '#dc2626';
  return `<svg width="66" height="66" class="score-ring"><circle cx="33" cy="33" r="${r}" fill="none" stroke="#e2e8f0" stroke-width="7"/>
    <circle cx="33" cy="33" r="${r}" fill="none" stroke="${color}" stroke-width="7" stroke-linecap="round"
      stroke-dasharray="${c}" stroke-dashoffset="${off}" transform="rotate(-90 33 33)"/>
    <text x="33" y="38" text-anchor="middle" class="score-num">${score}</text></svg>`;
}

async function recPage() {
  setHTML(shell(`<div class="card"><div class="loading-screen"><div class="spinner"></div></div><p style="text-align:center;color:var(--muted)">Running AI analysis…</p></div>`, 'rec'));
  let data;
  try {
    data = await api('/api/recommendations', { method: 'POST' });
  } catch (e) {
    if (e.data && e.data.locked) {
      setHTML(shell(`
        <div class="card lock-card">
          <div class="lock-icon">🔒</div>
          <h2>AI Recommendations locked</h2>
          <p class="subtitle">${esc(e.data.message || 'Your free trial has ended.')}</p>
          <div class="btn-row" style="justify-content:center">
            <a class="btn" href="/payment">💳 Subscribe via EasyPaisa</a>
            <a class="btn secondary" href="/account">View my account</a>
          </div>
        </div>`, 'rec'));
      return;
    }
    setHTML(shell(alertBox('error', esc(e.message)) + `<div class="card"><a class="btn" href="/profile">Go to My Profile</a></div>`, 'rec'));
    return;
  }
  const ps = data.profile_summary;
  setHTML(shell(`
    <div class="card" style="display:flex;align-items:center;gap:18px;flex-wrap:wrap">
      ${ring(data.match_score)}
      <div><h2>Top match score: ${data.match_score}/100</h2>
      <p class="subtitle">Best-fit country: <strong>${esc(data.countries[0].country)}</strong> · Analysed ${new Date(data.generated_at).toLocaleString()}</p></div>
      <div class="spacer"></div>
      <button class="btn secondary small" id="rerun">↻ Re-run analysis</button>
    </div>

    <div class="card"><h3>🌍 Recommended countries</h3>
      <div class="table-wrap"><table><tr><th>Country</th><th>Match</th><th>Tuition/yr (est.)</th><th>Living/yr (est.)</th><th>Min IELTS</th><th>Why</th></tr>
      ${data.countries.map(c => `<tr><td><strong>${esc(c.country)}</strong></td><td>${c.score}/100</td>
        <td>${c.est_tuition_usd_year === 0 ? 'No tuition 🎉' : '$' + c.est_tuition_usd_year.toLocaleString()}</td>
        <td>$${c.est_living_usd_year.toLocaleString()}</td><td>${c.min_ielts}</td>
        <td style="color:var(--muted);font-size:13px">${c.reasons.map(esc).join(' · ') || 'Good overall fit'}</td></tr>`).join('')}
      </table></div></div>

    <div class="grid cols-2">
      <div class="card"><h3>🏛️ Suitable universities</h3><ul class="plain">
        ${data.universities.map(u => `<li style="margin-bottom:8px"><strong>${esc(u.university)}</strong> — ${esc(u.country)} <span class="badge trial">${u.score}% match</span></li>`).join('')}
      </ul></div>
      <div class="card"><h3>🎯 Suitable programs</h3><div class="pill-list">${data.programs.map(x => `<span class="pill">${esc(x)}</span>`).join('')}</div>
        <h3 style="margin-top:16px">🏅 Scholarships</h3><ul class="plain">
        ${data.scholarships.map(s => `<li style="margin-bottom:6px">${esc(s.scholarship)} <span style="color:var(--muted)">(${esc(s.country)})</span></li>`).join('')}
      </ul></div>
    </div>

    <div class="grid cols-2">
      <div class="card"><h3>📋 Basic eligibility</h3>
        <p>Overall profile strength: <strong>${esc(data.eligibility.overall)}</strong></p>
        <p class="subtitle" style="margin-top:6px">Likely eligible for: ${data.eligibility.eligibleCountries.map(esc).join(', ') || '—'}</p>
        ${data.eligibility.notes.map(n => alertBox('warn', esc(n))).join('')}
        <p class="hint">Normalised: CGPA (4.0 scale) ≈ ${ps.cgpa_4_0 ?? 'n/a'} · IELTS ≈ ${ps.ielts ?? 'n/a'} · Budget $${ps.budget_usd_year.toLocaleString()}/yr · Work ${ps.work_years} yr</p>
      </div>
      <div class="card"><h3>📌 Important requirements</h3><ul class="checks">${data.requirements.map(r => `<li>${esc(r)}</li>`).join('')}</ul></div>
    </div>

    <div class="card"><h3>🚀 Next steps</h3><ol class="steps">${data.next_steps.map(s => `<li>${esc(s)}</li>`).join('')}</ol>
      <div class="btn-row" style="margin-top:10px"><a class="btn secondary" href="/profile">Edit profile &amp; refine results</a></div></div>
  `, 'rec'));
  document.getElementById('rerun').onclick = recPage;
}

async function paymentPage() {
  let mine = [];
  try { mine = (await api('/api/payments/mine')).payments; } catch (e) {}
  const price = CFG.monthly_price;
  const u = ME.user;
  let banner = '';
  if (u.status === 'trial') banner = alertBox('info', `You are on the free trial (${daysLeft(u)} day(s) left). You can subscribe early — the admin will set your subscription dates after approval.`);
  else if (u.status === 'active') banner = alertBox('ok', `Your subscription is Active until <strong>${esc(u.sub_end)}</strong>. Renew any time before expiry.`);
  else if (u.status === 'payment_pending') banner = alertBox('warn', 'Status: <strong>Payment Pending</strong> — paid features stay locked until the admin approves your transaction.');
  else if (u.status === 'expired') banner = alertBox('error', 'Trial/subscription ended — AI recommendations are locked. Complete the payment below to regain access after approval.');
  else if (u.status === 'suspended') banner = alertBox('error', 'Account suspended — contact the administrator.');

  setHTML(shell(`
    <div class="card">
      <h2>💳 Subscription Payment</h2>
      <p class="subtitle">Monthly subscription: <strong>PKR ${esc(price)}</strong> · Pay directly to the EasyPaisa account below, then submit your transaction details for approval.</p>
      ${banner}
      <div class="easypaisa-box">
        <div style="font-weight:800;font-size:17px;margin-bottom:6px">EasyPaisa — Send payment to:</div>
        <div class="row"><span>Payment Method</span><span class="val">EasyPaisa</span></div>
        <div class="row"><span>Account Name</span><span class="val" id="epName">${esc(CFG.easypaisa_name)}</span></div>
        <div class="row"><span>EasyPaisa Number</span><span class="val" id="epNum">${esc(CFG.easypaisa_number)}</span></div>
        <div class="row"><span>Amount</span><span class="val">PKR ${esc(price)}</span></div>
      </div>
      <div id="payAlert"></div>
      <div class="grid cols-3">
        <div class="field"><label>Transaction / Reference ID</label><input id="txn" placeholder="e.g. 1234567890 (TID from EasyPaisa SMS)" /></div>
        <div class="field"><label>Payment amount (PKR)</label><input id="amt" type="number" value="${esc(price)}" /></div>
        <div class="field"><label>Payment date</label><input id="pdate" type="date" value="${new Date().toISOString().slice(0,10)}" /></div>
      </div>
      <div class="field"><label>Note (optional)</label><input id="pnote" placeholder="e.g. 1-month subscription" /></div>
      <button class="btn" id="submitPay">Submit payment for approval</button>
    </div>

    <div class="card"><h3>My payment submissions</h3>
      ${mine.length ? `<div class="table-wrap"><table><tr><th>Date submitted</th><th>Transaction ID</th><th>Amount</th><th>Method</th><th>Status</th></tr>
        ${mine.map(p => `<tr><td>${esc(p.pay_date)}</td><td>${esc(p.txn_id)}</td><td>PKR ${esc(p.amount)}</td><td>${esc(p.method)}</td><td>${statusBadge(p.status)}</td></tr>`).join('')}
      </table></div>` : '<p class="subtitle">No payments submitted yet.</p>'}
    </div>`, 'payment'));

  document.getElementById('submitPay').onclick = async () => {
    try {
      const r = await api('/api/payments', { method: 'POST', body: { txn_id: txn.value, amount: amt.value, pay_date: pdate.value, note: pnote.value } });
      document.getElementById('payAlert').innerHTML = alertBox('ok', esc(r.message));
      await refreshMe(); paymentPage();
    } catch (e) { document.getElementById('payAlert').innerHTML = alertBox('error', esc(e.message)); }
  };
}

function accountPage() {
  const u = ME.user;
  const rows = [
    ['Name', u.full_name], ['Username', u.username], ['Email', u.email],
    ['Account status', statusBadge(u.status)],
    ['Trial started', u.trial_start ? new Date(u.trial_start).toLocaleString() : '—'],
    ['Days left in current access', u.status === 'trial' || u.status === 'active' ? daysLeft(u) + ' day(s)' : '0'],
    ['Subscription start', u.sub_start || '—'], ['Subscription end', u.sub_end || '—']
  ];
  setHTML(shell(`
    <div class="card"><h2>👤 My Account</h2><p class="subtitle">Manage your subscription status in one place.</p>
      <table>${rows.map(r => `<tr><td style="color:var(--muted);width:40%">${r[0]}</td><td>${r[1] == null ? '—' : (r[1] instanceof Object || String(r[1]).includes('badge') ? r[1] : esc(r[1]))}</td></tr>`).join('')}</table>
    </div>
    <div class="card"><h3>Access to paid features</h3>
      <p class="subtitle">${ME.access ? '✅ Unlocked — you can use AI recommendations.' : '🔒 Locked — subscribe and wait for admin approval.'}</p>
      <div class="btn-row"><a class="btn" href="/payment">💳 Payment page</a><a class="btn secondary" href="/recommendations">🤖 Recommendations</a></div>
    </div>`, 'account'));
}

/* ---------------- admin page ---------------- */
async function adminPage() {
  let stats, users, payments, settings;
  try {
    [stats, users, payments, settings] = await Promise.all([
      api('/api/admin/stats'), api('/api/admin/users'), api('/api/admin/payments'), api('/api/admin/settings')
    ]);
  } catch (e) { setHTML(shell(alertBox('error', esc(e.message)), 'admin')); return; }

  const statCards = [
    ['Customers', stats.customers], ['On trial', stats.trial], ['Active', stats.active],
    ['Payment pending', stats.payment_pending], ['Expired', stats.expired], ['Suspended', stats.suspended],
    ['Pending payments', stats.pending_payments]
  ].map(s => `<div class="stat"><div class="num">${s[1]}</div><div class="lbl">${s[0]}</div></div>`).join('');

  const custUsers = users.filter(u => u.role === 'customer');
  const pending = payments.filter(p => p.status === 'pending');

  setHTML(shell(`
    <h2 style="margin-bottom:14px">🛠️ Admin Dashboard</h2>
    <div class="grid cols-4" style="margin-bottom:18px">${statCards}</div>

    <div class="card"><h3>⏳ Pending payment submissions</h3><div id="admAlert"></div>
      ${pending.length ? `<div class="table-wrap"><table>
        <tr><th>User</th><th>Transaction ID</th><th>Amount (PKR)</th><th>Payment date</th><th>Submitted</th><th>Approve (set dates)</th><th>Reject</th></tr>
        ${pending.map(p => {
          const today = new Date(); const def = new Date(today.getTime() + 30 * 86400000).toISOString().slice(0, 10);
          return `<tr><td><strong>${esc(p.full_name || p.username)}</strong><br><span style="color:var(--muted);font-size:12.5px">${esc(p.email)}</span></td>
          <td>${esc(p.txn_id)}</td><td>${esc(p.amount)}</td><td>${esc(p.pay_date)}</td><td style="font-size:12.5px;color:var(--muted)">${esc(p.created_at)}</td>
          <td style="white-space:nowrap"><input type="date" id="ap_s_${p.id}" value="${today.toISOString().slice(0,10)}" style="width:130px;display:inline-block;margin-right:4px"/>
              <input type="date" id="ap_e_${p.id}" value="${def}" style="width:130px;display:inline-block;margin:6px 4px 0 0"/>
              <button class="btn small success" onclick="approvePay(${p.id})">✔ Approve &amp; Activate</button></td>
          <td><button class="btn small danger" onclick="rejectPay(${p.id})">✖ Reject</button></td></tr>`;
        }).join('')}
      </table></div>` : '<p class="subtitle">No pending payments. 🎉</p>'}
    </div>

    <div class="card"><h3>🧾 All payments (transaction IDs)</h3>
      ${payments.length ? `<div class="table-wrap"><table><tr><th>ID</th><th>User</th><th>Transaction ID</th><th>Amount</th><th>Date</th><th>Status</th><th>Reviewed</th></tr>
        ${payments.map(p => `<tr><td>#${p.id}</td><td>${esc(p.full_name || p.username)} <span style="color:var(--muted)">(${esc(p.email)})</span></td>
          <td>${esc(p.txn_id)}</td><td>${esc(p.amount)}</td><td>${esc(p.pay_date)}</td><td>${statusBadge(p.status)}</td>
          <td style="font-size:12.5px;color:var(--muted)">${esc(p.reviewed_at || '—')}</td></tr>`).join('')}
      </table></div>` : '<p class="subtitle">No payments yet.</p>'}
    </div>

    <div class="card"><h3>👥 Registered customers</h3>
      ${custUsers.length ? `<div class="table-wrap"><table>
        <tr><th>ID</th><th>Name</th><th>Username / Email</th><th>Status</th><th>Trial</th><th>Sub start</th><th>Sub end</th><th>Pending pays</th><th>Actions</th></tr>
        ${custUsers.map(u => `<tr><td>#${u.id}</td><td>${esc(u.full_name || '—')}</td>
          <td>${esc(u.username)}<br><span style="color:var(--muted);font-size:12.5px">${esc(u.email)}</span></td>
          <td>${statusBadge(u.status)}</td>
          <td style="font-size:12.5px">${u.trial_start ? esc(u.trial_start.slice(0,10)) : '—'}</td>
          <td>${u.sub_start || '—'}</td><td>${u.sub_end || '—'}</td>
          <td>${u.pending_payments > 0 ? `<span class="badge pending">${u.pending_payments}</span>` : '0'}</td>
          <td style="white-space:nowrap">
            <button class="btn small secondary" onclick="viewUser(${u.id})">👁 View</button>
            ${u.status !== 'suspended'
              ? `<button class="btn small danger" onclick="setUserStatus(${u.id},'suspend')">Suspend</button>`
              : `<button class="btn small" onclick="setUserStatus(${u.id},'unsuspend')">Unsuspend</button>`}
            <button class="btn small success" onclick="activateUser(${u.id})">Activate</button>
            <button class="btn small secondary" onclick="extendUser(${u.id})">Extend</button>
          </td></tr>`).join('')}
      </table></div>` : '<p class="subtitle">No customers registered yet.</p>'}
    </div>

    <div class="grid cols-2">
      <div class="card"><h3>⚙️ Payment settings (EasyPaisa)</h3>
        <p class="subtitle">Shown on the customer Payment page. Update here whenever your account details change.</p>
        <div class="field"><label>EasyPaisa Account Name</label><input id="setName" value="${esc(settings.easypaisa_name)}" /></div>
        <div class="field"><label>EasyPaisa Number</label><input id="setNum" value="${esc(settings.easypaisa_number)}" /></div>
        <div class="field"><label>Monthly subscription price (PKR)</label><input id="setPrice" type="number" value="${esc(settings.monthly_price)}" /></div>
        <button class="btn" onclick="saveSettings()">Save settings</button>
      </div>
      <div class="card"><h3>ℹ️ How billing works</h3>
        <ul class="plain" style="color:var(--muted);font-size:14px">
          <li>• New customers get an automatic <strong>7-day free trial</strong>.</li>
          <li>• After the trial, AI recommendations lock automatically.</li>
          <li>• Customer pays via EasyPaisa and submits the transaction ID → status becomes <strong>Payment Pending</strong>.</li>
          <li>• Approving a payment sets the subscription <strong>Active</strong> until the chosen end date; expiry locks paid features again.</li>
          <li>• You can suspend / activate / extend any account manually.</li>
        </ul>
      </div>
    </div>
    <div class="card" id="userDetail" style="display:none"></div>
  `, 'admin'));
}

window.admMsg = m => { document.getElementById('admAlert').innerHTML = alertBox('ok', esc(m)); window.adminPageSoftReload(); };
window.adminPageSoftReload = () => adminPage();

window.approvePay = async (id) => {
  const s = document.getElementById('ap_s_' + id).value, e = document.getElementById('ap_e_' + id).value;
  if (!s || !e) return alert('Choose subscription start and end dates');
  try {
    const r = await api(`/api/admin/payments/${id}/approve`, { method: 'POST', body: { sub_start: s, sub_end: e } });
    alert(r.message);
    adminPage();
  } catch (err) { alert(err.message); }
};
window.rejectPay = async (id) => {
  if (!confirm('Reject this payment?')) return;
  try { await api(`/api/admin/payments/${id}/reject`, { method: 'POST' }); adminPage(); } catch (e) { alert(e.message); }
};
window.setUserStatus = async (uid, action) => {
  try { await api(`/api/admin/users/${uid}/status`, { method: 'POST', body: { action } }); adminPage(); } catch (e) { alert(e.message); }
};
window.activateUser = async (uid) => {
  const s = prompt('Subscription start date (YYYY-MM-DD):', new Date().toISOString().slice(0, 10)); if (!s) return;
  const e = prompt('Subscription end date (YYYY-MM-DD):', new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10)); if (!e) return;
  try { await api(`/api/admin/users/${uid}/status`, { method: 'POST', body: { action: 'activate', sub_start: s, sub_end: e } }); adminPage(); } catch (err) { alert(err.message); }
};
window.extendUser = async (uid) => {
  const e = prompt('New subscription end date (YYYY-MM-DD):'); if (!e) return;
  try { await api(`/api/admin/users/${uid}/status`, { method: 'POST', body: { action: 'extend', sub_end: e } }); adminPage(); } catch (err) { alert(err.message); }
};
window.saveSettings = async () => {
  try {
    await api('/api/admin/settings', { method: 'POST', body: {
      easypaisa_name: document.getElementById('setName').value,
      easypaisa_number: document.getElementById('setNum').value,
      monthly_price: document.getElementById('setPrice').value } });
    CFG = await api('/api/config');
    alert('Settings saved ✔');
  } catch (e) { alert(e.message); }
};
window.viewUser = async (uid) => {
  try {
    const d = await api('/api/admin/users/' + uid);
    const box = document.getElementById('userDetail');
    const pf = d.profile;
    const kv = (a, b) => `<tr><td style="color:var(--muted);width:35%">${a}</td><td>${b == null || b === '' ? '—' : esc(b)}</td></tr>`;
    box.style.display = 'block';
    box.innerHTML = `<h3>Customer detail — #${d.user.id} ${esc(d.user.full_name || d.user.username)}</h3>
      <div class="grid cols-2">
        <div><table>
          ${kv('Email', d.user.email)}${kv('Username', d.user.username)}${kv('Status', null)}
          <tr><td style="color:var(--muted)">Status</td><td>${statusBadge(d.user.status)}</td></tr>
          ${kv('Trial started', d.user.trial_start)}${kv('Subscription start', d.user.sub_start)}${kv('Subscription end', d.user.sub_end)}
          ${kv('Registered', d.user.created_at)}
        </table></div>
        <div>${pf ? `<table>
          ${kv('Name', pf.name)}${kv('Highest degree', pf.highest_degree)}${kv('Field', pf.field)}${kv('CGPA/%', pf.cgpa)}
          ${kv('Graduation year', pf.grad_year)}${kv('English', pf.english_test + (pf.english_score ? ' — ' + pf.english_score : ''))}
          ${kv('Work exp (yrs)', pf.work_exp)}${kv('Preferred country', pf.country)}${kv('Preferred program', pf.program)}
          ${kv('Budget USD/yr', pf.budget)}${kv('Extra info', pf.extra)}
        </table>` : '<p class="subtitle">No profile filled in yet.</p>'}</div>
      </div>
      <h3 style="margin-top:14px">Payments</h3>
      ${d.payments.length ? `<div class="table-wrap"><table><tr><th>Txn ID</th><th>Amount</th><th>Date</th><th>Status</th></tr>
        ${d.payments.map(p => `<tr><td>${esc(p.txn_id)}</td><td>${esc(p.amount)}</td><td>${esc(p.pay_date)}</td><td>${statusBadge(p.status)}</td></tr>`).join('')}
      </table></div>` : '<p class="subtitle">None.</p>'}`;
    box.scrollIntoView({ behavior: 'smooth' });
  } catch (e) { alert(e.message); }
};

/* ---------------- router ---------------- */
async function refreshMe() { ME = await api('/api/me'); }

async function route() {
  const path = location.pathname;
  // First-run: force setup page until an admin account exists
  if (CFG.setupNeeded) return setupPage();

  // logged-in check
  if (ME === null) {
    try { await refreshMe(); } catch (e) { ME = false; }
  }
  const loggedIn = !!(ME && ME.user);
  if (path === '/') {
    if (!loggedIn) return landing();
    return location = ME.user.role === 'admin' ? '/admin' : '/dashboard';
  }
  if (path === '/setup') return location = '/login';
  if (path === '/login') { if (loggedIn) return location = ME.user.role === 'admin' ? '/admin' : '/dashboard'; return authPage('login'); }
  if (path === '/register') { if (loggedIn) return location = '/profile'; return authPage('register'); }
  if (!loggedIn) return location = '/login';

  const role = ME.user.role;
  switch (path) {
    case '/dashboard':
      if (role !== 'customer') return location = '/admin';
      return dashboard();
    case '/profile':
      if (role !== 'customer') return location = '/admin';
      return profilePage();
    case '/recommendations':
      if (role !== 'customer') return location = '/admin';
      return recPage();
    case '/payment':
      if (role !== 'customer') return location = '/admin';
      return paymentPage();
    case '/account':
      if (role !== 'customer') return location = '/admin';
      return accountPage();
    case '/admin':
      if (role !== 'admin') return location = '/dashboard';
      return adminPage();
    default:
      return location = role === 'admin' ? '/admin' : '/dashboard';
  }
}

(async function boot() {
  try { CFG = await api('/api/config'); } catch (e) { CFG = { setupNeeded: false }; }
  await route();
})();

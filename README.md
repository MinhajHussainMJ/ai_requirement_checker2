# 🎓 AI University & Scholarship Advisor

A simple, modern, responsive web app that recommends **universities, programs, scholarships and countries** to study-abroad candidates, with a **1-day free trial**, **EasyPaisa manual payments**, and an **Admin dashboard** for payment approval and account management.

Built with **Node.js + Express + SQLite (better-sqlite3)** and a vanilla-JS frontend — no paid services, no build step, cheap to host anywhere.

## Modules (only 3 — by design)
1. **Candidate & AI Recommendation** — profile form → suitable universities, programs, scholarships, countries, basic eligibility, match score, important requirements, next steps.
2. **User Account & Payment** — automatic 1-day free trial → locks after expiry → EasyPaisa payment page → customer submits Transaction ID / amount / date → status becomes **Payment Pending** until Admin approval.
3. **Admin Dashboard** — view customers & profiles, trial status, payment submissions & transaction IDs, approve/reject payments, activate/suspend accounts, set subscription start/end dates, and edit the EasyPaisa name/number/price placeholders.

No CV builder, no ATS, no document upload, no CRM — intentionally kept minimal.

## Run

```bash
npm install
npm start          # http://localhost:3000
```

The SQLite DB (`data.db`) is created automatically on first run.

## First-time Admin setup (secure, no hard-coded password)

On the **first run**, before any admin exists:

1. The server console prints a one-time **setup code**, e.g.:
   ```
   FIRST-RUN SETUP: ... use this setup code: 405A35
   ```
2. Open **http://localhost:3000/setup** (all other pages redirect there).
3. Enter the setup code + your chosen **admin email/username** and **admin password**.

The setup code proves you own the server console; it regenerates each restart until an admin exists and is consumed after use. Passwords are stored **bcrypt-hashed**; session tokens are signed JWTs (random secret generated on first run, stored in the DB).

## Billing flow

- New customer registers → **trial** (1 day) → AI recommendations unlocked.
- After 1 day → status auto-changes to **expired** → recommendations return `ACCESS_LOCKED`.
- Customer opens **Payment page**: sees *Payment Method: EasyPaisa*, *Account Name*, *EasyPaisa Number* (placeholders editable by Admin), sends money, then submits **Transaction ID, Amount, Payment date** → status becomes **Payment Pending** (paid features stay locked).
- **Admin** approves (choosing subscription start/end dates) → customer becomes **Active** until the end date. On expiry the app auto-locks again. Admin can also reject payments, suspend/unsuspend, activate or extend accounts manually.

## Configuration
| Env var | Default | Purpose |
|---|---|---|
| `PORT` | `3000` | HTTP port |
| `COOKIE_SECURE` | off | Set `1` when serving over HTTPS |

EasyPaisa account name/number and monthly price are **not** env vars — change them anytime from **Admin Dashboard → Payment settings**.

## Project structure
```
server/index.js      Express app, auth, RBAC, API routes
server/db.js         SQLite schema + settings store
server/recommend.js  Rule-based AI matching engine (countries/unis/scholarships/scores)
public/index.html    SPA shell
public/app.js        Frontend (pages + router, vanilla JS)
public/style.css     Modern responsive styling
```

# WasteWise AI

> **Don't Throw It. Ask AI.**

WasteWise AI is an AI-powered circular-economy assistant that answers one question for an unwanted item:

> **"What is the best next action for this item?"**

It does not stop at waste *classification*. Its **Second-Life Engine** recommends a pathway —
REUSE → REPAIR → DONATE → REPURPOSE → RECYCLE → SAFE DISPOSAL — and only falls back to disposal
when reuse, repair, donation and repurposing are genuinely unsuitable.

**Runs entirely on your own laptop.** No Cloudflare account, no API keys, no cloud services.
Just Node.js and a local SQLite file.

---

## Quick start (2 commands)

```bash
npm install
npm start
```

Then open **<http://localhost:3000>** in your browser.

👉 New to this? Read **[START-HERE.md](START-HERE.md)** — a beginner-friendly,
click-by-click VS Code guide.

**Requirements:** Node.js 18+ (20 or 22 recommended).

---

## Everyone gets their own account

The app has **real user accounts**:

- **Create account** — name, email, password (8+ chars, confirm field)
- **Sign in / Sign out** — sessions last 30 days
- Passwords hashed with **scrypt** + per-user salt (never stored in plain text)
- Sessions are opaque random tokens in an httpOnly cookie
- **Per-user data isolation** — each account only ever sees its own history
- Two accounts on the same laptop never see each other's data

No email verification or password reset — this is a hackathon demo, deliberately kept simple.

---

## Test accounts

The database starts **empty** and is created automatically on first run
(`data/wastewise.db`). Sign up with any email you like — for example:

| Name | Email | Password |
|---|---|---|
| Alex Kumar | `alex@example.com` | `supersecret123` |
| Priya Sharma | `priya@example.com` | `mypassword456` |

Or just invent your own. To wipe everything and start fresh: `npm run reset-db`.

---

## The 8 screens

| Screen | Purpose |
|---|---|
| **Home** | Hero, tagline, both CTAs, the second-life ladder, Problem → Solution → Innovation |
| **Scan Item** | Image upload, drag & drop, describe-by-text, 6 demo sample items |
| **AI Analysis** | Detected item, waste category, visible condition, confidence ring, safety warning, 4 action cards |
| **Second-Life Engine** | 2–4 contextual questions per category; recommended pathway updates **live** |
| **Action Plan** | "Your best next step" — why / next steps / safety / alternative + record the outcome |
| **My Impact** | Stat cards, doughnut + bar charts, waste journey timeline, behaviour-based impact |
| **Campus Challenge** | Participation metrics, team leaderboard, challenge sign-up form |
| **History** | Every analysed item and recorded decision, with delete |

---

## Demo Mode (always works, offline)

DeMo Mode uses curated sample analyses so a presentation can never fail on a
network hiccup. Six demo items, each producing a **different** intelligent result:

| Demo item | Category | Typical outcome |
|---|---|---|
| **Old Laptop** | E-waste | Full Second-Life Engine flow → reuse / repair |
| **Plastic Bottle** | Plastic | Repurpose or recycle |
| **Old Clothes** | Textile | Reuse / donate, or repurpose if unwearable |
| **Broken Chair** | Furniture | Repair (solid wood is highly repairable) |
| **Phone Battery** | Batteries | Safety-first → authorised collection |
| **Old Phone** | E-waste | Reuse / donate / repair |

### The safety override

A genuine hazard answer — **damaged battery, swelling, leaks, exposed wiring,
burn marks, chemical smell** — forces **SAFE DISPOSAL** to the top and caps
every other pathway below it. The recommendation card shows
*"Safety override active"*.

Caution flags that are **not** disposal triggers (e.g. furniture splinters)
are handled separately, so a repairable chair is never sent to disposal.

---

## Waste categories supported

E-waste · Batteries · Plastic · Paper/Cardboard · Glass · Metal · Textile ·
Organic waste · Furniture · Appliances · Mixed/Unknown

---

## How the Second-Life Engine works

1. Each item has a **base signal profile** (how strong each pathway looks from the image).
2. Each category has its own **question bank** (electronics, textiles, furniture,
   batteries, plastic, glass, paper, organic, metal, generic).
3. Every answer applies **+/- weights** to the six pathways.
4. Scores are clamped 0–100, ranked, and the top pathway becomes the recommendation.
5. If a **hazard** answer was given, the safety override re-scores so disposal wins.
6. Confidence blends the item's detection confidence with the winning margin.

Because answers change the weights, the **same item gives different advice**
depending on the user's situation — which is the whole point.

---

## Responsible AI

- Every image-derived statement is labelled an **AI estimate**, never a physical inspection.
- The UI states plainly that hidden internal damage, exact material composition,
  true repairability and real-world recyclability **cannot** be determined from a photo.
- Impact is reported as **behaviour** ("You identified a second-life pathway for 11 of 12 items"),
  never invented kilograms or CO₂ figures.
- **No DIY instructions** for batteries, electrical wiring, chemicals, medicines,
  or hazardous materials — those route to authorised collection or professional guidance.
- Campus figures are explicitly labelled **demonstration data**.

---

## Data & privacy

Everything lives in one local file:

```
data/wastewise.db          # real SQLite database
```

Four tables: `users`, `sessions`, `waste_events`, `challenge_signups`.

- Passwords: **scrypt** hash + 16-byte random salt per user
- Login errors are deliberately vague ("Incorrect email or password") so the API
  never reveals whether an email is registered
- All history queries are scoped by `user_id` — enforced server-side, not in the UI
- Deleting a user cascades to their sessions and history
- `data/` is git-ignored, so databases never get committed

---

## API reference

### Auth

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/signup` | — | Create account → sets session cookie |
| `POST` | `/api/auth/login` | — | Sign in → sets session cookie |
| `POST` | `/api/auth/logout` | — | Destroy session |
| `GET` | `/api/auth/me` | — | Current user, or `{ user: null }` |

### Analysis (public)

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/health` | Service + mode status |
| `GET` | `/api/demo-items` | 6 demo items + 11 categories |
| `GET` | `/api/categories` | Waste category list |
| `POST` | `/api/analyze` | `{ itemId }` or `{ fileName }` → detection result |
| `POST` | `/api/recommend` | `{ itemId, answers }` → pathway + scores + reasoning |
| `GET` | `/api/items/:id` | Full analysis profile for one item |
| `GET` | `/api/campus` | Campus challenge metrics |

### User data (requires sign-in)

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/history` | This account's waste history |
| `POST` | `/api/history` | Save an event |
| `DELETE` | `/api/history/:id` | Delete one event |
| `DELETE` | `/api/history` | Clear this account's history |
| `GET` | `/api/history/count` | Count for this account |
| `POST` | `/api/challenge` | Register a Campus Circularity Challenge |

**Example:**
```bash
curl -X POST http://localhost:3000/api/recommend \
  -H 'Content-Type: application/json' \
  -d '{"itemId":"laptop","answers":{"power":"yes","repair_ok":"yes","other_user":"yes","hazard":"no"}}'
# → pathway: "reuse"
```

---

## Project structure

```
wastewise-ai/
├── server/
│   ├── index.mjs       # Hono app: auth, API routes, static + SPA serving
│   ├── db.mjs          # SQLite schema & queries (better-sqlite3)
│   ├── auth.mjs        # scrypt hashing, sessions, validation
│   ├── wastewise.mjs   # Categories, demo dataset, question banks, engines
│   └── reset.mjs       # `npm run reset-db`
├── public/
│   ├── index.html      # App shell + auth screen container
│   └── static/
│       ├── app.js      # SPA router, auth UI, screens, charts, engine
│       ├── styles.css  # Design system, light/dark themes
│       └── favicon.svg
├── data/               # SQLite database (auto-created, git-ignored)
├── START-HERE.md       # Beginner VS Code setup guide
├── README.md
└── package.json
```

---

## Tech stack

- **Node.js** + **Hono** (served via `@hono/node-server`)
- **better-sqlite3** — local SQLite, no database server needed
- **Node `crypto.scryptSync`** — password hashing, zero auth dependencies
- **Vanilla JavaScript** SPA (no framework, no build step)
- **Chart.js**, **Font Awesome**, **Plus Jakarta Sans / Inter** via CDN

No bundler, no transpiler, no Cloudflare. Edit a file, refresh the browser.

---

## Commands

| Command | Description |
|---|---|
| `npm install` | Install dependencies (once) |
| `npm start` | Run at <http://localhost:3000> |
| `npm run dev` | Run with auto-restart on file changes |
| `npm run reset-db` | Delete the database (wipes accounts + history) |

Run on a different port:

```bash
PORT=3001 npm start            # macOS / Linux
$env:PORT=3001; npm start      # Windows PowerShell
```

---

## Optional: real vision API

Demo Mode is the default so the app always works offline. To wire in a real
vision model, edit `POST /api/analyze` in `server/index.mjs` to call your
provider when an API key is present, and fall back to `analyze()` when it isn't:

```js
// sketch — server-side only, never in the browser
const key = process.env.OPENAI_API_KEY
if (key && body.imageBase64) {
  const ai = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ /* vision request */ }),
  })
  // …map the response onto the same shape `analyze()` returns
}
return c.json(analyze({ itemId: body.itemId, fileName: body.fileName }))
```

Keep the API key in `process.env` (or a `.env` file that is git-ignored) — never
in `public/static/app.js`, which the browser can read.

---

## Features not yet implemented / next steps

- Real vision-API integration behind the existing `/api/analyze` contract
- Password reset / email verification
- Map integration for nearby repair cafés, donation centres, e-waste drop-offs
- True multi-tenant campus aggregation (leaderboard is demo data today)
- CSV / PDF export of personal impact and printable action plans
- Region-aware recycling rules from a verified database

---

## Status

- **Platform:** Local Node.js (no cloud dependency)
- **Verified:** 47/47 end-to-end checks passing — signup, validation, session,
  login, logout, per-user isolation, scan → analysis → questions → plan →
  save → impact → campus → history delete → dark mode
- **Last updated:** 2026-10-15

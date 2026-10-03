# WasteWise AI

> **Don't Throw It. Ask AI.**

WasteWise AI is an AI-powered circular-economy assistant that answers one question for an unwanted item:

> **"What is the best next action for this item?"**

It does not stop at waste *classification*. Its **Second-Life Engine** recommends a pathway —
REUSE → REPAIR → DONATE → REPURPOSE → RECYCLE → SAFE DISPOSAL — and only falls back to disposal
when reuse, repair, donation and repurposing are genuinely unsuitable.

---

## Live Preview

- **Sandbox preview**: `https://3000-<sandbox-id>.sandbox.novita.ai`
- **Health check**: `/api/health`
- **Local dev**: `http://localhost:3000`

## Public URLs

| Route | Purpose |
|-------|---------|
| `/` | Home / landing dashboard |
| `#/scan` | Scan Item (upload, drag & drop, describe, demo samples) |
| `#/analysis` | AI Analysis (detected item, category, condition, confidence, safety) |
| `#/secondlife` | Second-Life Engine (contextual questions + live pathway) |
| `#/plan` | Action Plan (recommended action, why, next steps, safety, alternative) |
| `#/impact` | My Impact dashboard (charts + behaviour-based impact) |
| `#/campus` | WasteWise Campus Challenge (community + leaderboard) |
| `#/history` | Full waste history with delete |

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/health` | Service + mode status |
| `GET` | `/api/demo-items` | 6 demo items + 11 waste categories |
| `GET` | `/api/categories` | Waste category list |
| `POST` | `/api/analyze` | Analyse by `itemId` or `fileName` → detection result |
| `POST` | `/api/recommend` | Second-Life Engine: `itemId` + `answers` → pathway + scores |
| `GET` | `/api/items/:id` | Full analysis profile for an item |
| `GET` | `/api/history` | Waste history (D1) |
| `POST` | `/api/history` | Save a waste event (D1) |
| `DELETE` | `/api/history/:id` | Delete a waste event (D1) |
| `GET` | `/api/campus` | Campus challenge demo metrics |
| `POST` | `/api/challenge` | Register a Campus Circularity Challenge (D1) |

**Example — dynamic recommendation:**
```bash
curl -X POST http://localhost:3000/api/recommend \
  -H 'Content-Type: application/json' \
  -d '{"itemId":"laptop","answers":{"power":"yes","repair_ok":"yes","other_user":"yes","hazard":"no"}}'
# → pathway: "reuse"
```

## Currently Completed Features

- **Full 6-screen MVP** with working hash-based SPA navigation (`Home → Scan → Analysis → Second-Life → Plan → Impact`), plus History.
- **Second-Life Engine** — item-specific contextual question banks (electronics, textiles, furniture, batteries, plastic, glass, paper, organic, metal, generic) that dynamically re-score the pathway. Live ladder + live score bars update without a page reload.
- **Safety override** — a genuine hazard answer (damaged battery, leaks, swelling, exposed wiring) forces SAFE DISPOSAL to the top and caps every other pathway below it.
- **Demo Mode** — 6 curated demo items (Old Laptop, Plastic Bottle, Old Clothes, Broken Chair, Phone Battery, Old Phone), each producing a different intelligent recommendation. Works with **zero external APIs**.
- **Upload + drag & drop** with local file preview, plus keyword-based description matching.
- **Action recording** — Mark as Reused / Repaired / Donated / Repurposed / Recycled / authorised collection → persisted to `localStorage` **and** Cloudflare D1.
- **My Impact dashboard** — stat cards, doughnut + horizontal bar charts (Chart.js), waste-journey timeline, behaviour-based impact statement.
- **WasteWise Campus Challenge** — participation metrics, team leaderboard, polar-area chart, challenge sign-up form.
- **Dark / light mode** with persistence, mobile-responsive sidebar, toasts, and micro-interactions.
- **Responsible-AI language throughout** — "Based on the image…", "AI estimate…", "Visible condition…", "Verify locally…". No DIY instructions for batteries, wiring, chemicals or hazardous materials.

## Waste Categories Supported

E-waste · Batteries · Plastic · Paper/Cardboard · Glass · Metal · Textile · Organic waste · Furniture · Appliances · Mixed/Unknown

## Data Architecture

- **Data models**: `waste_events` (item label, category, pathway, action, confidence, answers, created_at) and `challenge_signups` (org, contact, goal).
- **Storage services**:
  - **Cloudflare D1** (`DB` binding) — persistent waste history + challenge sign-ups (production source of truth).
  - **Browser localStorage** — instant offline-safe mirror so history survives navigation and refresh.
- **Data flow**: UI action → `localStorage` (immediate) → `POST /api/history` → D1 → merged back on load.
- **Seed data**: 12 demo history records + campus demo metrics, clearly labelled as demonstration data.

## User Guide

1. Open the app and click **Scan an Item** (or **Describe an Item**).
2. Upload a photo, drag & drop, type a description, or pick a **demo item**.
3. Click **Analyze with AI** to see the detected item, category, visible condition (AI estimate) and safety notes.
4. Continue to the **Second-Life Engine** and answer the contextual questions — the recommended pathway updates live.
5. Click **Generate my action plan** to see "Your best next step", why it was chosen, next steps, safety considerations and an alternative.
6. Mark the outcome (Reused / Repaired / Donated / Recycled) to save it to your history.
7. Open **My Impact** to see your dashboard, or **Campus Challenge** to view the community leaderboard.
8. Use the **moon / sun** icon to toggle dark mode.

## Responsible AI Notes

- Image analysis is an **AI estimate**, never a physical inspection.
- Hidden internal damage, exact material composition, true repairability and local recyclability **cannot** be determined from an image.
- Impact is reported as **behaviour** ("You identified a second-life pathway for 11 of 12 items") — never invented kilogram or CO₂ figures.
- Campus figures are explicitly labelled **demonstration data**.

## Tech Stack

- **Hono** (edge web framework) on **Cloudflare Pages**
- **Vite** build, TypeScript entry with JSX renderer
- Vanilla-JS SPA frontend (no framework) served from `/static`
- **Chart.js** + **Font Awesome** + **Plus Jakarta Sans / Inter** via CDN
- **Cloudflare D1** for persistence

## Project Structure

```
webapp/
├── src/
│   ├── index.tsx                # Hono app: page shell, API routes, static, SPA fallback
│   └── lib/wastewise.js         # Categories, demo dataset, question banks, engines
├── public/
│   ├── favicon.svg
│   └── static/
│       ├── app.js               # SPA router, views, Second-Life Engine, charts
│       ├── styles.css           # Design system, light/dark themes
│       └── favicon.svg
├── migrations/0001_initial_schema.sql
├── ecosystem.config.cjs         # PM2 (auto-detects configured D1)
├── wrangler.jsonc
└── package.json
```

## Deployment

- **Platform**: Cloudflare Pages
- **Status**: Running locally (sandbox preview active)
- **Build**: `npm run build` → `dist/_worker.js` (~54 kB, ~20 kB gzipped)
- **Deploy**: `npm run deploy` (see the Deploy panel for the connected Cloudflare account)
- **D1 migrations**: `npm run db:migrate:local` (local) / `npm run db:migrate:prod` (production)
- **Last Updated**: 2026-10-03

## Features Not Yet Implemented / Next Steps

- Real vision-API integration (OpenAI / Gemini) behind the same `/api/analyze` contract; Demo Mode stays as the fallback.
- Simple auth so history is per-user rather than per-browser.
- Map integration for nearby repair cafés, donation centres and authorised e-waste/battery drop-offs.
- Campus challenge backend (real per-team aggregation instead of demo metrics).
- CSV/PDF export of personal impact and printable action plans.
- Material-composition disclaimers driven by a verified recycling database per region.

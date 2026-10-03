import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { serveStatic } from 'hono/cloudflare-workers'
import {
  analyze,
  recommend,
  DEMO_ITEMS,
  CATEGORIES,
  CAMPUS_DEMO,
  campusData,
  findItem,
} from './lib/wastewise.js'

type Bindings = {
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

app.use('*', logger())
app.use('/api/*', cors())

/* ------------------------------------------------------------------ *
 * Page shell — single-page app served from any route
 * ------------------------------------------------------------------ */

let SHELL_CACHE: string | null = null

function shell(): string {
  if (SHELL_CACHE) return SHELL_CACHE
  SHELL_CACHE = `<!doctype html>
<html lang="en" data-theme="light">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>WasteWise AI — Don't Throw It. Ask AI.</title>
<meta name="description" content="WasteWise AI recommends the best next life for an unwanted item — reuse, repair, donate, repurpose, recycle or safe disposal." />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.5.2/css/all.min.css" />
<link rel="stylesheet" href="/static/styles.css" />
<script>
  try {
    var t = localStorage.getItem('ww-theme');
    if (t) document.documentElement.setAttribute('data-theme', t);
  } catch (e) {}
</script>
</head>
<body>
<div class="app-shell">
  <aside class="sidebar" id="sidebar">
    <a class="brand" href="#/" aria-label="WasteWise AI home">
      <span class="brand-mark"><i class="fas fa-recycle"></i></span>
      <span class="brand-text">
        <strong>WasteWise<span class="brand-ai">AI</span></strong>
        <small>Don't Throw It. Ask AI.</small>
      </span>
    </a>

    <nav class="nav" aria-label="Main navigation">
      <a class="nav-item" data-nav="home" href="#/"><i class="fas fa-house"></i><span>Home</span></a>
      <a class="nav-item" data-nav="scan" href="#/scan"><i class="fas fa-camera-retro"></i><span>Scan Item</span></a>
      <a class="nav-item" data-nav="impact" href="#/impact"><i class="fas fa-chart-pie"></i><span>My Impact</span></a>
      <a class="nav-item" data-nav="campus" href="#/campus"><i class="fas fa-people-group"></i><span>Campus Challenge</span></a>
      <a class="nav-item" data-nav="history" href="#/history"><i class="fas fa-clock-rotate-left"></i><span>History</span></a>
    </nav>

    <div class="sidebar-foot">
      <div class="demo-pill"><span class="dot"></span> Demo Mode active</div>
      <button class="btn btn-ghost btn-block" id="sidebar-demo-seed" type="button">
        <i class="fas fa-wand-magic-sparkles"></i> Load demo history
      </button>
    </div>
  </aside>

  <div class="main-col">
    <header class="topbar">
      <button class="icon-btn menu-btn" id="menu-btn" type="button" aria-label="Toggle navigation">
        <i class="fas fa-bars"></i>
      </button>
      <div class="topbar-title">
        <span class="crumb" id="crumb">Home</span>
      </div>
      <div class="topbar-actions">
        <button class="icon-btn" id="theme-btn" type="button" aria-label="Toggle dark mode" title="Toggle dark / light mode">
          <i class="fas fa-moon"></i>
        </button>
        <a class="btn btn-primary btn-sm" href="#/scan"><i class="fas fa-camera-retro"></i> Scan an Item</a>
        <div class="profile" title="Demo profile">
          <span class="avatar">EX</span>
          <span class="profile-meta">
            <strong>Eco Explorer</strong>
            <small>Demo student profile</small>
          </span>
        </div>
      </div>
    </header>

    <main id="view" class="view" aria-live="polite">
      <div class="loading-screen">
        <div class="spinner"></div>
        <p>Loading WasteWise AI…</p>
      </div>
    </main>

    <footer class="app-footer">
      <span><i class="fas fa-brain"></i> WasteWise AI — responsible AI guidance. Estimates based on images and your answers, not physical inspection.</span>
      <span class="foot-links">
        <a href="#/impact">My Impact</a>
        <a href="#/campus">Campus</a>
        <a href="#/history">History</a>
      </span>
    </footer>
  </div>
</div>

<div class="toast-wrap" id="toast-wrap" aria-live="polite"></div>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.3/dist/chart.umd.min.js"></script>
<script src="/static/app.js"></script>
</body>
</html>`
  return SHELL_CACHE
}

/* ------------------------------------------------------------------ *
 * API routes
 * ------------------------------------------------------------------ */

app.get('/api/health', (c) =>
  c.json({ ok: true, service: 'wastewise-ai', mode: 'demo', items: DEMO_ITEMS.length })
)

app.get('/api/demo-items', (c) =>
  c.json({
    ok: true,
    mode: 'demo',
    items: DEMO_ITEMS.map((i) => ({
      id: i.id,
      label: i.label,
      sampleIcon: i.sampleIcon,
      category: i.category,
      detectedItem: i.detectedItem,
    })),
    categories: CATEGORIES,
    notice: 'Demo Mode uses curated sample analyses so the product always works without an external vision API.',
  })
)

app.get('/api/categories', (c) => c.json({ ok: true, categories: CATEGORIES }))

app.post('/api/analyze', async (c) => {
  let body: any = {}
  try {
    body = await c.req.json()
  } catch {
    body = {}
  }
  const result = analyze({
    itemId: body.itemId,
    fileName: body.fileName,
    source: body.source,
  })
  return c.json(result)
})

app.post('/api/recommend', async (c) => {
  let body: any = {}
  try {
    body = await c.req.json()
  } catch {
    body = {}
  }
  return c.json(recommend({ itemId: body.itemId, answers: body.answers || {}, signals: body.signals }))
})

app.get('/api/campus', (c) => c.json({ ok: true, data: campusData() }))

/* ------------------------------------------------------------------ *
 * D1 — waste history persistence
 * ------------------------------------------------------------------ */

let schemaReady = false

async function ensureSchema(db: D1Database) {
  if (schemaReady) return
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS waste_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        item_label TEXT NOT NULL,
        category TEXT,
        pathway TEXT,
        action TEXT,
        confidence INTEGER,
        mode TEXT DEFAULT 'demo',
        answers TEXT,
        created_at TEXT DEFAULT (datetime('now'))
      )`
    )
    .run()
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS challenge_signups (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        org TEXT NOT NULL,
        contact TEXT,
        goal INTEGER,
        created_at TEXT DEFAULT (datetime('now'))
      )`
    )
    .run()
  schemaReady = true
}

app.get('/api/history', async (c) => {
  try {
    await ensureSchema(c.env.DB)
    const { results } = await c.env.DB.prepare(
      `SELECT * FROM waste_events ORDER BY id DESC LIMIT 200`
    ).all()
    return c.json({ ok: true, source: 'd1', events: results })
  } catch (err: any) {
    return c.json({ ok: false, source: 'd1', error: String(err?.message || err), events: [] })
  }
})

app.post('/api/history', async (c) => {
  try {
    const body = await c.req.json()
    await ensureSchema(c.env.DB)
    const res = await c.env.DB.prepare(
      `INSERT INTO waste_events (item_label, category, pathway, action, confidence, mode, answers)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        body.itemLabel || 'Unknown item',
        body.category || 'Mixed/Unknown',
        body.pathway || null,
        body.action || 'Analysed',
        body.confidence ?? null,
        body.mode || 'demo',
        body.answers ? JSON.stringify(body.answers) : null
      )
      .run()
    return c.json({ ok: true, id: res.meta?.last_row_id ?? null })
  } catch (err: any) {
    return c.json({ ok: false, error: String(err?.message || err) })
  }
})

app.delete('/api/history/:id', async (c) => {
  try {
    await ensureSchema(c.env.DB)
    await c.env.DB.prepare(`DELETE FROM waste_events WHERE id = ?`).bind(c.req.param('id')).run()
    return c.json({ ok: true })
  } catch (err: any) {
    return c.json({ ok: false, error: String(err?.message || err) })
  }
})

app.post('/api/history/seed', async (c) => {
  try {
    await ensureSchema(c.env.DB)
    return c.json({ ok: true, note: 'Client-side demo seed handled in the app.' })
  } catch (err: any) {
    return c.json({ ok: false, error: String(err?.message || err) })
  }
})

app.post('/api/challenge', async (c) => {
  try {
    const body = await c.req.json()
    await ensureSchema(c.env.DB)
    const res = await c.env.DB.prepare(
      `INSERT INTO challenge_signups (org, contact, goal) VALUES (?, ?, ?)`
    )
      .bind(body.org || 'WasteWise Campus', body.contact || null, body.goal ?? 500)
      .run()
    return c.json({ ok: true, id: res.meta?.last_row_id ?? null })
  } catch (err: any) {
    return c.json({ ok: false, error: String(err?.message || err) })
  }
})

/* Question bank for a specific item (used for re-hydration) */
app.get('/api/items/:id', (c) => {
  const item = findItem(c.req.param('id'))
  if (!item) return c.json({ ok: false, error: 'not found' }, 404)
  return c.json({ ok: true, item: analyze({ itemId: item.id }) })
})

/* ------------------------------------------------------------------ *
 * Static assets + SPA fallback
 * ------------------------------------------------------------------ */

app.use('/static/*', serveStatic({ root: './public' }))
app.get('/favicon.ico', (c) => c.redirect('/static/favicon.svg', 302))

app.get('*', (c) => c.html(shell()))

export default app

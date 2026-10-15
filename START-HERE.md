# 🚀 START HERE — Run WasteWise AI on your laptop

This project runs **100% on your own computer**. No Cloudflare account, no API keys,
no internet required beyond the first `npm install`.

You need **Node.js 18 or newer** (20 or 22 recommended).

---

## Step 1 — Install Node.js (skip if you already have it)

Check what you have. Open a terminal (VS Code: **Terminal → New Terminal**) and type:

```bash
node -v
```

If it prints `v18.x`, `v20.x`, `v22.x` or higher → **you're ready, skip to Step 2.**

If it says "command not found":

1. Go to <https://nodejs.org>
2. Download the **LTS** installer (Windows `.msi` / macOS `.pkg`)
3. Install it with all default options
4. **Close and reopen VS Code**, then run `node -v` again

---

## Step 2 — Open the project in VS Code

1. Unzip the project folder somewhere easy, e.g. `Documents/wastewise-ai`
2. Open VS Code → **File → Open Folder…** → select that folder
3. Open a terminal: **Terminal → New Terminal**
   (the terminal should already be inside your project folder)

---

## Step 3 — Install dependencies (one time only)

```bash
npm install
```

This downloads Express-like server bits + the SQLite database driver.
Takes about 10–30 seconds. You only ever do this once.

> **Note:** the SQLite driver is a native module. If `npm install` prints
> errors on Windows, install free "Desktop development with C++" from
> [Visual Studio Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/)
> and run `npm install` again.

---

## Step 4 — Start the app

```bash
npm start
```

You'll see this in the terminal:

```
  ▲ WasteWise AI is running

  Open in your browser:  http://localhost:3000
  Database file:         /path/to/wastewise-ai/data/wastewise.db
  Press Ctrl+C to stop.
```

---

## Step 5 — Open it in your browser

**Ctrl + click** the `http://localhost:3000` link in the VS Code terminal
(or paste it into Chrome / Edge / Firefox / Safari).

You'll land on the **Create account** screen. 🎉

---

## Step 6 — Create your account and use it

1. Enter your **name**, **email** and a **password** (8+ characters)
2. Click **Create my account** — you're signed in instantly
3. Click **Scan Item** in the sidebar
4. Click the **Old Laptop** sample → **Analyze with AI**
5. Answer the 4 questions → **Generate my action plan**
6. Click **Mark as Reused** to save it
7. Open **My Impact** to see your dashboard

Every person who opens the app can create their own account, and **each
account only sees its own history**.

---

## What each command does

| Command | What it does |
|---|---|
| `npm start` | Starts the app on <http://localhost:3000> |
| `npm run dev` | Same, but **auto-restarts** every time you save a file |
| `npm run reset-db` | Deletes the database — wipes all accounts & history |

To stop the app: click the terminal and press **Ctrl + C**.

---

## Where is my data stored?

Everything lives in one file inside the project:

```
data/wastewise.db
```

That's a real SQLite database. Passwords are stored as **scrypt hashes**
(never plain text). Delete that file (or run `npm run reset-db`) to start fresh.

Because it's a file, you can **copy the project to another laptop** and your
accounts + history come with it.

---

## Troubleshooting

**"Port 3000 is already in use"**
Something else is using port 3000. Either close it, or start on another port:

```bash
# macOS / Linux
PORT=3001 npm start

# Windows PowerShell
$env:PORT=3001; npm start
```
Then open <http://localhost:3001>.

**"npm: command not found"**
Node.js isn't installed, or you didn't reopen VS Code after installing it.
Redo Step 1.

**The page is blank or says "Loading WasteWise AI…" forever**
Open the browser console (`F12` → Console tab) and check for errors.
Make sure the terminal running `npm start` is still open and shows no red text.

**"Cannot find module 'better-sqlite3'"**
Run `npm install` again from inside the project folder.

**I deleted/corrupted the database**
Run `npm run reset-db`, then `npm start`. A fresh database is created
automatically — you'll just need to sign up again.

---

## Sharing it on your local network (optional)

Want a friend on the same Wi‑Fi to try it? Start the app, then find your
laptop's local IP (e.g. `192.168.1.20`) and have them open
`http://192.168.1.20:3000`. The server already listens on all interfaces.

---

## Optional: turn on real AI image analysis

By default the app uses **Demo Mode** (curated sample analyses) so it always
works offline — perfect for a hackathon demo.

To use a real vision model, set an API key before starting:

```bash
# macOS / Linux
OPENAI_API_KEY=sk-... npm start
```

See `README.md` → "Optional: real vision API" for how to wire it in.

Enjoy, and don't throw it — ask AI. ♻️

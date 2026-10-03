-- WasteWise AI — initial schema
-- Waste events recorded by users (persistent waste history) and
-- Campus Circularity Challenge sign-ups.

CREATE TABLE IF NOT EXISTS waste_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  item_label TEXT NOT NULL,
  category TEXT,
  pathway TEXT,
  action TEXT,
  confidence INTEGER,
  mode TEXT DEFAULT 'demo',
  answers TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_waste_events_created ON waste_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_waste_events_pathway ON waste_events(pathway);

CREATE TABLE IF NOT EXISTS challenge_signups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  org TEXT NOT NULL,
  contact TEXT,
  goal INTEGER,
  created_at TEXT DEFAULT (datetime('now'))
);

import { mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import Database from 'better-sqlite3'

let db: Database.Database | undefined

const SCHEMA = `
CREATE TABLE IF NOT EXISTS songs (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  genre TEXT NOT NULL,
  UNIQUE (title, artist)
);

CREATE TABLE IF NOT EXISTS profiles (
  id INTEGER PRIMARY KEY,
  nickname TEXT NOT NULL,
  nickname_key TEXT NOT NULL UNIQUE,
  is_sample INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS ranking_entries (
  profile_id INTEGER NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  position INTEGER NOT NULL CHECK (position BETWEEN 1 AND 10),
  song_id INTEGER NOT NULL REFERENCES songs(id),
  PRIMARY KEY (profile_id, position),
  UNIQUE (profile_id, song_id)
);
`

/** Conexão única com o SQLite. O caminho pode ser trocado pela variável `DB_PATH`. */
export function useDb(): Database.Database {
  if (db) return db
  const path = resolve(process.env.DB_PATH || '.data/app.db')
  mkdirSync(dirname(path), { recursive: true })
  db = new Database(path)
  db.pragma('foreign_keys = ON')
  db.pragma('journal_mode = WAL')
  db.exec(SCHEMA)
  return db
}

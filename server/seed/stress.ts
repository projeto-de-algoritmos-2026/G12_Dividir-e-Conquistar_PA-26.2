/**
 * npm run seed:stress — cria 1.000 perfis de exemplo extras (stress_0001…) e mede quanto tempo
 * leva calcular semelhantes + recomendações para um perfil contra todos eles.
 *
 * Rode depois de subir o servidor ao menos uma vez (para o catálogo já estar no banco).
 */
import { resolve } from 'node:path'
import Database from 'better-sqlite3'
import { recommend, TOP_SOURCES } from '../../shared/algorithms/recommend'
import { rankSimilar } from '../../shared/algorithms/similarity'

const TOTAL = 1000
const db = new Database(resolve(process.env.DB_PATH || '.data/app.db'))
db.pragma('foreign_keys = ON')

const songs = db.prepare('SELECT id, genre FROM songs').all() as { id: number; genre: string }[]
if (songs.length === 0) {
  console.error('Catálogo vazio: rode `npm run dev` uma vez para criar o banco e o seed.')
  process.exit(1)
}

const byGenre = new Map<string, number[]>()
for (const s of songs) byGenre.set(s.genre, [...(byGenre.get(s.genre) ?? []), s.id])
const genres = [...byGenre.keys()]
const pickOne = <T>(xs: readonly T[]) => xs[Math.floor(Math.random() * xs.length)]!

/** 10 músicas distintas: ~8 de um gênero principal e o resto de outro. */
function randomRanking(): number[] {
  const main = byGenre.get(pickOne(genres))!
  const extra = byGenre.get(pickOne(genres))!
  const chosen = new Set<number>()
  while (chosen.size < 8) chosen.add(pickOne(main))
  while (chosen.size < 10) chosen.add(pickOne(extra))
  return [...chosen].sort(() => Math.random() - 0.5)
}

const insertProfile = db.prepare(
  `INSERT OR IGNORE INTO profiles (nickname, nickname_key, is_sample, created_at, updated_at)
   VALUES (?, ?, 1, ?, ?)`,
)
const getId = db.prepare('SELECT id FROM profiles WHERE nickname_key = ?')
const clear = db.prepare('DELETE FROM ranking_entries WHERE profile_id = ?')
const insertEntry = db.prepare('INSERT INTO ranking_entries (profile_id, position, song_id) VALUES (?, ?, ?)')

db.transaction(() => {
  const now = new Date().toISOString()
  for (let n = 1; n <= TOTAL; n++) {
    const nickname = `stress_${String(n).padStart(4, '0')}`
    insertProfile.run(nickname, nickname, now, now)
    const { id } = getId.get(nickname) as { id: number }
    clear.run(id)
    randomRanking().forEach((songId, i) => insertEntry.run(id, i + 1, songId))
  }
})()

const { n } = db.prepare('SELECT COUNT(DISTINCT profile_id) AS n FROM ranking_entries').get() as { n: number }
console.log(`${TOTAL} perfis de estresse prontos (${n} perfis com ranking no total)`)

// mede o mesmo cálculo das rotas /api/me/similar e /api/me/recommendations
const start = performance.now()
const rows = db
  .prepare('SELECT profile_id, song_id FROM ranking_entries ORDER BY profile_id, position')
  .all() as { profile_id: number; song_id: number }[]
const rankings = new Map<number, number[]>()
for (const r of rows) rankings.set(r.profile_id, [...(rankings.get(r.profile_id) ?? []), r.song_id])
const others = [...rankings].map(([id, ranking]) => ({ key: String(id), ranking }))
const mine = randomRanking()
const similar = rankSimilar(mine, others)
const recs = recommend(mine, similar.slice(0, TOP_SOURCES))
const ms = performance.now() - start

console.log(
  `Semelhantes + recomendações contra ${others.length} perfis: ${ms.toFixed(1)} ms ` +
    `(${similar.length} comparáveis, ${recs.length} recomendações)`,
)
if (ms > 2000) console.warn('Atenção: passou de 2 s')

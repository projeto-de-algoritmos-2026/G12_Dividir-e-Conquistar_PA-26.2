import songs from '../seed/songs.json'
import profiles from '../seed/profiles.json'

interface SeedSong { title: string; artist: string; genre: string }
interface SeedProfile { nickname: string; ranking: { title: string; artist: string }[] }

/** Cria o esquema e, se o catálogo estiver vazio, carrega músicas e perfis de exemplo. */
export default defineNitroPlugin(() => {
  const db = useDb()
  const { n } = db.prepare('SELECT COUNT(*) AS n FROM songs').get() as { n: number }
  if (n > 0) return

  const insertSong = db.prepare('INSERT INTO songs (title, artist, genre) VALUES (?, ?, ?)')
  const insertProfile = db.prepare(
    `INSERT INTO profiles (nickname, nickname_key, is_sample, created_at, updated_at)
     VALUES (?, ?, 1, ?, ?)`,
  )
  const insertEntry = db.prepare(
    'INSERT INTO ranking_entries (profile_id, position, song_id) VALUES (?, ?, ?)',
  )

  db.transaction(() => {
    const ids = new Map<string, number>()
    for (const s of songs as SeedSong[]) {
      const { lastInsertRowid } = insertSong.run(s.title, s.artist, s.genre)
      ids.set(`${s.title}|${s.artist}`, Number(lastInsertRowid))
    }
    const now = new Date().toISOString()
    for (const p of profiles as SeedProfile[]) {
      const { lastInsertRowid } = insertProfile.run(p.nickname, p.nickname.toLowerCase(), now, now)
      p.ranking.forEach((r, i) => {
        const songId = ids.get(`${r.title}|${r.artist}`)
        if (songId === undefined) {
          throw new Error(`Seed: o perfil "${p.nickname}" usa uma música fora do catálogo: ${r.title} — ${r.artist}`)
        }
        insertEntry.run(lastInsertRowid, i + 1, songId)
      })
    }
  })()

  console.info(`[seed] ${songs.length} músicas e ${profiles.length} perfis de exemplo carregados`)
})

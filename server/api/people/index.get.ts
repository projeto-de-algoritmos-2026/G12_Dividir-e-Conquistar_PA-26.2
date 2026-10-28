import type { PeopleResponse } from '#shared/types'

const PAGE_SIZE = 30

interface Row {
  id: number
  nickname: string
  is_sample: number
  song_id: number
  title: string
  artist: string
  genre: string
}

/** Perfis com ranking, em ordem alfabética, com busca por apelido e paginação. */
export default defineEventHandler((event): PeopleResponse => {
  const me = requireProfile(event)
  const query = getQuery(event)
  const q = String(query.q ?? '').trim().toLowerCase()
  const requested = Number.parseInt(String(query.page ?? '1'), 10)

  // `_` é válido em apelidos: escapa os curingas do LIKE para buscar o texto literal
  const like = `%${q.replace(/[\\%_]/g, (c) => `\\${c}`)}%`
  // o JOIN com a posição 1 traz a favorita e já exclui perfis sem ranking
  const joins = `FROM profiles p
    JOIN ranking_entries r ON r.profile_id = p.id AND r.position = 1`
  const where = `WHERE p.nickname_key LIKE ? ESCAPE '\\'`

  const db = useDb()
  const { total } = db.prepare(`SELECT COUNT(*) AS total ${joins} ${where}`).get(like) as { total: number }
  const pageCount = Math.ceil(total / PAGE_SIZE)
  const page = Math.min(Math.max(Number.isFinite(requested) ? requested : 1, 1), Math.max(pageCount, 1))

  const rows = db
    .prepare(
      `SELECT p.id, p.nickname, p.is_sample, s.id AS song_id, s.title, s.artist, s.genre
       ${joins}
       JOIN songs s ON s.id = r.song_id
       ${where}
       ORDER BY p.nickname_key LIMIT ? OFFSET ?`,
    )
    .all(like, PAGE_SIZE, (page - 1) * PAGE_SIZE) as Row[]

  return {
    items: rows.map((r) => ({
      nickname: r.nickname,
      isSample: Boolean(r.is_sample),
      isMe: r.id === me.id,
      favorite: { id: r.song_id, title: r.title, artist: r.artist, genre: r.genre },
    })),
    page,
    pageSize: PAGE_SIZE,
    pageCount,
    total,
  }
})

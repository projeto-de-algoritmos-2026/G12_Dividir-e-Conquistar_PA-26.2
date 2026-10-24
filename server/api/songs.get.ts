import type { Song, SongsResponse } from '#shared/types'

/** Remove acentos e maiúsculas para a busca: "aguas" encontra "Águas de Março". */
const normalize = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()

/** Busca no catálogo por título ou artista, com filtro opcional de gênero. */
export default defineEventHandler((event): SongsResponse => {
  const query = getQuery(event)
  const q = normalize(String(query.q ?? '').trim())
  const genre = String(query.genre ?? '').trim()
  const limit = Math.min(Math.max(Number.parseInt(String(query.limit ?? '50'), 10) || 50, 1), 100)

  // o catálogo é fixo e pequeno (~300 músicas): filtrar em memória é simples e rápido
  const all = useDb()
    .prepare('SELECT id, title, artist, genre FROM songs ORDER BY title COLLATE NOCASE')
    .all() as Song[]

  const items = all
    .filter((s) => !genre || s.genre === genre)
    .filter((s) => !q || normalize(s.title).includes(q) || normalize(s.artist).includes(q))
    .slice(0, limit)
  const genres = [...new Set(all.map((s) => s.genre))].sort((a, b) => a.localeCompare(b, 'pt-BR'))

  return { items, genres }
})

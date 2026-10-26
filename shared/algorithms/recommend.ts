import type { Ranking } from './similarity'

export const TOP_SOURCES = 5

export interface RecommendSource {
  key: string
  similarity: number
  ranking: Ranking
}

export interface RecommendedSong {
  songId: number
  score: number
  sources: Array<{ key: string; similarity: number; position: number }>
}

/**
 * Recomenda músicas que não estão em `mine` a partir das pessoas mais semelhantes.
 *
 * Cada música no ranking de uma origem vale `similarity × (11 − posição)`: quanto mais parecida
 * a pessoa e mais alto a música no ranking dela, mais pontos. Músicas que aparecem em várias
 * origens somam os pontos. Ordena por pontuação desc e, no empate, por songId asc.
 */
export function recommend(
  mine: Ranking,
  topSimilar: readonly RecommendSource[],
  limit = 10,
): RecommendedSong[] {
  const own = new Set(mine)
  const bySong = new Map<number, RecommendedSong>()

  for (const source of topSimilar.slice(0, TOP_SOURCES)) {
    source.ranking.forEach((songId, i) => {
      if (own.has(songId)) return
      const position = i + 1
      let rec = bySong.get(songId)
      if (!rec) {
        rec = { songId, score: 0, sources: [] }
        bySong.set(songId, rec)
      }
      rec.score += source.similarity * (11 - position)
      rec.sources.push({ key: source.key, similarity: source.similarity, position })
    })
  }

  return [...bySong.values()]
    .sort((a, b) => b.score - a.score || a.songId - b.songId)
    .slice(0, limit)
}

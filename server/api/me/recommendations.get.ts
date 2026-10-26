import { recommend, TOP_SOURCES } from '#shared/algorithms/recommend'
import type { Recommendation } from '#shared/types'

export default defineEventHandler((event): { items: Recommendation[] } => {
  const profile = requireProfile(event)
  const ranking = requireRanking(profile.id)

  const top = similarTo(profile.id, ranking).slice(0, TOP_SOURCES)
  const byKey = new Map(top.map((p) => [p.key, p]))
  const recs = recommend(ranking, top)
  const songs = loadSongs(recs.map((r) => r.songId))

  return {
    items: recs.map((r) => ({
      song: songs.get(r.songId)!,
      // arredonda para evitar ruído de ponto flutuante na exibição
      score: Math.round(r.score * 100) / 100,
      sources: r.sources.map((s) => ({
        nickname: byKey.get(s.key)!.nickname,
        isSample: byKey.get(s.key)!.isSample,
        similarity: s.similarity,
        position: s.position,
      })),
    })),
  }
})

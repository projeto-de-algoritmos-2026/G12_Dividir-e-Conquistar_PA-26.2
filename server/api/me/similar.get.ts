import type { SimilarItem } from '#shared/types'

export default defineEventHandler((event): { items: SimilarItem[] } => {
  const profile = requireProfile(event)
  const ranking = requireRanking(profile.id)

  return {
    items: similarTo(profile.id, ranking).map((c) => ({
      nickname: c.nickname,
      isSample: c.isSample,
      similarity: c.similarity,
      inversions: c.inversions,
      maxInversions: c.maxInversions,
      commonCount: c.commonCount,
    })),
  }
})

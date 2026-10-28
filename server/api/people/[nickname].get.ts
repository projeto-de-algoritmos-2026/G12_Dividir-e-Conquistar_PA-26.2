import { compareRankings } from '#shared/algorithms/similarity'
import type { PersonDetail } from '#shared/types'

/** Ranking completo de uma pessoa e a relação com o ranking de quem está vendo. */
export default defineEventHandler((event): PersonDetail => {
  const me = requireProfile(event)
  const nickname = decodeURIComponent(getRouterParam(event, 'nickname') ?? '')
  const other = findProfile(nickname)
  const theirs = other ? loadRanking(other.id) : []
  if (!other || theirs.length === 0) {
    throw createError({ statusCode: 404, message: 'Perfil não encontrado' })
  }

  const isMe = other.id === me.id
  const mine = isMe ? theirs : loadRanking(me.id)
  const viewerHasRanking = mine.length > 0
  const myPositions = new Map(mine.map((id, i) => [id, i + 1]))

  // mesma função de /api/me/similar: a porcentagem é idêntica à da tela de semelhantes
  const comparison = isMe || !viewerHasRanking ? null : compareRankings(mine, theirs)

  const songs = loadSongs(theirs)
  return {
    person: { nickname: other.nickname, isSample: Boolean(other.is_sample), isMe },
    ranking: theirs.map((id, i) => ({
      position: i + 1,
      song: songs.get(id)!,
      myPosition: isMe ? null : (myPositions.get(id) ?? null),
    })),
    viewerHasRanking,
    comparison: comparison && {
      commonCount: comparison.commonCount,
      comparable: comparison.comparable,
      similarity: comparison.similarity,
      inversions: comparison.inversions,
      maxInversions: comparison.maxInversions,
    },
  }
})

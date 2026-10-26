import { countInversionsTraced } from '#shared/algorithms/inversions'
import { MIN_COMMON } from '#shared/algorithms/similarity'
import type { CommonSong, CompareDetail } from '#shared/types'

/** Detalhe da comparação com outro perfil: músicas em comum, pares invertidos e passos. */
export default defineEventHandler((event): CompareDetail => {
  const me = requireProfile(event)
  const nickname = decodeURIComponent(getRouterParam(event, 'nickname') ?? '')
  const other = findProfile(nickname)
  if (!other || other.id === me.id) {
    throw createError({ statusCode: 404, message: 'Perfil não encontrado' })
  }

  const mine = requireRanking(me.id)
  const theirs = loadRanking(other.id)
  if (theirs.length === 0) {
    throw createError({ statusCode: 409, message: `${other.nickname} ainda não montou o ranking` })
  }

  // músicas em comum na ordem do MEU ranking, com a posição de cada uma nos dois rankings
  const otherPos = new Map(theirs.map((id, i) => [id, i + 1]))
  const commonIds = mine.filter((id) => otherPos.has(id))
  if (commonIds.length < MIN_COMMON) {
    throw createError({ statusCode: 422, message: 'Vocês têm menos de 3 músicas em comum' })
  }

  const songs = loadSongs(commonIds)
  const common: CommonSong[] = commonIds.map((id) => ({
    song: songs.get(id)!,
    myPosition: mine.indexOf(id) + 1,
    otherPosition: otherPos.get(id)!,
  }))

  // redução: posições do outro, na minha ordem → contagem de inversões
  const traced = countInversionsTraced(common.map((c) => c.otherPosition))
  const k = common.length
  const maxInversions = (k * (k - 1)) / 2

  return {
    other: { nickname: other.nickname, isSample: Boolean(other.is_sample) },
    common,
    inversions: traced.count,
    maxInversions,
    similarity: 1 - traced.count / maxInversions,
    // par (i, j): eu coloco common[i] antes de common[j], a outra pessoa coloca depois
    invertedPairs: traced.pairs.map(([i, j]) => ({
      a: common[i]!.song,
      b: common[j]!.song,
      myPositions: [common[i]!.myPosition, common[j]!.myPosition],
      otherPositions: [common[i]!.otherPosition, common[j]!.otherPosition],
      myOrder: ['a', 'b'],
      otherOrder: ['b', 'a'],
    })),
    steps: traced.steps,
  }
})

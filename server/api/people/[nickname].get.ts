import type { PersonDetail } from '#shared/types'

/** Ranking completo de uma pessoa. */
export default defineEventHandler((event): PersonDetail => {
  const me = requireProfile(event)
  const nickname = decodeURIComponent(getRouterParam(event, 'nickname') ?? '')
  const other = findProfile(nickname)
  const theirs = other ? loadRanking(other.id) : []
  if (!other || theirs.length === 0) {
    throw createError({ statusCode: 404, message: 'Perfil não encontrado' })
  }

  const songs = loadSongs(theirs)
  return {
    person: { nickname: other.nickname, isSample: Boolean(other.is_sample), isMe: other.id === me.id },
    ranking: theirs.map((id, i) => ({ position: i + 1, song: songs.get(id)!, myPosition: null })),
    viewerHasRanking: false,
    comparison: null,
  }
})

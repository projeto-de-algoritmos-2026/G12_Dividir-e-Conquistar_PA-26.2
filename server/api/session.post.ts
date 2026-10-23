import type { SessionInfo } from '#shared/types'

/** Entra no perfil do apelido ou cria um novo (201). */
export default defineEventHandler(async (event): Promise<SessionInfo> => {
  const { nickname } = await readValid(event, sessionBodySchema)
  let profile = findProfile(nickname)

  if (profile?.is_sample) {
    throw createError({
      statusCode: 409,
      message: 'Esse apelido é de um perfil de exemplo, escolha outro',
    })
  }

  if (!profile) {
    const now = new Date().toISOString()
    useDb()
      .prepare(
        `INSERT INTO profiles (nickname, nickname_key, is_sample, created_at, updated_at)
         VALUES (?, ?, 0, ?, ?)`,
      )
      .run(nickname, nickname.toLowerCase(), now, now)
    profile = findProfile(nickname)!
    setResponseStatus(event, 201)
  }

  setSessionCookie(event, profile.nickname)
  return {
    nickname: profile.nickname,
    isSample: false,
    hasRanking: loadRanking(profile.id).length > 0,
  }
})

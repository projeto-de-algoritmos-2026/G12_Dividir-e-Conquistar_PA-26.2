import type { H3Event } from 'h3'
import type { Me, Song } from '#shared/types'

const COOKIE = 'nickname'

export interface ProfileRow {
  id: number
  nickname: string
  nickname_key: string
  is_sample: number
}

export function setSessionCookie(event: H3Event, nickname: string) {
  setCookie(event, COOKIE, nickname, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  })
}

export function clearSessionCookie(event: H3Event) {
  deleteCookie(event, COOKIE, { path: '/' })
}

export function findProfile(nickname: string): ProfileRow | undefined {
  return useDb()
    .prepare('SELECT id, nickname, nickname_key, is_sample FROM profiles WHERE nickname_key = ?')
    .get(nickname.trim().toLowerCase()) as ProfileRow | undefined
}

/** Perfil da sessão atual; 401 se não houver cookie ou o perfil não existir. */
export function requireProfile(event: H3Event): ProfileRow {
  const nickname = getCookie(event, COOKIE)
  const profile = nickname ? findProfile(nickname) : undefined
  if (!profile || profile.is_sample) {
    throw createError({ statusCode: 401, message: 'Entre com um apelido' })
  }
  return profile
}

/** song_ids do ranking, em ordem de posição (índice 0 = posição 1). */
export function loadRanking(profileId: number): number[] {
  const rows = useDb()
    .prepare('SELECT song_id FROM ranking_entries WHERE profile_id = ? ORDER BY position')
    .all(profileId) as { song_id: number }[]
  return rows.map((r) => r.song_id)
}

/** 409 se o perfil ainda não tem ranking salvo. */
export function requireRanking(profileId: number): number[] {
  const ranking = loadRanking(profileId)
  if (ranking.length === 0) {
    throw createError({ statusCode: 409, message: 'Monte seu ranking primeiro' })
  }
  return ranking
}

export function loadSongs(ids: readonly number[]): Map<number, Song> {
  const map = new Map<number, Song>()
  if (ids.length === 0) return map
  const rows = useDb()
    .prepare(`SELECT id, title, artist, genre FROM songs WHERE id IN (${ids.map(() => '?').join(',')})`)
    .all(...ids) as Song[]
  for (const s of rows) map.set(s.id, s)
  return map
}

export function buildMe(profile: ProfileRow): Me {
  const ranking = loadRanking(profile.id)
  const songs = loadSongs(ranking)
  return {
    nickname: profile.nickname,
    isSample: Boolean(profile.is_sample),
    ranking: ranking.map((id, i) => ({ position: i + 1, song: songs.get(id)! })),
  }
}

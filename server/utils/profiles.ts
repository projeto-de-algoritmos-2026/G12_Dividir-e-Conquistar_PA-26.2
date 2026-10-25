import { rankSimilar } from '#shared/algorithms/similarity'

export interface ProfileRanking {
  id: number
  nickname: string
  /** nickname_key: usada como chave estável no desempate. */
  key: string
  isSample: boolean
  ranking: number[]
}

/** Todos os perfis com ranking completo, numa única consulta. */
export function loadAllRankings(): ProfileRanking[] {
  const rows = useDb()
    .prepare(
      `SELECT p.id, p.nickname, p.nickname_key, p.is_sample, r.song_id
       FROM profiles p JOIN ranking_entries r ON r.profile_id = p.id
       ORDER BY p.id, r.position`,
    )
    .all() as { id: number; nickname: string; nickname_key: string; is_sample: number; song_id: number }[]

  const byId = new Map<number, ProfileRanking>()
  for (const row of rows) {
    let p = byId.get(row.id)
    if (!p) {
      p = { id: row.id, nickname: row.nickname, key: row.nickname_key, isSample: Boolean(row.is_sample), ranking: [] }
      byId.set(row.id, p)
    }
    p.ranking.push(row.song_id)
  }
  return [...byId.values()].filter((p) => p.ranking.length === 10)
}

/** Perfis comparáveis com o perfil dado, já ordenados por semelhança. */
export function similarTo(profileId: number, ranking: number[]) {
  return rankSimilar(ranking, loadAllRankings().filter((p) => p.id !== profileId))
}

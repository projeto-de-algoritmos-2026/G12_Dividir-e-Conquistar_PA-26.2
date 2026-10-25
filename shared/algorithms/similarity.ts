import { countInversions } from './inversions'

/** songIds em ordem de preferência (índice 0 = posição 1). */
export type Ranking = readonly number[]

export const MIN_COMMON = 3

export interface Comparison {
  commonCount: number
  comparable: boolean
  inversions: number
  maxInversions: number
  similarity: number
}

/**
 * Compara dois rankings pela distância de Kendall tau sobre as músicas em comum.
 *
 * Redução para contagem de inversões: pegamos as músicas em comum na ordem de `mine` e trocamos
 * cada uma pela posição que ela tem em `other`. Se as duas pessoas concordam sobre a ordem, esse
 * array fica crescente (0 inversões). Cada inversão nele é um par de músicas que as duas pessoas
 * ordenaram de forma diferente.
 */
export function compareRankings(mine: Ranking, other: Ranking): Comparison {
  const positions = commonPositions(mine, other)
  const k = positions.length
  const maxInversions = (k * (k - 1)) / 2
  const comparable = k >= MIN_COMMON

  if (!comparable) {
    return { commonCount: k, comparable, inversions: 0, maxInversions, similarity: 0 }
  }

  const { count } = countInversions(positions)
  return {
    commonCount: k,
    comparable,
    inversions: count,
    maxInversions,
    similarity: 1 - count / maxInversions,
  }
}

/** Posições (1-based) em `other` das músicas em comum, na ordem em que aparecem em `mine`. */
export function commonPositions(mine: Ranking, other: Ranking): number[] {
  const positionInOther = new Map<number, number>()
  other.forEach((songId, i) => positionInOther.set(songId, i + 1))

  const positions: number[] = []
  for (const songId of mine) {
    const p = positionInOther.get(songId)
    if (p !== undefined) positions.push(p)
  }
  return positions
}

/**
 * Compara `mine` com cada outro ranking e devolve só os comparáveis (k ≥ 3), ordenados por
 * semelhança desc → músicas em comum desc → chave asc.
 */
export function rankSimilar<T extends { key: string; ranking: Ranking }>(
  mine: Ranking,
  others: readonly T[],
): Array<T & Comparison> {
  return others
    .map((o) => ({ ...o, ...compareRankings(mine, o.ranking) }))
    .filter((c) => c.comparable)
    .sort(
      (a, b) =>
        b.similarity - a.similarity ||
        b.commonCount - a.commonCount ||
        (a.key < b.key ? -1 : a.key > b.key ? 1 : 0),
    )
}

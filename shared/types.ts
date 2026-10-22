export interface Song {
  id: number
  title: string
  artist: string
  genre: string
}

export interface RankingEntry {
  position: number
  song: Song
}

export interface Me {
  nickname: string
  isSample: boolean
  ranking: RankingEntry[]
}

export interface SessionInfo {
  nickname: string
  isSample: boolean
  hasRanking: boolean
}

export interface SongsResponse {
  items: Song[]
  genres: string[]
}

export interface SimilarItem {
  nickname: string
  isSample: boolean
  similarity: number
  inversions: number
  maxInversions: number
  commonCount: number
}

export interface RecommendationSource {
  nickname: string
  isSample: boolean
  similarity: number
  position: number
}

export interface Recommendation {
  song: Song
  score: number
  sources: RecommendationSource[]
}

/** Um passo da recursão do merge sort, usado na visualização. */
export interface TraceStep {
  kind: 'divide' | 'merge'
  depth: number
  /** Trecho `[início, fim)` no array original. */
  range: [number, number]
  left: number[]
  right: number[]
  merged?: number[]
  /** Inversões contadas entre as duas metades nesta mescla (0 em `divide`). */
  splitCount: number
}

export interface CommonSong {
  song: Song
  myPosition: number
  otherPosition: number
}

export interface InvertedPair {
  a: Song
  b: Song
  /** Posições de `a` e `b` no meu ranking e no do outro. */
  myPositions: [number, number]
  otherPositions: [number, number]
  myOrder: ['a', 'b']
  otherOrder: ['b', 'a']
}

export interface CompareDetail {
  other: { nickname: string; isSample: boolean }
  common: CommonSong[]
  inversions: number
  maxInversions: number
  similarity: number
  invertedPairs: InvertedPair[]
  steps: TraceStep[]
}

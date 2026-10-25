/**
 * Contagem de inversões por divisão e conquista (merge sort), O(n log n).
 *
 * Uma inversão é um par de índices (i, j) com i < j e arr[i] > arr[j].
 *
 * - Dividir: parte o array ao meio.
 * - Conquistar: conta recursivamente as inversões dentro de cada metade, que voltam ordenadas.
 * - Combinar: ao mesclar as duas metades ordenadas, toda vez que o menor elemento disponível vem
 *   da metade DIREITA, ele é menor que todos os elementos que ainda restam na ESQUERDA, e cada um
 *   deles forma uma inversão com ele. Somamos de uma vez quantos restam na esquerda.
 *
 * Total = inversões da esquerda + inversões da direita + inversões "cruzadas" da mescla.
 */

export interface InversionResult {
  count: number
  sorted: number[]
}

export function countInversions(arr: readonly number[]): InversionResult {
  // copia para não alterar a entrada
  return sortAndCount(arr.slice())
}

function sortAndCount(a: number[]): InversionResult {
  if (a.length <= 1) return { count: 0, sorted: a }

  const mid = a.length >> 1
  const left = sortAndCount(a.slice(0, mid))
  const right = sortAndCount(a.slice(mid))
  const merged = mergeAndCount(left.sorted, right.sorted)

  return { count: left.count + right.count + merged.count, sorted: merged.sorted }
}

/** Mescla duas listas ordenadas contando os pares (x da esquerda, y da direita) com x > y. */
function mergeAndCount(left: readonly number[], right: readonly number[]): InversionResult {
  const sorted: number[] = new Array(left.length + right.length)
  let i = 0
  let j = 0
  let k = 0
  let count = 0

  while (i < left.length && j < right.length) {
    // comparação estrita: valores iguais não são inversão, então o da esquerda sai primeiro
    if (left[i]! > right[j]!) {
      count += left.length - i // right[j] é menor que todos os que restam na esquerda
      sorted[k++] = right[j++]!
    } else {
      sorted[k++] = left[i++]!
    }
  }
  while (i < left.length) sorted[k++] = left[i++]!
  while (j < right.length) sorted[k++] = right[j++]!

  return { count, sorted }
}

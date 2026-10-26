import type { TraceStep } from '../types'

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

// ---------------------------------------------------------------------------------------------
// Versão rastreada, usada na tela de detalhe: mesma recursão e mesma mescla, mas registra cada
// divisão e cada mescla (para a visualização passo a passo) e os pares invertidos encontrados.
// ---------------------------------------------------------------------------------------------

export interface TracedInversionResult extends InversionResult {
  /** Pares de ÍNDICES (i, j) do array original com i < j e arr[i] > arr[j]. */
  pairs: Array<[number, number]>
  steps: TraceStep[]
}

/** Elemento acompanhado do seu índice no array original, para reconstruir os pares. */
interface Item {
  value: number
  index: number
}

export function countInversionsTraced(arr: readonly number[]): TracedInversionResult {
  const pairs: Array<[number, number]> = []
  const steps: TraceStep[] = []
  const values = (items: readonly Item[]) => items.map((x) => x.value)

  function sortAndCount(items: Item[], start: number, depth: number): { count: number; sorted: Item[] } {
    if (items.length <= 1) return { count: 0, sorted: items }

    const mid = items.length >> 1
    const leftPart = items.slice(0, mid)
    const rightPart = items.slice(mid)
    steps.push({
      kind: 'divide',
      depth,
      range: [start, start + items.length],
      left: values(leftPart),
      right: values(rightPart),
      splitCount: 0,
    })

    const left = sortAndCount(leftPart, start, depth + 1)
    const right = sortAndCount(rightPart, start + mid, depth + 1)

    // mescla igual à de countInversions, anotando os pares
    const L = left.sorted
    const R = right.sorted
    const sorted: Item[] = []
    let i = 0
    let j = 0
    let splitCount = 0
    while (i < L.length && j < R.length) {
      if (L[i]!.value > R[j]!.value) {
        splitCount += L.length - i
        // R[j] forma uma inversão com cada elemento que ainda resta na esquerda
        for (let r = i; r < L.length; r++) pairs.push([L[r]!.index, R[j]!.index])
        sorted.push(R[j++]!)
      } else {
        sorted.push(L[i++]!)
      }
    }
    while (i < L.length) sorted.push(L[i++]!)
    while (j < R.length) sorted.push(R[j++]!)

    steps.push({
      kind: 'merge',
      depth,
      range: [start, start + items.length],
      left: values(L),
      right: values(R),
      merged: values(sorted),
      splitCount,
    })

    return { count: left.count + right.count + splitCount, sorted }
  }

  const { count, sorted } = sortAndCount(arr.map((value, index) => ({ value, index })), 0, 0)
  // ordena os pares por (i, j) para exibição estável
  pairs.sort((a, b) => a[0] - b[0] || a[1] - b[1])
  return { count, sorted: values(sorted), pairs, steps }
}

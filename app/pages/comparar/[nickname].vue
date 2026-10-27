<script setup lang="ts">
import type { CompareDetail } from '#shared/types'

definePageMeta({ middleware: 'auth', requireRanking: true })

const route = useRoute()
const nickname = computed(() => String(route.params.nickname))
useHead({ title: () => `Comparação com ${nickname.value} · Gosto em Comum` })

const { profile } = useProfile()
const { data, status, error } = await useFetch<CompareDetail>(
  () => `/api/me/compare/${encodeURIComponent(nickname.value)}`,
)

const labels = computed(() =>
  Object.fromEntries((data.value?.common ?? []).map((c) => [c.otherPosition, c.song.title])),
)
</script>

<template>
  <div class="space-y-8">
    <UButton to="/semelhantes" icon="i-lucide-arrow-left" color="neutral" variant="ghost" size="sm">
      Semelhantes
    </UButton>

    <div v-if="status === 'pending' && !data" class="space-y-3">
      <USkeleton class="h-10 w-2/3" />
      <USkeleton class="h-40 w-full" />
    </div>

    <UAlert
      v-else-if="error"
      color="warning"
      variant="soft"
      icon="i-lucide-triangle-alert"
      :title="errorMessage(error)"
      :actions="[{ label: 'Voltar para semelhantes', to: '/semelhantes' }]"
    />

    <template v-else-if="data">
      <header class="space-y-2">
        <h1 class="text-2xl font-bold flex flex-wrap items-center gap-2">
          <span>{{ profile?.nickname }}</span>
          <span class="text-muted">×</span>
          <span>{{ data.other.nickname }}</span>
          <UBadge v-if="data.other.isSample" color="neutral" variant="outline" size="sm">exemplo</UBadge>
          <SimilarityBadge :similarity="data.similarity" size="lg" />
        </h1>
        <p class="text-lg">
          <strong>{{ data.inversions }}</strong>
          {{ data.inversions === 1 ? 'inversão' : 'inversões' }} de
          <strong>{{ data.maxInversions }}</strong> pares possíveis entre
          {{ data.common.length }} músicas em comum
        </p>
      </header>

      <section class="space-y-3">
        <h2 class="text-lg font-semibold">Músicas em comum</h2>
        <div class="overflow-x-auto border border-default rounded-lg">
          <table class="w-full text-sm">
            <thead class="bg-elevated text-left">
              <tr>
                <th class="px-3 py-2 w-16">Você</th>
                <th class="px-3 py-2">Música</th>
                <th class="px-3 py-2 w-24 text-right">{{ data.other.nickname }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-default">
              <tr v-for="c in data.common" :key="c.song.id">
                <td class="px-3 py-2 tabular-nums">{{ c.myPosition }}º</td>
                <td class="px-3 py-2">
                  <p class="font-medium">{{ c.song.title }}</p>
                  <p class="text-muted">{{ c.song.artist }}</p>
                </td>
                <td class="px-3 py-2 tabular-nums text-right font-semibold">{{ c.otherPosition }}º</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="space-y-3">
        <h2 class="text-lg font-semibold">Pares invertidos</h2>
        <InvertedPairs :pairs="data.invertedPairs" :other-nickname="data.other.nickname" />
      </section>

      <section class="space-y-3">
        <h2 class="text-lg font-semibold">Como a contagem é feita</h2>
        <div class="text-sm text-muted space-y-2">
          <p>
            Listamos as músicas em comum na <strong>sua</strong> ordem e trocamos cada uma pela
            posição que ela tem no ranking de {{ data.other.nickname }} (a última coluna da tabela).
            Se vocês concordassem em tudo, esse array estaria em ordem crescente. Cada par fora de
            ordem (um número maior antes de um menor) é uma <strong>inversão</strong>, ou seja, um
            par de músicas que vocês ordenaram de forma diferente.
          </p>
          <p>
            Em vez de comparar todos os pares (O(k²)), contamos com <strong>divisão e conquista</strong>:
            o merge sort divide o array ao meio, conta as inversões de cada metade e, ao mesclar,
            conta as inversões entre as metades, em O(k log k).
            Semelhança = 1 − inversões / pares possíveis.
          </p>
        </div>
        <MergeSortStepper
          :steps="data.steps"
          :initial="data.common.map((c) => c.otherPosition)"
          :labels="labels"
        />
      </section>
    </template>
  </div>
</template>

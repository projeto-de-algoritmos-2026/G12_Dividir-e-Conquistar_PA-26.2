<script setup lang="ts">
import type { SimilarItem } from '#shared/types'

definePageMeta({ middleware: 'auth', requireRanking: true })
useHead({ title: 'Semelhantes · Gosto em Comum' })

const { data, status, error, refresh } = await useFetch<{ items: SimilarItem[] }>('/api/me/similar')
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold">Pessoas com gosto parecido</h1>
      <p class="text-muted">
        Comparamos as músicas que vocês têm em comum (pelo menos 3). Cada par de músicas que a
        outra pessoa ordenou ao contrário de você é uma <strong>inversão</strong>: quanto menos
        inversões, mais parecidos.
      </p>
    </div>

    <div v-if="status === 'pending' && !data" class="space-y-2">
      <USkeleton v-for="i in 5" :key="i" class="h-16 w-full" />
    </div>

    <UAlert
      v-else-if="error"
      color="error"
      variant="soft"
      icon="i-lucide-circle-x"
      :title="errorMessage(error)"
      :actions="[{ label: 'Tentar de novo', onClick: () => refresh() }]"
    />

    <UAlert
      v-else-if="data && data.items.length === 0"
      color="info"
      variant="soft"
      icon="i-lucide-info"
      title="Ainda não há perfis com pelo menos 3 músicas em comum com você"
      description="Tente trocar algumas músicas do ranking por outras mais conhecidas."
      :actions="[{ label: 'Editar ranking', to: '/ranking' }]"
    />

    <ul v-else-if="data" class="space-y-2">
      <li v-for="(item, i) in data.items" :key="item.nickname">
        <NuxtLink
          :to="`/comparar/${encodeURIComponent(item.nickname)}`"
          class="flex items-center gap-3 rounded-lg border border-default px-3 py-3 hover:bg-elevated transition"
        >
          <span class="w-6 text-right text-sm text-muted tabular-nums">{{ i + 1 }}</span>
          <div class="min-w-0 flex-1">
            <p class="font-medium flex items-center gap-2 min-w-0">
              <span class="truncate">{{ item.nickname }}</span>
              <UBadge v-if="item.isSample" color="neutral" variant="outline" size="sm">exemplo</UBadge>
            </p>
            <p class="text-sm text-muted">
              {{ item.commonCount }} músicas em comum ·
              {{ item.inversions }} {{ item.inversions === 1 ? 'inversão' : 'inversões' }} de
              {{ item.maxInversions }} pares
            </p>
          </div>
          <SimilarityBadge :similarity="item.similarity" size="lg" />
          <UIcon name="i-lucide-chevron-right" class="text-muted shrink-0" />
        </NuxtLink>
      </li>
    </ul>
  </div>
</template>

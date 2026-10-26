<script setup lang="ts">
import type { Recommendation } from '#shared/types'

definePageMeta({ middleware: 'auth', requireRanking: true })
useHead({ title: 'Recomendações · Gosto em Comum' })

const { data, status, error, refresh } = await useFetch<{ items: Recommendation[] }>('/api/me/recommendations')
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold">Recomendações para você</h1>
      <p class="text-muted">
        Músicas que estão no ranking das 5 pessoas mais parecidas com você e ainda não estão no
        seu. Pesa mais quem é mais parecido e a música que ela colocou mais no alto.
      </p>
    </div>

    <div v-if="status === 'pending' && !data" class="grid gap-3 sm:grid-cols-2">
      <USkeleton v-for="i in 6" :key="i" class="h-32 w-full" />
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
      title="Nenhuma recomendação nova"
      description="Você já tem as músicas das pessoas mais parecidas, ou ainda não há ninguém comparável com você."
      :actions="[{ label: 'Ver semelhantes', to: '/semelhantes' }]"
    />

    <ol v-else-if="data" class="grid gap-3 sm:grid-cols-2">
      <li v-for="(item, i) in data.items" :key="item.song.id">
        <UCard class="h-full" :ui="{ body: 'p-4 sm:p-4 space-y-3' }">
          <div class="flex items-start gap-3">
            <span class="size-8 shrink-0 rounded-full bg-accented grid place-items-center text-sm font-bold">
              {{ i + 1 }}
            </span>
            <div class="min-w-0 flex-1">
              <p class="font-semibold">{{ item.song.title }}</p>
              <p class="text-sm text-muted">{{ item.song.artist }}</p>
            </div>
            <UBadge color="neutral" variant="soft">{{ item.song.genre }}</UBadge>
          </div>
          <div class="text-sm space-y-1">
            <p class="text-muted">Recomendada por:</p>
            <ul class="space-y-1">
              <li v-for="s in item.sources" :key="s.nickname" class="flex items-center gap-2">
                <NuxtLink :to="`/comparar/${encodeURIComponent(s.nickname)}`" class="truncate hover:underline">
                  {{ s.nickname }}
                </NuxtLink>
                <SimilarityBadge :similarity="s.similarity" size="sm" />
                <span class="text-muted ml-auto whitespace-nowrap">{{ s.position }}º no ranking</span>
              </li>
            </ul>
          </div>
        </UCard>
      </li>
    </ol>
  </div>
</template>

<script setup lang="ts">
import type { PeopleResponse } from '#shared/types'

definePageMeta({ middleware: 'auth' })
useHead({ title: 'Pessoas · Gosto em Comum' })

const route = useRoute()
const router = useRouter()

const search = ref(String(route.query.q ?? ''))
let timer: ReturnType<typeof setTimeout> | undefined
watch(search, (text) => {
  clearTimeout(timer)
  // nova busca sempre volta para a página 1
  timer = setTimeout(() => router.replace({ query: { q: text.trim() || undefined } }), 300)
})
// mantém o campo em dia ao voltar/avançar no histórico
watch(() => route.query.q, (q) => {
  if (String(q ?? '') !== search.value.trim()) search.value = String(q ?? '')
})

const { data, status, error, refresh } = await useFetch<PeopleResponse>('/api/people', {
  query: computed(() => ({ q: route.query.q, page: route.query.page })),
})

function goToPage(page: number) {
  router.push({ query: { ...route.query, page: page > 1 ? page : undefined } })
}

function clearSearch() {
  search.value = ''
  router.replace({ query: {} })
}
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold">Pessoas</h1>
      <p class="text-muted">Todo mundo que já montou o ranking. Abra alguém para ver as 10 músicas dela.</p>
    </div>

    <UInput
      v-model="search"
      icon="i-lucide-search"
      placeholder="Buscar por apelido"
      class="w-full"
      :loading="status === 'pending'"
    />

    <div v-if="status === 'pending' && !data" class="space-y-2">
      <USkeleton v-for="i in 8" :key="i" class="h-14 w-full" />
    </div>

    <UAlert
      v-else-if="error"
      color="error"
      variant="soft"
      icon="i-lucide-circle-x"
      :title="errorMessage(error)"
      :actions="[{ label: 'Tentar de novo', onClick: () => refresh() }]"
    />

    <template v-else-if="data">
      <p class="text-sm text-muted">
        {{ data.total }} {{ data.total === 1 ? 'pessoa' : 'pessoas' }}
        <template v-if="data.pageCount > 1"> · Página {{ data.page }} de {{ data.pageCount }}</template>
      </p>

      <div
        v-if="data.items.length === 0"
        class="text-center text-muted py-10 border border-dashed border-default rounded-lg space-y-3"
      >
        <p>Nenhuma pessoa encontrada</p>
        <UButton v-if="route.query.q" color="neutral" variant="outline" size="sm" @click="clearSearch">
          Limpar busca
        </UButton>
      </div>

      <ul v-else class="divide-y divide-default border border-default rounded-lg">
        <li v-for="p in data.items" :key="p.nickname">
          <NuxtLink
            :to="`/pessoas/${encodeURIComponent(p.nickname)}`"
            class="flex items-center gap-3 px-3 py-3 hover:bg-elevated transition"
          >
            <UIcon name="i-lucide-user-round" class="size-5 text-muted shrink-0" />
            <div class="min-w-0 flex-1">
              <p class="font-medium flex items-center gap-2 min-w-0">
                <span class="truncate">{{ p.nickname }}</span>
                <UBadge v-if="p.isMe" color="primary" variant="soft" size="sm">você</UBadge>
                <UBadge v-if="p.isSample" color="neutral" variant="outline" size="sm">exemplo</UBadge>
              </p>
              <p class="text-sm text-muted truncate">
                <UIcon name="i-lucide-heart" class="size-3.5 align-[-2px]" />
                {{ p.favorite.title }} — {{ p.favorite.artist }}
              </p>
            </div>
            <UIcon name="i-lucide-chevron-right" class="text-muted shrink-0" />
          </NuxtLink>
        </li>
      </ul>

      <div v-if="data.pageCount > 1" class="flex justify-center">
        <UPagination
          :page="data.page"
          :total="data.total"
          :items-per-page="data.pageSize"
          :sibling-count="1"
          @update:page="goToPage"
        />
      </div>
    </template>
  </div>
</template>

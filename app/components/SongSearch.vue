<script setup lang="ts">
import type { Song, SongsResponse } from '#shared/types'

const props = defineProps<{ selectedIds: number[]; full: boolean }>()
const emit = defineEmits<{ add: [song: Song] }>()

const ALL = 'Todos os gêneros'
const q = ref('')
const debouncedQ = ref('')
const genre = ref(ALL)

let timer: ReturnType<typeof setTimeout> | undefined
watch(q, (v) => {
  clearTimeout(timer)
  timer = setTimeout(() => (debouncedQ.value = v), 300)
})

const { data, status, error } = await useFetch<SongsResponse>('/api/songs', {
  query: computed(() => ({
    q: debouncedQ.value || undefined,
    genre: genre.value === ALL ? undefined : genre.value,
    limit: 100,
  })),
})

const genreItems = computed(() => [ALL, ...(data.value?.genres ?? [])])
const selected = computed(() => new Set(props.selectedIds))
</script>

<template>
  <div class="space-y-3">
    <div class="flex flex-col sm:flex-row gap-2">
      <UInput
        v-model="q"
        icon="i-lucide-search"
        placeholder="Buscar por título ou artista"
        class="flex-1"
        :loading="status === 'pending'"
      />
      <USelect v-model="genre" :items="genreItems" class="sm:w-48" />
    </div>

    <UAlert v-if="full" color="info" variant="soft" icon="i-lucide-info" title="Seu ranking já tem 10 músicas. Remova uma para adicionar outra." />

    <UAlert v-if="error" color="error" variant="soft" :title="errorMessage(error)" />

    <ul class="divide-y divide-default border border-default rounded-lg max-h-96 overflow-y-auto">
      <li v-for="song in data?.items ?? []" :key="song.id" class="flex items-center gap-3 px-3 py-2">
        <div class="min-w-0 flex-1">
          <p class="font-medium truncate">{{ song.title }}</p>
          <p class="text-sm text-muted truncate">{{ song.artist }} · {{ song.genre }}</p>
        </div>
        <UButton
          size="sm"
          :variant="selected.has(song.id) ? 'ghost' : 'soft'"
          :icon="selected.has(song.id) ? 'i-lucide-check' : 'i-lucide-plus'"
          :disabled="selected.has(song.id) || full"
          @click="emit('add', song)"
        >
          <span class="hidden sm:inline">{{ selected.has(song.id) ? 'No ranking' : 'Adicionar' }}</span>
        </UButton>
      </li>
      <li v-if="status === 'pending' && !data" class="px-3 py-6 text-center text-muted">
        Carregando músicas…
      </li>
      <li v-else-if="(data?.items.length ?? 0) === 0" class="px-3 py-6 text-center text-muted">
        Nenhuma música encontrada
      </li>
    </ul>
  </div>
</template>

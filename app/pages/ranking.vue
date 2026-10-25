<script setup lang="ts">
import type { Me, Song } from '#shared/types'

definePageMeta({ middleware: 'auth' })
useHead({ title: 'Meu ranking · Gosto em Comum' })

const SIZE = 10
const route = useRoute()
const toast = useToast()
const { profile } = useProfile()

const songs = ref<Song[]>(profile.value?.ranking.map((r) => r.song) ?? [])
const saving = ref(false)
const error = ref('')

const missing = computed(() => SIZE - songs.value.length)
const savedIds = computed(() => profile.value?.ranking.map((r) => r.song.id).join(',') ?? '')
const dirty = computed(() => songs.value.map((s) => s.id).join(',') !== savedIds.value)

function add(song: Song) {
  if (songs.value.length < SIZE && !songs.value.some((s) => s.id === song.id)) {
    songs.value = [...songs.value, song]
  }
}

async function salvar() {
  error.value = ''
  saving.value = true
  try {
    profile.value = await $fetch<Me>('/api/me/ranking', {
      method: 'PUT',
      body: { songIds: songs.value.map((s) => s.id) },
    })
    toast.add({
      title: 'Ranking salvo!',
      description: 'Veja quem tem o gosto parecido com o seu.',
      color: 'success',
      icon: 'i-lucide-check',
      actions: [{ label: 'Ver semelhantes', to: '/semelhantes', color: 'success', variant: 'outline' }],
    })
  } catch (err) {
    error.value = errorMessage(err)
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold">Meu ranking</h1>
      <p class="text-muted">Escolha 10 músicas e arraste para ordenar: a primeira é a sua favorita.</p>
    </div>

    <UAlert
      v-if="route.query.aviso === 'monte' && !profile?.ranking.length"
      color="warning"
      variant="soft"
      icon="i-lucide-triangle-alert"
      title="Monte seu ranking primeiro"
      description="Para ver semelhantes e recomendações você precisa salvar as suas 10 músicas."
    />

    <div class="grid gap-6 md:grid-cols-2">
      <section class="space-y-3 md:order-2">
        <div class="flex items-center justify-between">
          <h2 class="font-semibold">Suas músicas</h2>
          <UBadge :color="missing === 0 ? 'success' : 'neutral'" variant="soft" size="lg">
            {{ songs.length }}/{{ SIZE }}
          </UBadge>
        </div>

        <RankingList v-model="songs" />

        <UAlert v-if="error" color="error" variant="soft" icon="i-lucide-circle-x" :title="error" />

        <div class="space-y-2">
          <UButton
            block
            size="lg"
            icon="i-lucide-save"
            :loading="saving"
            :disabled="missing !== 0 || !dirty"
            @click="salvar"
          >
            Salvar ranking
          </UButton>
          <p v-if="missing > 0" class="text-sm text-center text-muted">
            {{ missing === 1 ? 'Falta 1 música' : `Faltam ${missing} músicas` }}
          </p>
          <p v-else-if="!dirty && profile?.ranking.length" class="text-sm text-center text-muted">
            Ranking salvo.
            <NuxtLink to="/semelhantes" class="text-primary underline">Ver semelhantes</NuxtLink>
          </p>
        </div>
      </section>

      <section class="space-y-3 md:order-1">
        <h2 class="font-semibold">Catálogo</h2>
        <SongSearch :selected-ids="songs.map((s) => s.id)" :full="missing <= 0" @add="add" />
      </section>
    </div>
  </div>
</template>

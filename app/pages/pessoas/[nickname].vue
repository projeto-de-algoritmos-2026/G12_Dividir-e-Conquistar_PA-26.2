<script setup lang="ts">
import type { PersonDetail } from '#shared/types'

definePageMeta({ middleware: 'auth' })

const route = useRoute()
const router = useRouter()
const nickname = computed(() => String(route.params.nickname))
useHead({ title: () => `${nickname.value} · Gosto em Comum` })

const { data, status, error } = await useFetch<PersonDetail>(
  () => `/api/people/${encodeURIComponent(nickname.value)}`,
)

/** Volta pelo histórico quando viemos da lista, para manter a busca e a página. */
function voltar() {
  const back = window.history.state?.back as string | undefined
  if (back && /^\/pessoas(\?|$)/.test(back)) router.back()
  else router.push('/pessoas')
}
</script>

<template>
  <div class="space-y-6">
    <UButton icon="i-lucide-arrow-left" color="neutral" variant="ghost" size="sm" @click="voltar">
      Pessoas
    </UButton>

    <div v-if="status === 'pending' && !data" class="space-y-2">
      <USkeleton class="h-9 w-1/2" />
      <USkeleton v-for="i in 10" :key="i" class="h-14 w-full" />
    </div>

    <UAlert
      v-else-if="error"
      color="warning"
      variant="soft"
      icon="i-lucide-user-x"
      :title="errorStatus(error) === 404 ? 'Perfil não encontrado' : errorMessage(error)"
      :actions="[{ label: 'Ver todas as pessoas', to: '/pessoas' }]"
    />

    <template v-else-if="data">
      <h1 class="text-2xl font-bold flex flex-wrap items-center gap-2 min-w-0">
        <span class="truncate">{{ data.person.nickname }}</span>
        <UBadge v-if="data.person.isMe" color="primary" variant="soft">você</UBadge>
        <UBadge v-if="data.person.isSample" color="neutral" variant="outline">exemplo</UBadge>
      </h1>

      <UAlert
        v-if="data.person.isMe"
        color="info"
        variant="soft"
        icon="i-lucide-info"
        title="Este é o seu ranking"
        :actions="[{ label: 'Editar ranking', to: '/ranking' }]"
      />

      <UAlert
        v-else-if="!data.viewerHasRanking"
        color="info"
        variant="soft"
        icon="i-lucide-list-ordered"
        title="Monte seu ranking para ver o que vocês têm em comum"
        :actions="[{ label: 'Montar ranking', to: '/ranking' }]"
      />

      <div
        v-else-if="data.comparison?.comparable"
        class="rounded-lg border border-default p-4 flex flex-wrap items-center gap-3"
      >
        <SimilarityBadge :similarity="data.comparison.similarity" size="lg" />
        <p class="text-sm flex-1 min-w-48">
          {{ data.comparison.inversions }}
          {{ data.comparison.inversions === 1 ? 'inversão' : 'inversões' }} de
          {{ data.comparison.maxInversions }} pares ·
          {{ data.comparison.commonCount }} músicas em comum
        </p>
        <UButton
          :to="`/comparar/${encodeURIComponent(data.person.nickname)}`"
          trailing-icon="i-lucide-arrow-right"
          size="sm"
          variant="soft"
        >
          Ver comparação detalhada
        </UButton>
      </div>

      <UAlert
        v-else-if="data.comparison"
        color="neutral"
        variant="soft"
        icon="i-lucide-info"
        title="Vocês têm menos de 3 músicas em comum"
        :description="
          data.comparison.commonCount === 0
            ? 'Nenhuma música do seu ranking está no ranking dessa pessoa.'
            : `${data.comparison.commonCount} ${data.comparison.commonCount === 1 ? 'música' : 'músicas'} em comum (destacadas abaixo).`
        "
      />

      <ol class="space-y-2">
        <li
          v-for="entry in data.ranking"
          :key="entry.song.id"
          class="flex items-center gap-3 rounded-lg border px-3 py-2"
          :class="entry.myPosition !== null ? 'border-primary bg-primary/5' : 'border-default'"
        >
          <span
            class="size-8 shrink-0 rounded-full grid place-items-center text-sm font-bold"
            :class="entry.position === 1 ? 'bg-primary text-inverted' : 'bg-accented'"
          >
            {{ entry.position }}
          </span>
          <div class="min-w-0 flex-1">
            <p class="font-medium truncate">{{ entry.song.title }}</p>
            <p class="text-sm text-muted truncate">{{ entry.song.artist }} · {{ entry.song.genre }}</p>
          </div>
          <UBadge v-if="entry.myPosition !== null" color="primary" variant="soft" class="shrink-0 tabular-nums">
            você: {{ entry.myPosition }}º
          </UBadge>
        </li>
      </ol>
    </template>
  </div>
</template>

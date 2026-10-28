<script setup lang="ts">
const { profile, logout } = useProfile()
const route = useRoute()

const links = [
  { label: 'Ranking', to: '/ranking', icon: 'i-lucide-list-ordered' },
  { label: 'Semelhantes', to: '/semelhantes', icon: 'i-lucide-users' },
  { label: 'Recomendações', to: '/recomendacoes', icon: 'i-lucide-sparkles' },
  { label: 'Pessoas', to: '/pessoas', icon: 'i-lucide-contact' },
]

async function sair() {
  await logout()
  await navigateTo('/')
}
</script>

<template>
  <div class="min-h-dvh flex flex-col">
    <header class="border-b border-default bg-default/80 backdrop-blur sticky top-0 z-10">
      <div class="mx-auto max-w-4xl px-4 py-3 flex flex-wrap items-center gap-x-4 gap-y-2">
        <NuxtLink to="/" class="font-bold text-lg flex items-center gap-2 mr-auto">
          <UIcon name="i-lucide-music-4" class="text-primary size-6" />
          Gosto em Comum
        </NuxtLink>

        <template v-if="profile">
          <span class="text-sm text-muted flex items-center gap-1 min-w-0">
            <UIcon name="i-lucide-user" class="shrink-0" />
            <span class="truncate">{{ profile.nickname }}</span>
          </span>
          <UButton size="sm" color="neutral" variant="ghost" icon="i-lucide-log-out" @click="sair">
            Sair
          </UButton>
        </template>

        <nav v-if="profile" class="w-full flex gap-1 overflow-x-auto -mx-1 px-1">
          <UButton
            v-for="l in links"
            :key="l.to"
            :to="l.to"
            :icon="l.icon"
            size="sm"
            :variant="route.path.startsWith(l.to) ? 'soft' : 'ghost'"
            :color="route.path.startsWith(l.to) ? 'primary' : 'neutral'"
          >
            {{ l.label }}
          </UButton>
        </nav>
      </div>
    </header>

    <main class="flex-1 mx-auto w-full max-w-4xl px-4 py-6">
      <slot />
    </main>

    <footer class="text-center text-xs text-muted py-4 px-4">
      Semelhança calculada pela contagem de inversões com divisão e conquista (merge sort)
    </footer>
  </div>
</template>

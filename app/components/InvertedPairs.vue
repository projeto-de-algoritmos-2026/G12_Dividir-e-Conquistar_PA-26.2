<script setup lang="ts">
import type { InvertedPair } from '#shared/types'

defineProps<{ pairs: InvertedPair[]; otherNickname: string }>()
</script>

<template>
  <div>
    <p v-if="pairs.length === 0" class="text-muted text-center py-6 border border-dashed border-default rounded-lg">
      Nenhum par invertido: vocês ordenaram as músicas em comum exatamente do mesmo jeito.
    </p>
    <ul v-else class="divide-y divide-default border border-default rounded-lg">
      <li v-for="(p, i) in pairs" :key="i" class="px-3 py-2 text-sm space-y-1">
        <p>
          <span class="text-muted">Você:</span>
          <strong>{{ p.a.title }}</strong> <span class="text-muted">({{ p.myPositions[0] }}º)</span>
          antes de
          <strong>{{ p.b.title }}</strong> <span class="text-muted">({{ p.myPositions[1] }}º)</span>
        </p>
        <p>
          <span class="text-muted">{{ otherNickname }}:</span>
          <strong>{{ p.b.title }}</strong> <span class="text-muted">({{ p.otherPositions[1] }}º)</span>
          antes de
          <strong>{{ p.a.title }}</strong> <span class="text-muted">({{ p.otherPositions[0] }}º)</span>
        </p>
      </li>
    </ul>
  </div>
</template>

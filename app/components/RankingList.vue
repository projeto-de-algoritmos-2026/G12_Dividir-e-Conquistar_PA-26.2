<script setup lang="ts">
import { VueDraggable } from 'vue-draggable-plus'
import type { Song } from '#shared/types'

const songs = defineModel<Song[]>({ required: true })

function remove(id: number) {
  songs.value = songs.value.filter((s) => s.id !== id)
}
</script>

<template>
  <div>
    <VueDraggable
      v-model="songs"
      tag="ol"
      handle=".drag-handle"
      :animation="150"
      ghost-class="opacity-40"
      class="space-y-2"
    >
      <li
        v-for="(song, i) in songs"
        :key="song.id"
        class="flex items-center gap-2 rounded-lg border border-default bg-elevated/50 px-2 py-2"
      >
        <span
          class="drag-handle touch-none cursor-grab active:cursor-grabbing p-2 text-muted"
          aria-label="Arrastar para reordenar"
        >
          <UIcon name="i-lucide-grip-vertical" class="size-5" />
        </span>
        <span
          class="size-8 shrink-0 rounded-full grid place-items-center text-sm font-bold"
          :class="i === 0 ? 'bg-primary text-inverted' : 'bg-accented'"
        >
          {{ i + 1 }}
        </span>
        <div class="min-w-0 flex-1">
          <p class="font-medium truncate">{{ song.title }}</p>
          <p class="text-sm text-muted truncate">{{ song.artist }} · {{ song.genre }}</p>
        </div>
        <UButton
          icon="i-lucide-x"
          color="neutral"
          variant="ghost"
          size="sm"
          :aria-label="`Remover ${song.title}`"
          @click="remove(song.id)"
        />
      </li>
    </VueDraggable>

    <p v-if="songs.length === 0" class="text-center text-muted py-8 border border-dashed border-default rounded-lg">
      Adicione músicas pela busca. A primeira posição é a sua favorita.
    </p>
  </div>
</template>

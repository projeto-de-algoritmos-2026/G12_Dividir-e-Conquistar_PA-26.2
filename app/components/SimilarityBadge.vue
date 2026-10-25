<script setup lang="ts">
const props = withDefaults(defineProps<{ similarity: number; size?: 'sm' | 'md' | 'lg' }>(), { size: 'md' })

const percent = computed(() => Math.round(props.similarity * 100))
const color = computed(() => (percent.value >= 70 ? 'success' : percent.value >= 40 ? 'warning' : 'neutral'))
</script>

<template>
  <UBadge :color="color" variant="subtle" :size="size" class="tabular-nums font-semibold">
    {{ percent }}%
  </UBadge>
</template>

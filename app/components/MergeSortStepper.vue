<script setup lang="ts">
import type { TraceStep } from '#shared/types'

const props = defineProps<{
  steps: TraceStep[]
  /** Array inicial (posições do outro na minha ordem). */
  initial: number[]
  /** Rótulo opcional de cada valor (ex.: título da música), mostrado ao passar o mouse. */
  labels?: Record<number, string>
}>()

const index = ref(0)
watch(() => props.steps, () => (index.value = 0))

const total = computed(() => props.steps.length)
const step = computed(() => props.steps[index.value])
const accumulated = computed(() =>
  props.steps.slice(0, index.value + 1).reduce((sum, s) => sum + s.splitCount, 0),
)
const finalCount = computed(() => props.steps.reduce((sum, s) => sum + s.splitCount, 0))
const isLast = computed(() => index.value === total.value - 1)
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-center gap-2">
      <span class="text-sm text-muted">Array inicial:</span>
      <span
        v-for="(v, i) in initial"
        :key="i"
        class="chip"
        :title="labels?.[v]"
      >{{ v }}</span>
    </div>

    <p v-if="total === 0" class="text-muted text-sm">Com só um elemento não há o que dividir.</p>

    <template v-else-if="step">
      <div class="flex items-center gap-2">
        <UButton
          icon="i-lucide-chevron-left"
          color="neutral"
          variant="outline"
          :disabled="index === 0"
          aria-label="Passo anterior"
          @click="index--"
        >
          <span class="hidden sm:inline">Anterior</span>
        </UButton>
        <span class="flex-1 text-center text-sm tabular-nums" data-testid="step-indicator">
          Passo {{ index + 1 }} de {{ total }}
        </span>
        <UButton
          trailing-icon="i-lucide-chevron-right"
          :disabled="isLast"
          aria-label="Próximo passo"
          @click="index++"
        >
          <span class="hidden sm:inline">Próximo</span>
        </UButton>
      </div>

      <div
        class="rounded-lg border border-default p-3 space-y-3"
        :style="{ marginLeft: `${Math.min(step.depth, 4) * 0.75}rem` }"
      >
        <div class="flex items-center gap-2 text-sm">
          <UBadge :color="step.kind === 'divide' ? 'info' : 'primary'" variant="soft">
            {{ step.kind === 'divide' ? 'Dividir' : 'Mesclar e contar' }}
          </UBadge>
          <span class="text-muted">
            nível {{ step.depth }} · posições {{ step.range[0] + 1 }}–{{ step.range[1] }}
          </span>
        </div>

        <template v-if="step.kind === 'divide'">
          <p class="text-sm">O trecho é partido ao meio; cada metade é resolvida recursivamente.</p>
          <div class="flex flex-wrap items-center gap-3">
            <div class="flex gap-1">
              <span v-for="(v, i) in step.left" :key="`l${i}`" class="chip" :title="labels?.[v]">{{ v }}</span>
            </div>
            <UIcon name="i-lucide-split" class="text-muted rotate-90" />
            <div class="flex gap-1">
              <span v-for="(v, i) in step.right" :key="`r${i}`" class="chip" :title="labels?.[v]">{{ v }}</span>
            </div>
          </div>
        </template>

        <template v-else>
          <p class="text-sm">
            As duas metades já estão ordenadas. Ao mesclar, sempre que um número da direita sai antes
            dos que restam na esquerda, ele forma uma inversão com cada um deles.
          </p>
          <div class="grid gap-2 sm:grid-cols-[auto_1fr] items-center text-sm">
            <span class="text-muted">Esquerda</span>
            <div class="flex flex-wrap gap-1">
              <span v-for="(v, i) in step.left" :key="`l${i}`" class="chip" :title="labels?.[v]">{{ v }}</span>
            </div>
            <span class="text-muted">Direita</span>
            <div class="flex flex-wrap gap-1">
              <span v-for="(v, i) in step.right" :key="`r${i}`" class="chip" :title="labels?.[v]">{{ v }}</span>
            </div>
            <span class="text-muted">Resultado</span>
            <div class="flex flex-wrap gap-1">
              <span v-for="(v, i) in step.merged" :key="`m${i}`" class="chip chip-primary" :title="labels?.[v]">{{ v }}</span>
            </div>
          </div>
          <p class="font-semibold" :class="step.splitCount > 0 ? 'text-warning' : 'text-muted'">
            +{{ step.splitCount }} {{ step.splitCount === 1 ? 'inversão' : 'inversões' }} entre as metades
          </p>
        </template>
      </div>

      <p class="text-sm">
        Inversões acumuladas: <strong class="tabular-nums" data-testid="accumulated">{{ accumulated }}</strong>
        <span v-if="isLast" class="text-muted"> = total de {{ finalCount }}</span>
      </p>
    </template>
  </div>
</template>

<style scoped>
.chip {
  display: inline-grid;
  place-items: center;
  min-width: 2rem;
  height: 2rem;
  padding: 0 0.4rem;
  border-radius: 0.375rem;
  font-variant-numeric: tabular-nums;
  font-weight: 600;
  background: var(--ui-bg-accented);
}
.chip-primary {
  background: var(--ui-primary);
  color: var(--ui-bg);
}
</style>

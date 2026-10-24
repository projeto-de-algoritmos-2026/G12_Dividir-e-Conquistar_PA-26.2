<script setup lang="ts">
const { ensure, login, hasRanking } = useProfile()

// já entrou: vai direto para a próxima etapa
if (await ensure()) {
  await navigateTo(hasRanking.value ? '/semelhantes' : '/ranking', { replace: true })
}

const nickname = ref('')
const error = ref('')
const loading = ref(false)

async function entrar() {
  error.value = ''
  loading.value = true
  try {
    const info = await login(nickname.value)
    await navigateTo(info.hasRanking ? '/semelhantes' : '/ranking')
  } catch (err) {
    error.value = errorMessage(err)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="max-w-md mx-auto pt-6 sm:pt-12 space-y-8">
    <div class="space-y-3 text-center">
      <h1 class="text-3xl font-bold">Descubra quem tem o seu gosto musical</h1>
      <p class="text-muted">
        Ordene suas 10 músicas favoritas e compare com outras pessoas. A semelhança é medida
        contando quantos pares de músicas vocês ordenaram de forma diferente.
      </p>
    </div>

    <UCard>
      <form class="space-y-4" @submit.prevent="entrar">
        <UFormField
          label="Seu apelido"
          help="De 3 a 20 caracteres: letras, números, _ ou -. Use o mesmo apelido para voltar ao seu perfil."
          :error="error || undefined"
        >
          <UInput
            v-model="nickname"
            placeholder="ex.: caio_99"
            size="lg"
            class="w-full"
            autofocus
            autocomplete="username"
            icon="i-lucide-user"
          />
        </UFormField>
        <UButton type="submit" size="lg" block :loading="loading" trailing-icon="i-lucide-arrow-right">
          Entrar
        </UButton>
      </form>
    </UCard>
  </div>
</template>

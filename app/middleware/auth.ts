declare module '#app' {
  interface PageMeta {
    requireRanking?: boolean
  }
}

/** Sem apelido → tela de entrada; páginas com `requireRanking` sem ranking → tela do ranking. */
export default defineNuxtRouteMiddleware(async (to) => {
  const { ensure, hasRanking } = useProfile()
  const profile = await ensure()
  if (!profile) return navigateTo('/')
  if (to.meta.requireRanking && !hasRanking.value) {
    return navigateTo({ path: '/ranking', query: { aviso: 'monte' } })
  }
})

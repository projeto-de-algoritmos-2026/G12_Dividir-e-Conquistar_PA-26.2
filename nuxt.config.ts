export default defineNuxtConfig({
  compatibilityDate: '2026-11-01',
  devtools: { enabled: false },
  modules: ['@nuxt/ui'],
  css: ['~/assets/css/main.css'],
  typescript: { strict: true },
  app: {
    head: {
      htmlAttrs: { lang: 'pt-BR' },
      title: 'Gosto em Comum',
    },
  },
  nitro: {
    externals: { external: ['better-sqlite3'] },
  },
})

import type { Me, SessionInfo } from '#shared/types'

/** Perfil da sessão atual, compartilhado entre páginas e servidor (SSR). */
export function useProfile() {
  const profile = useState<Me | null>('profile', () => null)
  const loaded = useState('profile-loaded', () => false)
  const requestFetch = useRequestFetch()

  async function refresh() {
    try {
      profile.value = await requestFetch<Me>('/api/me')
    } catch {
      profile.value = null
    }
    loaded.value = true
    return profile.value
  }

  async function ensure() {
    if (!loaded.value) await refresh()
    return profile.value
  }

  async function login(nickname: string) {
    const info = await $fetch<SessionInfo>('/api/session', { method: 'POST', body: { nickname } })
    await refresh()
    return info
  }

  async function logout() {
    await $fetch('/api/session', { method: 'DELETE' })
    profile.value = null
    loaded.value = true
  }

  const hasRanking = computed(() => (profile.value?.ranking.length ?? 0) > 0)

  return { profile, hasRanking, refresh, ensure, login, logout }
}

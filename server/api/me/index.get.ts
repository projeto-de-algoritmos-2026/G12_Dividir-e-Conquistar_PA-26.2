import type { Me } from '#shared/types'

export default defineEventHandler((event): Me => buildMe(requireProfile(event)))

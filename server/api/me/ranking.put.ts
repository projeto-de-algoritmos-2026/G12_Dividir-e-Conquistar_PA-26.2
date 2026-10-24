import type { Me } from '#shared/types'

const SIZE = 10

/** Salva o ranking completo (10 músicas distintas do catálogo), substituindo o anterior. */
export default defineEventHandler(async (event): Promise<Me> => {
  const profile = requireProfile(event)
  const { songIds } = await readValid(event, rankingBodySchema, 422)

  if (songIds.length < SIZE) {
    const missing = SIZE - songIds.length
    throw createError({
      statusCode: 422,
      message: missing === 1 ? 'Falta 1 música' : `Faltam ${missing} músicas`,
    })
  }
  if (songIds.length > SIZE) {
    throw createError({ statusCode: 422, message: `Escolha no máximo ${SIZE} músicas` })
  }
  if (new Set(songIds).size !== songIds.length) {
    throw createError({ statusCode: 422, message: 'Música repetida no ranking' })
  }
  if (loadSongs(songIds).size !== songIds.length) {
    throw createError({ statusCode: 422, message: 'Música não encontrada no catálogo' })
  }

  const db = useDb()
  const insert = db.prepare('INSERT INTO ranking_entries (profile_id, position, song_id) VALUES (?, ?, ?)')
  db.transaction(() => {
    db.prepare('DELETE FROM ranking_entries WHERE profile_id = ?').run(profile.id)
    songIds.forEach((id, i) => insert.run(profile.id, i + 1, id))
    db.prepare('UPDATE profiles SET updated_at = ? WHERE id = ?').run(new Date().toISOString(), profile.id)
  })()

  return buildMe(profile)
})

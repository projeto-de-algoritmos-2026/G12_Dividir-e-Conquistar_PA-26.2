import { z } from 'zod'

export const NICKNAME_RULE = 'O apelido deve ter de 3 a 20 caracteres: letras, números, _ ou -'

export const nicknameSchema = z
  .string({ error: NICKNAME_RULE })
  .trim()
  .regex(/^[A-Za-z0-9_-]{3,20}$/, { error: NICKNAME_RULE })

export const sessionBodySchema = z.object({ nickname: nicknameSchema })

/** A contagem exata (10) é conferida na rota, para gerar a mensagem certa. */
export const rankingBodySchema = z.object({
  songIds: z.array(z.number().int().positive(), { error: 'Envie a lista de músicas do ranking' }),
})

/** Lê o corpo e valida; erros viram 400 (ou o status pedido) com a primeira mensagem. */
export async function readValid<T extends z.ZodType>(
  event: Parameters<typeof readBody>[0],
  schema: T,
  statusCode = 400,
): Promise<z.infer<T>> {
  const body = await readBody(event).catch(() => undefined)
  const result = schema.safeParse(body ?? {})
  if (!result.success) {
    throw createError({ statusCode, message: result.error.issues[0]?.message ?? 'Dados inválidos' })
  }
  return result.data
}

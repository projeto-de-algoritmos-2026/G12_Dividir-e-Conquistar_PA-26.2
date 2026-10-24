/** Mensagem em português vinda da API (ou uma genérica). */
export function errorMessage(err: unknown, fallback = 'Algo deu errado, tente de novo'): string {
  const e = err as { data?: { message?: string }; statusMessage?: string } | null
  return e?.data?.message || e?.statusMessage || fallback
}

export function errorStatus(err: unknown): number | undefined {
  const e = err as { statusCode?: number; status?: number; response?: { status?: number } } | null
  return e?.statusCode ?? e?.status ?? e?.response?.status
}

// ============================================================================
// Shared OpenAI-compatible chat client.
// Groq, OpenRouter, and Cerebras all speak the OpenAI /chat/completions API,
// so they share this one fetch implementation; only base URL / key / model
// differ. Gemini is NOT OpenAI-compatible and has its own adapter.
//
// Errors are thrown as ProviderError with:
//   provider   which provider failed
//   status     HTTP status (or null for network/timeout)
//   reason     'rate-limited'|'server-error'|'timeout'|'network'
//              |'auth-failed'|'bad-request'|'key-missing'|'unknown'
//   retryable  true  → the fallback chain should try the NEXT provider
//              false → stop the chain (only for 400 = malformed prompt; the
//                      same prompt will fail everywhere, so don't burn calls)
// ============================================================================

export class ProviderError extends Error {
  constructor(provider, { status = null, reason = 'unknown', retryable = true, body = '' } = {}) {
    super(`[${provider}] ${reason}${status ? ` (HTTP ${status})` : ''}${body ? `: ${body}` : ''}`)
    this.name = 'ProviderError'
    this.provider = provider
    this.status = status
    this.reason = reason
    this.retryable = retryable
    this.body = body
  }
}

function classify(provider, status, body) {
  if (status === 400) return new ProviderError(provider, { status, reason: 'bad-request', retryable: false, body })
  if (status === 401 || status === 403)
    return new ProviderError(provider, { status, reason: 'auth-failed', retryable: true, body })
  if (status === 429) return new ProviderError(provider, { status, reason: 'rate-limited', retryable: true, body })
  if (status >= 500) return new ProviderError(provider, { status, reason: 'server-error', retryable: true, body })
  return new ProviderError(provider, { status, reason: 'unknown', retryable: true, body })
}

/**
 * Call an OpenAI-compatible chat-completions endpoint.
 *
 * @param {object} opts
 * @param {string} opts.provider   display name (for errors/logs)
 * @param {string} opts.baseUrl    e.g. https://api.groq.com/openai/v1
 * @param {string} opts.apiKey
 * @param {string} opts.model
 * @param {Array<{role:string,content:string}>} opts.messages
 * @param {number} [opts.timeoutMs=8000]
 * @param {number} [opts.maxTokens=800]
 * @param {object} [opts.extraHeaders]
 * @returns {Promise<string>} assistant message content
 */
export async function callOpenAICompatible({
  provider,
  baseUrl,
  apiKey,
  model,
  messages,
  timeoutMs = 8000,
  maxTokens = 800,
  extraHeaders = {},
}) {
  if (!apiKey) throw new ProviderError(provider, { reason: 'key-missing', retryable: true })
  if (!model) throw new ProviderError(provider, { reason: 'key-missing', retryable: true, body: 'model env var not set' })

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  let res
  try {
    res = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        ...extraHeaders,
      },
      body: JSON.stringify({ model, messages, max_tokens: maxTokens, temperature: 0.6 }),
      signal: controller.signal,
    })
  } catch (err) {
    clearTimeout(timer)
    if (err?.name === 'AbortError')
      throw new ProviderError(provider, { reason: 'timeout', retryable: true, body: `>${timeoutMs}ms` })
    throw new ProviderError(provider, { reason: 'network', retryable: true, body: err?.message || 'fetch failed' })
  }
  clearTimeout(timer)

  if (!res.ok) {
    const body = (await res.text().catch(() => '')).slice(0, 500)
    throw classify(provider, res.status, body)
  }

  const data = await res.json().catch(() => null)
  const content = data?.choices?.[0]?.message?.content
  if (!content) {
    throw new ProviderError(provider, {
      status: res.status,
      reason: 'unknown',
      retryable: true,
      body: 'empty/invalid completion payload',
    })
  }
  return content.trim()
}

// Cerebras — OpenAI-compatible. Reads CEREBRAS_API_KEY / CEREBRAS_MODEL.
import { callOpenAICompatible } from './openaiCompatible.js'

export const CEREBRAS_PROVIDER = 'cerebras'

export function callCerebras(messages, opts = {}) {
  return callOpenAICompatible({
    provider: CEREBRAS_PROVIDER,
    baseUrl: 'https://api.cerebras.ai/v1',
    apiKey: process.env.CEREBRAS_API_KEY,
    // Env wins; default keeps prod working if CEREBRAS_MODEL isn't set.
    // (gpt-oss-120b is valid for the current key; llama-3.3-70b 404s.)
    model: process.env.CEREBRAS_MODEL || 'gpt-oss-120b',
    messages,
    ...opts,
  })
}

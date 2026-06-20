// Cerebras — OpenAI-compatible. Reads CEREBRAS_API_KEY / CEREBRAS_MODEL.
import { callOpenAICompatible } from './openaiCompatible.js'

export const CEREBRAS_PROVIDER = 'cerebras'

export function callCerebras(messages, opts = {}) {
  return callOpenAICompatible({
    provider: CEREBRAS_PROVIDER,
    baseUrl: 'https://api.cerebras.ai/v1',
    apiKey: process.env.CEREBRAS_API_KEY,
    model: process.env.CEREBRAS_MODEL,
    messages,
    ...opts,
  })
}

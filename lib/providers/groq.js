// Groq — OpenAI-compatible. Reads GROQ_API_KEY / GROQ_MODEL from env.
import { callOpenAICompatible } from './openaiCompatible.js'

export const GROQ_PROVIDER = 'groq'

export function callGroq(messages, opts = {}) {
  return callOpenAICompatible({
    provider: GROQ_PROVIDER,
    baseUrl: 'https://api.groq.com/openai/v1',
    apiKey: process.env.GROQ_API_KEY,
    model: process.env.GROQ_MODEL,
    messages,
    ...opts,
  })
}

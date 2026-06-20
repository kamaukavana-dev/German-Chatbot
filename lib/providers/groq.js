// Groq — OpenAI-compatible. Reads GROQ_API_KEY / GROQ_MODEL from env.
import { callOpenAICompatible } from './openaiCompatible.js'

export const GROQ_PROVIDER = 'groq'

export function callGroq(messages, opts = {}) {
  return callOpenAICompatible({
    provider: GROQ_PROVIDER,
    baseUrl: 'https://api.groq.com/openai/v1',
    apiKey: process.env.GROQ_API_KEY,
    // Env wins; default keeps prod working if GROQ_MODEL isn't set.
    model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
    messages,
    ...opts,
  })
}

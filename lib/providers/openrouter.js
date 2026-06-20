// OpenRouter — OpenAI-compatible. Reads OPENROUTER_API_KEY / OPENROUTER_MODEL.
import { callOpenAICompatible } from './openaiCompatible.js'

export const OPENROUTER_PROVIDER = 'openrouter'

export function callOpenRouter(messages, opts = {}) {
  return callOpenAICompatible({
    provider: OPENROUTER_PROVIDER,
    baseUrl: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY,
    model: process.env.OPENROUTER_MODEL,
    messages,
    // Optional attribution headers recommended by OpenRouter.
    extraHeaders: {
      'HTTP-Referer': 'https://github.com/kamaukavana-dev/German-Chatbot',
      'X-Title': 'HANS German Tutor',
    },
    ...opts,
  })
}

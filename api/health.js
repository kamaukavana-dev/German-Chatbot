// ============================================================================
// GET /api/health — Vercel serverless function.
// Exact mirror of the original Express GET /api/health in backend/server.js.
// ============================================================================
const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash'
const apiKey = process.env.GEMINI_API_KEY

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()

  return res.status(200).json({ ok: true, hasKey: Boolean(apiKey), model: MODEL })
}

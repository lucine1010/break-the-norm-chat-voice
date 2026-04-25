import { GoogleGenAI } from '@google/genai'

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY })

export async function getGuidance({ messages, move, playstyle }) {
  const chatHistory = messages
    .map((m) => `${m.sender === 'me' ? 'User' : 'Match'}: ${m.text}`)
    .join('\n')

  const prompt = `
You are a conversation guide inside a dating app prototype.
The user has a chat playstyle: "${playstyle || 'not set'}".

Here is the current conversation:
${chatHistory}

The user chose the move: "${move}"

Reply with ONLY a valid JSON object — no markdown, no code fences, no extra text.
The JSON must have exactly two fields:
{
  "effect": "One short sentence (max 12 words) explaining why this move fits right now.",
  "example": "One natural, short example sentence the user could say. Do NOT write for them — this is just inspiration."
}

Rules:
- effect: plain English, max 12 words, no quotes around it
- example: max 20 words, first-person, casual, natural tone
- Do NOT write a full reply the user should copy
- Do NOT include any explanation outside the JSON
`.trim()

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  })

  const raw = (response.text ?? '').trim()
  const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim()
  const parsed = JSON.parse(cleaned)

  console.log('[gemini] AI guidance generated')

  return {
    effect: parsed.effect ?? 'This move fits the current moment.',
    example: parsed.example ?? 'Keep it natural and use your own words.',
  }
}

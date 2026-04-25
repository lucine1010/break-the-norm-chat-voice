// ── Elisa reply via OpenAI (complex messages only) ───────────────────────────

export async function getElisaReply(userMessage, recentMessages) {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY
  if (!apiKey) return null

  const history = recentMessages.slice(-5)
    .map((m) => `${m.sender === 'me' ? 'User' : 'Elisa'}: ${m.text}`)
    .join('\n')

  const prompt = `
You are Elisa in a casual dating app chat.

Recent conversation:
${history}

User just said: "${userMessage}"

Reply as Elisa. Rules:
- Directly respond to exactly what the user said
- If they ask a playful/hypothetical question, play along naturally
- If they share something personal or unusual, react genuinely
- Keep it casual and under 2 sentences
- Do NOT give advice or mention AI
- Reply ONLY as Elisa's message — no labels, no quotes
`.trim()

  try {
    const res = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ model: 'gpt-4.1-mini', input: prompt }),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    const text = (data?.output?.[0]?.content?.[0]?.text ?? '').trim()
    return text || null
  } catch (err) {
    console.warn('[elisa] OpenAI reply failed:', err.message)
    return null
  }
}

// ── Complexity detector — true means OpenAI should handle the reply ───────────

export function isComplexMessage(text) {
  const t = text.toLowerCase()
  // Hypothetical / imaginative
  if (/\bimagine\b|\bwhat if\b|\bwould you\b|\bcould you\b|\bif you (were|could|had)\b/.test(t)) return true
  // Playful "ever" scenarios
  if (/\bever\b.{0,30}(hike|trail|squirrel|trip|see|watch|try|eat|meet|find|hear)/.test(t)) return true
  // Personal story signals
  if (/\bthis one time\b|\bi remember\b|\bonce when\b|\bonce i\b|\btrue story\b/.test(t)) return true
  // Creative / game prompts not covered by emoji rule
  if (/\bdescribe\b|\bpick (one|a|your)\b|\brate\b|\brank\b/.test(t)) return true
  // Jokes or punchlines
  if (/\btell me a\b|\bhere's a joke\b|\bknock knock\b/.test(t)) return true
  // Unusual/niche vocabulary (photobomb, vibe-check, etc.)
  if (/photobomb|vibe.?check|plot.?twist|unpopular opinion|hot take|main character/.test(t)) return true
  // Long personal share (> 10 words, no clear topic match)
  const wordCount = text.trim().split(/\s+/).length
  if (wordCount > 12) return true
  return false
}

// ─────────────────────────────────────────────────────────────────────────────

const fallbackByMove = {
  Safe:       { effect: 'Keeps the vibe warm and comfortable.',            example: 'That sounds fun — what was the best part?' },
  Curious:    { effect: 'Shows interest and keeps the conversation going.', example: 'What made that moment stand out for you?' },
  Relatable:  { effect: 'Builds connection through shared experience.',     example: "I totally get that — I needed a reset too." },
  Unexpected: { effect: 'Adds energy when the chat feels predictable.',     example: 'Quick game: describe your mood in 3 emojis.' },
}

export async function getGuidance({ messages, move, playstyle }) {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY

  if (!apiKey) {
    console.warn('[guide] Missing API key — using fallback guidance')
    return fallbackByMove[move] ?? fallbackByMove.Safe
  }

  const recentMessages = messages.slice(-6)
  const chatHistory = recentMessages
    .map((m) => `${m.sender === 'me' ? 'User' : 'Match'}: ${m.text}`)
    .join('\n')

  const lastPartnerMsg = [...messages].reverse().find((m) => m.sender === 'match')
  const latestPartnerMessage = lastPartnerMsg?.text ?? '(no message yet)'

  const prompt = `
You are a conversation guide inside a dating app prototype.
The user has a chat playstyle: "${playstyle || 'not set'}".

Recent conversation (last few messages):
${chatHistory}

The LAST message from their match is:
"${latestPartnerMessage}"

The user chose the move: "${move}"

Your job:
1. Write a short "effect" explaining why this move fits the current moment (based on the last match message).
2. Write a short "example" — a natural reply the user could say IN RESPONSE TO the last match message above.
   - If the match asked a question, the example should answer it first.
   - If the match said something, the example should react to it.
   - Apply the "${move}" style (Safe = warm/easy, Curious = question-based, Relatable = share own experience, Unexpected = surprising/playful).
   - Do NOT write a generic reply. Be specific to what the match just said.

Reply with ONLY a valid JSON object — no markdown, no code fences, no extra text.
{
  "effect": "One short sentence (max 12 words) on why this move fits right now.",
  "example": "One specific, natural reply (max 20 words) that responds to the match's last message."
}

Rules:
- effect: plain English, max 12 words
- example: first-person, casual, specific to what the match said — NOT a generic phrase
- Do NOT include any explanation outside the JSON
`.trim()

  try {
    console.log('[openai] calling guide')
    console.log('[openai] key exists', !!apiKey)
    const res = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        input: prompt,
      }),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err?.error?.message ?? `HTTP ${res.status}`)
    }

    const data = await res.json()
    // Responses API: output[0].content[0].text
    const raw = (data?.output?.[0]?.content?.[0]?.text ?? '').trim()
    if (!raw) throw new Error('empty response')

    const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim()
    const parsed = JSON.parse(cleaned)

    const result = {
      effect: parsed.effect ?? 'This move fits the current moment.',
      example: parsed.example ?? 'Keep it natural and use your own words.',
    }
    console.log('[openai] response', result)
    return result
  } catch (err) {
    const is429 = err.message?.includes('429') || err.message?.includes('rate')
    console.warn('[guide] API error:', err.message)
    if (is429) throw err   // re-throw so ChatPage shows cooldown message
    return fallbackByMove[move] ?? fallbackByMove.Safe
  }
}

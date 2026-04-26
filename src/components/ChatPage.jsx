import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, Send } from 'lucide-react'
import { getGuidance, getElisaReply, isComplexMessage } from '../lib/openaiGuide'
import soundIcon from '../../img/sound1.png'

const modeOptions = [
  { label: 'Safe',       bg: 'bg-[#95e888]', border: 'border-[#6bbf60]', text: 'text-[#2d5c28]' },
  { label: 'Curious',    bg: 'bg-[#b89ae7]', border: 'border-[#8265c4]', text: 'text-[#2e1d60]' },
  { label: 'Relatable',  bg: 'bg-[#d7b37c]', border: 'border-[#a57c45]', text: 'text-[#4a2e0a]' },
  { label: 'Unexpected', bg: 'bg-[#de9b8f]', border: 'border-[#b06050]', text: 'text-[#4d1a12]' },
]

function pickReply(userText) {
  const t = userText.toLowerCase()
  const raw = userText

  // ── Emoji requests (highest priority) ────────────────────────────────────
  if (/emoji|emojis/.test(t)) {
    if (/mood|feeling|feel/.test(t))   return "🌿😌🥾"
    if (/weather|outside|day/.test(t)) return "☁️🌧️🛋️"
    if (/energy|vibe/.test(t))         return "⚡😅☕"
    // user asked for N emojis generically
    return "🌙✨😊"
  }

  // ── User sent only emojis — react to them ────────────────────────────────
  if (/^[\p{Emoji}\s]+$/u.test(raw.trim())) {
    return "Okay I feel that 😄 what's going on?"
  }

  // ── Direct question-word responses ───────────────────────────────────────
  if (/\bwhere\b/.test(t)) {
    if (/hik|trail|walk|climb|mountain/.test(t))
      return "A small trail near the lake — barely anyone goes there. It was really peaceful."
    if (/travel|trip|visit|been/.test(t))
      return "Last trip was a tiny coastal town, barely on the map. Highly recommend escaping like that."
    if (/live|from|grow up/.test(t))
      return "Pretty quiet city, nothing too exciting. You?"
    return "Somewhere I haven't been in a while honestly. Why do you ask?"
  }

  if (/\bwhat\b/.test(t)) {
    if (/music|listen|song|playlist/.test(t))
      return "Indie folk lately — something about it just fits the mood. You?"
    if (/movie|show|watch|series/.test(t))
      return "Been rewatching an old comfort show. One of those you put on when you don't want to think."
    if (/food|eat|cook|fav|favourite/.test(t))
      return "Anything homemade honestly. But I'd never say no to good ramen."
    if (/do|job|work|study/.test(t))
      return "Design, mostly digital stuff. Fun but draining some days. You?"
    return "Good question — I'd actually have to think about that. What made you ask?"
  }

  if (/\bhow\b/.test(t)) {
    if (/feel|doing|been|going/.test(t))
      return "Pretty good lately, finally getting into a rhythm. You?"
    if (/hik|trail|was it/.test(t))
      return "Really refreshing. Tiring but the view made it worth it."
    return "It was a whole process honestly — I'll spare you the details haha."
  }

  if (/\bwhen\b/.test(t)) {
    if (/last|time|was/.test(t))
      return "A few weeks ago I think? Time's been blurring together. You keeping better track?"
    return "Probably sooner than I planned. Do you map things out or just go with it?"
  }

  if (/\bwhy\b/.test(t))
    return "Honestly no deep reason — it just felt right. Does that make sense?"

  // ── Topic-based replies ───────────────────────────────────────────────────
  if (/hik|trail|outdoor|nature|walk|park|mountain|climb/.test(t))
    return "That sounds great. I went on a trail last month and it completely reset my head. Do you go often?"

  if (/food|eat|restaurant|cook|coffee|cafe|lunch|dinner|snack/.test(t))
    return "Now I'm hungry haha. I've been trying to cook more. Do you have a go-to dish?"

  if (/music|song|playlist|concert|band|listen|album/.test(t))
    return "Music is everything to me. I've had the same playlist on repeat for weeks. What are you listening to?"

  if (/movie|show|watch|netflix|series|film/.test(t))
    return "I need recommendations — my watchlist is embarrassingly empty. What's been good lately?"

  if (/work|job|busy|meeting|stress|tired/.test(t))
    return "Ugh same. Running on autopilot this week. What do you do to actually switch off?"

  if (/travel|trip|city|country|flight|visit/.test(t))
    return "I've been wanting to just book something random and go. Any place you'd go back to?"

  // ── Tone / reaction replies ───────────────────────────────────────────────
  if (/haha|lol|😂|lmao|funny|joke/.test(t))
    return "Okay that genuinely got me 😄 You're funnier than I expected."

  if (/same|agree|totally|exactly|right|true/.test(t))
    return "Right?? I feel like not enough people get that."

  if (/miss|used to|remember|nostalgic/.test(t))
    return "Aw that feeling hits different. What brought that up?"

  if (/love|obsessed|fav|favourite|best/.test(t))
    return "Tell me more — I love when people get passionate about stuff."

  if (/never|hate|don't like|can't stand/.test(t))
    return "Fair enough. I respect a strong opinion. What would you rather do?"

  // ── Generic question fallback ─────────────────────────────────────────────
  if (/\?/.test(t))
    return "Hmm, I've thought about that before. What do you think?"

  // ── Last resort — varied, no single template ─────────────────────────────
  const fallbacks = [
    "That's interesting — tell me more.",
    "I wasn't expecting that haha. Go on.",
    "Okay I want to hear more about this.",
    "Wait really? How did that happen?",
  ]
  return fallbacks[Math.floor(userText.length % fallbacks.length)]
}

const fallbackGuidance = {
  Safe:       { effect: 'Keeps the vibe warm and comfortable.',            example: 'That sounds fun — what was the best part?' },
  Curious:    { effect: 'Shows interest and keeps the conversation going.', example: 'What made that moment stand out for you?' },
  Relatable:  { effect: 'Builds connection through shared experience.',     example: "I totally get that — I needed a reset too." },
  Unexpected: { effect: 'Adds energy when the chat feels predictable.',     example: 'Quick game: describe your mood in 3 emojis.' },
}

function getConversationStatus(messages, isWaiting) {
  if (isWaiting) return 'Waiting for their reply...'
  const lastSender = messages.at(-1)?.sender
  if (lastSender === 'match') return 'Conversation: ready for next move'
  return 'Conversation: pick your move'
}

console.log("eleven key:", import.meta.env.VITE_ELEVENLABS_API_KEY)

async function playElisaVoice(text, onDone) {
  console.log("[elevenlabs] calling tts")
  console.log("[elevenlabs] key exists", !!import.meta.env.VITE_ELEVENLABS_API_KEY)
  const response = await fetch(
    "https://api.elevenlabs.io/v1/text-to-speech/EXAVITQu4vr4xnSDxMaL",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": import.meta.env.VITE_ELEVENLABS_API_KEY,
      },
      body: JSON.stringify({ text, model_id: "eleven_multilingual_v2" }),
    }
  )
  if (!response.ok) {
    console.error("[elevenlabs] error", response.status, await response.text())
    onDone()
    return
  }
  const blob = await response.blob()
  const audioUrl = URL.createObjectURL(blob)
  const audio = new Audio(audioUrl)
  audio.onended = onDone
  audio.onerror = onDone
  console.log("[elevenlabs] playing")
  audio.play()
}

const COOLDOWN_MS = 3000

function ChatPage({ userProfile, selectedMatch, chatMessages, setChatMessages, onBack }) {
  const [draft, setDraft] = useState('')
  const [selectedMove, setSelectedMove] = useState('')
  const [guidance, setGuidance] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isWaiting, setIsWaiting] = useState(false)
  const [error, setError] = useState(null)
  const [isGuideOpen, setIsGuideOpen] = useState(true)
  const [loadingVoiceMessageId, setLoadingVoiceMessageId] = useState(null)
  const bottomRef = useRef(null)
  const lastCallRef = useRef(0)   // timestamp of last Gemini guide call

  // Auto-scroll messages to bottom whenever they change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  const handleSendMessage = (event) => {
    event.preventDefault()
    const trimmed = draft.trim()
    if (!trimmed || isWaiting) return

    const userMessage = { id: `msg-${Date.now()}`, sender: 'me', text: trimmed }

    setChatMessages((prev) => [...prev, userMessage])
    setDraft('')

    // Reset guide state — turn is over
    setSelectedMove('')
    setGuidance(null)
    setError(null)
    setIsWaiting(true)

    // Hybrid: use OpenAI for complex messages, local rules for simple ones
    const complex = isComplexMessage(trimmed)
    const replyPromise = complex
      ? getElisaReply(trimmed, chatMessages)
      : Promise.resolve(null)

    const startTime = Date.now()
    replyPromise.then((aiReply) => {
      const replyText = aiReply ?? pickReply(trimmed)
      const elapsed = Date.now() - startTime
      const delay = Math.max(0, 900 - elapsed)
      window.setTimeout(() => {
        setChatMessages((prev) => [
          ...prev,
          { id: `msg-${Date.now()}`, sender: 'match', text: replyText },
        ])
        setIsWaiting(false)
      }, delay)
    })
  }

  const handleMoveSelect = async (move) => {
    console.log('[move button clicked]', move)
    // Guard: ignore if already loading
    if (isLoading) return

    // Guard: cooldown between calls
    const now = Date.now()
    if (now - lastCallRef.current < COOLDOWN_MS) {
      setError('AI is cooling down. Try again in a moment.')
      setSelectedMove(move)
      return
    }

    setSelectedMove(move)
    setGuidance(null)
    setError(null)
    setIsLoading(true)
    lastCallRef.current = now

    const requestId = crypto.randomUUID()
    console.log('[guide request start]', requestId, move)

    try {
      const result = await getGuidance({
        messages: chatMessages,
        move,
        playstyle: userProfile?.style ?? '',
      })
      console.log('[guide request end]', requestId)
      setGuidance(result)
      setError(null)
    } catch (err) {
      const is429 = err?.message?.includes('429') || err?.status === 429
      if (is429) {
        setError('AI is cooling down. Try again in a moment.')
        setGuidance(null)
      } else {
        setError(null)
        setGuidance(fallbackGuidance[move])
      }
    } finally {
      setIsLoading(false)
    }
  }

  const conversationStatus = getConversationStatus(chatMessages, isWaiting)
  // Buttons are locked while AI is loading, while waiting for mock reply,
  // or while the last message was sent by us (their reply hasn't come yet)
  const lastSender = chatMessages.at(-1)?.sender
  const moveButtonsDisabled = isLoading || isWaiting || lastSender === 'me'

  return (
    <div className="relative flex h-full flex-col bg-[#f5f1dd]">

      {/* ── Fixed header ── */}
      <header className="absolute inset-x-0 top-0 z-40 border-b-2 border-[#d4be79] bg-[#e8d79b] px-4 pt-3 pb-2">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#be8618] bg-[#d38f12] text-[#fff8e7]"
            aria-label="Back"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="pixel-title text-sm text-[#a56d10]">
              {selectedMatch?.name ?? 'Anna'}
            </h1>
            <p className="text-[10px] text-[#8d6e28]">● online</p>
          </div>
        </div>
      </header>

      {/* ── Scrollable messages ── */}
      <section className={`flex min-h-0 flex-1 flex-col pt-[62px] ${isGuideOpen ? 'pb-[272px]' : 'pb-[100px]'}`}>
        <div className="flex-1 overflow-y-auto px-3 pt-2 no-scrollbar pb-safe">
          <div className="space-y-2">
            {chatMessages.map((message) => (
              <article
                key={message.id}
                className={`relative max-w-[85%] rounded-md border-2 py-2 text-sm leading-relaxed ${
                  message.sender === 'me'
                    ? 'ml-auto border-[#bfd0e7] bg-[#d6e2f0] px-3 text-[#4a5970]'
                    : 'border-[#99d989] bg-[#bff2b2] pl-3 pr-11 text-[#3d6138]'
                }`}
              >
                {message.text}
                {message.sender === 'match' && (
                  <button
                    type="button"
                    disabled={loadingVoiceMessageId === message.id}
                    onClick={() => {
                      setLoadingVoiceMessageId(message.id)
                      playElisaVoice(message.text, () => setLoadingVoiceMessageId(null))
                    }}
                    style={{ position: 'absolute', top: 8, right: 10, background: 'transparent', border: 'none', padding: 0, cursor: 'pointer' }}
                    className="opacity-60 hover:opacity-100 disabled:opacity-30"
                    aria-label="Play voice"
                  >
                    <img src={soundIcon} alt="Play voice" style={{ width: 24, height: 24 }} />
                  </button>
                )}
              </article>
            ))}
            {/* Typing indicator while waiting for mock reply */}
            {isWaiting && (
              <p className="text-[11px] text-[#8a7040] italic">
                {selectedMatch?.name ?? 'Anna'} is typing...
              </p>
            )}
            <div ref={bottomRef} />
          </div>
        </div>
      </section>

      {/* ── Inline guide panel (above input) ── */}
      <div className="absolute inset-x-0 bottom-[54px] z-40 rounded-t-2xl border-t-2 border-[#d4be79] bg-[#e8d79b]">

        {/* Toggle bar — always visible */}
        <div className="flex items-center justify-between px-3 py-2">
          <p className="pixel-title text-[10px] text-[#9e6b0e]">
            {isGuideOpen ? 'Your Move' : 'Guide'}
          </p>
          <button
            type="button"
            onClick={() => setIsGuideOpen((v) => !v)}
            className="rounded border-2 border-[#c29a30] bg-[#f5e0a0] px-2 py-0.5 text-[10px] font-bold text-[#7a5c14] active:opacity-70"
          >
            {isGuideOpen ? 'Hide ▼' : 'Show ▲'}
          </button>
        </div>

        {/* Expandable content */}
        {isGuideOpen && (
          <div className="overflow-y-auto no-scrollbar max-h-[50dvh] px-3 pb-2">
            {/* Conversation status */}
            <p className="mb-2 rounded-md border-2 border-[#cfb460] bg-[#f5e0a0] px-2 py-1 text-[11px] font-semibold text-[#7a5c14]">
              {conversationStatus}
            </p>

            <p className="mb-2 text-[10px] text-[#9a7730]">Pick how you want to continue</p>

            {/* 2×2 move buttons */}
            <div className="grid grid-cols-2 gap-2">
              {modeOptions.map((mode) => (
                <button
                  key={mode.label}
                  type="button"
                  onClick={() => handleMoveSelect(mode.label)}
                  disabled={moveButtonsDisabled}
                  className={`rounded-md border-2 px-2 py-2 text-xs font-bold ${mode.bg} ${mode.text} ${
                    selectedMove === mode.label
                      ? 'border-[#7c540f] ring-2 ring-[#fff2ce]'
                      : mode.border
                  } disabled:opacity-40`}
                >
                  {mode.label}
                </button>
              ))}
            </div>

            {/* Loading state */}
            {isLoading && (
              <div className="mt-2 rounded-lg border-2 border-[#c9a84c] bg-[#fdf5d8] px-3 py-2 text-[#6b531a]">
                <p className="pixel-title text-[10px] text-[#9e6b0e]">Analyzing...</p>
                <p className="mt-1 text-xs">Reading your conversation...</p>
              </div>
            )}

            {/* Cooldown / 429 message */}
            {error && !isLoading && (
              <div className="mt-2 rounded-lg border-2 border-[#e0b060] bg-[#fff3cc] px-3 py-2 text-[#7a5010]">
                <p className="text-xs font-semibold">{error}</p>
              </div>
            )}

            {/* AI result */}
            {guidance && !isLoading && !error && (
              <div className="mt-2 rounded-lg border-2 border-[#c9a84c] bg-[#fdf5d8] p-3 text-[#6b531a]">
                <p className="pixel-title text-[10px] text-[#9e6b0e]">
                  You chose: {selectedMove}
                </p>
                <p className="mt-1.5 text-xs font-semibold">Effect</p>
                <p className="text-xs">{guidance.effect}</p>
                <p className="mt-1.5 text-xs font-semibold">Try something like</p>
                <p className="text-xs italic">"{guidance.example}"</p>
                <p className="mt-2 text-[11px] font-semibold text-[#8a6924]">
                  Use this as inspiration, not copy-paste.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Fixed message input ── */}
      <form
        className="absolute inset-x-0 bottom-0 z-40 border-t-2 border-[#ccaf62] bg-[#d9b963] px-2 pt-2 pb-safe"
        onSubmit={handleSendMessage}
      >
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder={isWaiting ? 'Waiting for reply...' : 'Type a message...'}
            disabled={isWaiting}
            className="h-10 flex-1 rounded-md border-2 border-[#b9902c] bg-[#fff9ea] px-3 text-sm text-[#705720] outline-none disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isWaiting}
            className="pixel-btn inline-flex h-10 w-12 items-center justify-center rounded-md disabled:opacity-50"
            aria-label="Send"
          >
            <Send size={16} />
          </button>
        </div>
      </form>
    </div>
  )
}

export default ChatPage

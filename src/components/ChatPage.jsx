import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, Send } from 'lucide-react'
import { getGuidance } from '../lib/geminiGuide'

const modeOptions = [
  { label: 'Safe',       bg: 'bg-[#95e888]', border: 'border-[#6bbf60]', text: 'text-[#2d5c28]' },
  { label: 'Curious',    bg: 'bg-[#b89ae7]', border: 'border-[#8265c4]', text: 'text-[#2e1d60]' },
  { label: 'Relatable',  bg: 'bg-[#d7b37c]', border: 'border-[#a57c45]', text: 'text-[#4a2e0a]' },
  { label: 'Unexpected', bg: 'bg-[#de9b8f]', border: 'border-[#b06050]', text: 'text-[#4d1a12]' },
]

function pickReply(userText) {
  const t = userText.toLowerCase()

  if (/hik|trail|outdoor|nature|walk|park|mountain|climb/.test(t))
    return "That's so cool! I've been trying to get outside more lately too."

  if (/food|eat|restaurant|cook|coffee|cafe|lunch|dinner|snack/.test(t))
    return "Okay now I'm hungry haha. Do you have a go-to spot or do you just explore?"

  if (/music|song|playlist|concert|band|listen|album/.test(t))
    return "Yes! Music is everything. What kind of stuff are you into lately?"

  if (/movie|show|watch|netflix|series|film/.test(t))
    return "Ooh good taste. I've been on a comfort rewatch kick — what do you recommend?"

  if (/work|job|busy|meeting|stress|tired/.test(t))
    return "Ugh same, honestly. We deserve a break. What do you do to decompress?"

  if (/travel|trip|city|country|flight|visit/.test(t))
    return "Love that. Where's somewhere you actually want to go next?"

  if (/\?/.test(t))
    return "Hmm, good question honestly. I'd have to think about that one. What about you?"

  if (/haha|lol|😂|lmao|funny/.test(t))
    return "Okay that genuinely made me laugh 😄"

  if (/same|agree|totally|exactly|right/.test(t))
    return "Right?? Like I was just thinking about this the other day."

  // generic fallback
  return "Haha yeah, I get that. Tell me more."
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

function ChatPage({ userProfile, selectedMatch, chatMessages, setChatMessages, onBack }) {
  const [draft, setDraft] = useState('')
  const [selectedMove, setSelectedMove] = useState('')
  const [guidance, setGuidance] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isWaiting, setIsWaiting] = useState(false)
  const [error, setError] = useState(null)
  const [isGuideOpen, setIsGuideOpen] = useState(true)
  const bottomRef = useRef(null)

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

    // Simulate the other person replying after 1 second
    const replyText = pickReply(trimmed)
    window.setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        { id: `msg-${Date.now()}`, sender: 'match', text: replyText },
      ])
      setIsWaiting(false)
    }, 1000)
  }

  const handleMoveSelect = async (move) => {
    setSelectedMove(move)
    setGuidance(null)
    setError(null)
    setIsLoading(true)

    try {
      const result = await getGuidance({
        messages: chatMessages,
        move,
        playstyle: userProfile?.style ?? '',
      })
      setGuidance(result)
    } catch {
      setError('AI failed, showing fallback guidance.')
      setGuidance(fallbackGuidance[move])
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
                className={`max-w-[85%] rounded-md border-2 px-3 py-2 text-sm leading-relaxed ${
                  message.sender === 'me'
                    ? 'ml-auto border-[#bfd0e7] bg-[#d6e2f0] text-[#4a5970]'
                    : 'border-[#99d989] bg-[#bff2b2] text-[#3d6138]'
                }`}
              >
                {message.text}
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
            {isGuideOpen ? 'Your Move' : '🎮 Guide'}
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

            {/* AI result */}
            {guidance && !isLoading && (
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

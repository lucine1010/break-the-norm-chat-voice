import { useState } from 'react'

const playstyles = [
  { name: 'Warm Connector',   buff: 'Comfort' },
  { name: 'Curious Explorer', buff: 'Momentum' },
  { name: 'Playful Spark',    buff: 'Energy' },
  { name: 'Calm Listener',    buff: 'Ease' },
  { name: 'Direct Mover',     buff: 'Clarity' },
  { name: 'Creative Shifter', buff: 'Surprise' },
]

const interestOptions      = ['Travel', 'Food', 'Music', 'Movies', 'Fitness', 'Art', 'Tech', 'Books']
const favoriteTopicOptions = ['Life stories', 'Hobbies', 'Daily life', 'Work/study', 'Dreams & goals', 'Fun random topics']
const avoidTopicOptions    = ['Politics', 'Work stress', 'Personal drama', 'Serious debates']
const conversationOptions  = ['Deep talks', 'Light banter', 'Story sharing', 'Idea exchange', 'Playful teasing']

function parseMulti(value) {
  return value ? value.split(',').map((s) => s.trim()).filter(Boolean) : []
}

function ChipGroup({ field, options, userProfile, setUserProfile }) {
  const selected = parseMulti(userProfile[field])
  const toggle = (opt) => {
    const next = selected.includes(opt)
      ? selected.filter((s) => s !== opt)
      : [...selected, opt]
    setUserProfile((p) => ({ ...p, [field]: next.join(', ') }))
  }
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => toggle(opt)}
          className={`rounded-lg border-2 px-3 py-1.5 text-xs font-semibold ${
            selected.includes(opt) ? 'pixel-chip-active' : 'pixel-chip'
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  )
}

function SectionLabel({ children }) {
  return (
    <p className="mb-2 text-sm font-bold text-[#7a6021]">{children}</p>
  )
}

function ProfileSetup({ userProfile, setUserProfile, setCurrentScreen }) {
  const [step, setStep] = useState(1)

  const selectedPlaystyles = parseMulti(userProfile.style)
  const togglePlaystyle = (name) => {
    const next = selectedPlaystyles.includes(name)
      ? selectedPlaystyles.filter((s) => s !== name)
      : selectedPlaystyles.length < 2
        ? [...selectedPlaystyles, name]
        : selectedPlaystyles
    setUserProfile((p) => ({ ...p, style: next.join(', ') }))
  }

  return (
    <div className="flex h-full flex-col bg-[#f5f1dd]">

      {/* ── Progress bar ── */}
      <div className="shrink-0 px-4 pt-4 pb-2">
        <div className="mb-1 flex items-center justify-between">
          <span className="pixel-title text-[9px] text-[#a56d10]">Step {step} of 2</span>
          <span className="text-[10px] text-[#9a7730]">{step === 1 ? '50%' : '100%'}</span>
        </div>
        <div className="h-2 w-full rounded-full border-2 border-[#d9c685] bg-[#ebddad]">
          <div
            className="h-full rounded-full bg-[#ca8a15] transition-all duration-300"
            style={{ width: step === 1 ? '50%' : '100%' }}
          />
        </div>
      </div>

      {/* ── Scrollable content ── */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-2">

        {step === 1 ? (
          <div className="space-y-6 py-2">
            <h1 className="pixel-title text-lg text-[#a56d10]">Create Profile</h1>

            {/* Name */}
            <input
              type="text"
              value={userProfile.name}
              onChange={(e) => setUserProfile((p) => ({ ...p, name: e.target.value }))}
              placeholder="Your name..."
              className="w-full rounded-xl border-2 border-[#dbc98f] bg-[#fffcef] px-4 py-3 text-base text-[#6d5520] outline-none"
            />

            {/* Interests */}
            <div>
              <SectionLabel>Interests</SectionLabel>
              <ChipGroup field="interests" options={interestOptions} userProfile={userProfile} setUserProfile={setUserProfile} />
            </div>

            {/* Favorite topics */}
            <div>
              <SectionLabel>Favorite topics</SectionLabel>
              <ChipGroup field="favoriteTopics" options={favoriteTopicOptions} userProfile={userProfile} setUserProfile={setUserProfile} />
            </div>

            {/* Avoid topics */}
            <div>
              <SectionLabel>Topics to avoid</SectionLabel>
              <ChipGroup field="avoidTopics" options={avoidTopicOptions} userProfile={userProfile} setUserProfile={setUserProfile} />
              <input
                type="text"
                value={userProfile.avoidTopicsOther}
                onChange={(e) => setUserProfile((p) => ({ ...p, avoidTopicsOther: e.target.value }))}
                placeholder="Other (optional)"
                className="mt-2 w-full rounded-xl border-2 border-[#dbc98f] bg-[#fffcef] px-4 py-2.5 text-sm text-[#6d5520] outline-none"
              />
            </div>

            {/* Conversation preference */}
            <div>
              <SectionLabel>How do you like to talk?</SectionLabel>
              <ChipGroup field="conversationEnjoyment" options={conversationOptions} userProfile={userProfile} setUserProfile={setUserProfile} />
            </div>
          </div>
        ) : (
          <div className="space-y-3 py-1">
            <div>
              <h1 className="pixel-title text-lg text-[#a56d10]">Choose Playstyle</h1>
              <p className="mt-0.5 text-xs text-[#9a7730]">Pick up to 2</p>
            </div>

            {/* 2-column playstyle cards */}
            <div className="grid grid-cols-2 gap-2">
              {playstyles.map((style) => {
                const active = selectedPlaystyles.includes(style.name)
                return (
                  <button
                    key={style.name}
                    type="button"
                    onClick={() => togglePlaystyle(style.name)}
                    className={`rounded-xl border-2 px-3 py-3 text-left transition-colors ${
                      active
                        ? 'border-[#bf8616] bg-[#f5da8e] text-[#6a4911]'
                        : 'border-[#dbc98f] bg-[#f7efcf] text-[#7c6223]'
                    }`}
                  >
                    <p className="text-sm font-extrabold leading-tight">{style.name}</p>
                    <p className="mt-1 text-[10px] font-medium tracking-wide text-[#b8720e] opacity-80">{style.buff}</p>
                  </button>
                )
              })}
            </div>

            {/* Natural message */}
            <div>
              <SectionLabel>How do you naturally talk? <span className="font-normal opacity-60">(optional)</span></SectionLabel>
              <textarea
                value={userProfile.exampleMessage}
                onChange={(e) => setUserProfile((p) => ({ ...p, exampleMessage: e.target.value }))}
                placeholder="Paste a message you'd normally send..."
                rows={2}
                className="w-full resize-none rounded-xl border-2 border-[#dbc98f] bg-[#fffcef] px-4 py-2 text-sm text-[#6d5520] outline-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* ── Sticky bottom nav ── */}
      <div className="shrink-0 px-4 pb-4 pt-2">
        <div className="flex gap-2">
          {step === 2 && (
            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-1/3 rounded-xl border-2 border-[#d4be79] bg-[#f7efcf] px-3 py-3 text-xs font-semibold text-[#8a6a22]"
            >
              ← Back
            </button>
          )}
          <button
            type="button"
            onClick={step === 1 ? () => setStep(2) : () => setCurrentScreen('match')}
            className={`pixel-btn pixel-title rounded-xl px-4 py-3 text-[10px] ${step === 2 ? 'w-2/3' : 'w-full'}`}
          >
            {step === 1 ? 'Next →' : 'Start Match →'}
          </button>
        </div>
      </div>

    </div>
  )
}

export default ProfileSetup

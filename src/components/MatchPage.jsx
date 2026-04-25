import { Heart, User, X } from 'lucide-react'

function MatchPage({ matches, onStartChat }) {
  const candidate = matches[0]

  return (
    <div className="h-full bg-[#f5f1dd] flex flex-col">

      {/* ── App header ── */}
      <header className="shrink-0 flex items-center justify-between border-b-2 border-[#d4be79] bg-[#e8d79b] px-4 h-12">
        <span className="pixel-title text-[11px] text-[#a56d10] tracking-wide">BreakTheNorm</span>
        <button
          type="button"
          aria-label="Profile"
          className="inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#be8618] bg-[#d38f12] text-[#fff8e7]"
        >
          <User size={14} />
        </button>
      </header>

      {/* ── Page content ── */}
      <div className="flex-1 flex flex-col p-4 min-h-0">
      <h1 className="pixel-title text-xl text-[#a56d10]">Match new contact</h1>

      <div className="mt-4 rounded-2xl border-2 border-[#d7c17f] bg-[#ebddad] p-3">
        <div className="pixel-avatar mx-auto" />
        <div className="mt-3 rounded-xl border-2 border-[#cfb870] bg-[#e7d091] p-3 text-[#7a6021]">
          <p className="text-sm font-semibold">NAME: {candidate?.name ?? 'Elisa'}</p>
          <p className="mt-1 text-sm font-semibold">AGE: {candidate?.age ?? 23}</p>
          <p className="mt-1 text-sm font-semibold">
            HOBBY: {candidate?.hobbies ?? 'Music, Movie'}
          </p>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-center gap-4">
        <button
          type="button"
          className="inline-flex h-14 w-14 items-center justify-center rounded-full border-2 border-[#ba7f15] bg-[#d38f12] text-[#fff8e7]"
        >
          <X size={24} />
        </button>
        <button
          type="button"
          onClick={() => onStartChat(candidate)}
          className="inline-flex h-14 w-14 items-center justify-center rounded-full border-2 border-[#ba7f15] bg-[#d38f12] text-[#fff8e7]"
        >
          <Heart size={24} />
        </button>
      </div>

      <div className="mt-auto rounded-xl border-2 border-[#d5bf7a] bg-[#e8d79b] p-3">
        <div className="flex justify-between text-sm font-semibold text-[#926f1f]">
          <span>Chats</span>
          <span>Match</span>
          <span>Profile</span>
        </div>
      </div>
      </div>{/* end page content */}
    </div>
  )
}

export default MatchPage

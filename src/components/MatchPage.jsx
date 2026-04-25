import { Heart, X } from 'lucide-react'
import matchEgg from '../../img/match.png'

function MatchPage({ matches, onStartChat }) {
  const candidate = matches[0]

  return (
    <div className="h-full bg-[#f5f1dd] flex flex-col">

      {/* ── Header / page title ── */}
      <header className="shrink-0 flex items-center justify-center border-b-2 border-[#d4be79] bg-[#e8d79b] px-4 h-12">
        <span className="pixel-title text-[11px] text-[#a56d10] tracking-wide">Match new contact</span>
      </header>

      {/* ── Page content ── */}
      <div className="flex-1 flex flex-col px-5 pt-4 pb-3 min-h-0">

        {/* ── Profile card ── */}
        <div className="rounded-2xl overflow-hidden border-2 border-[#d7c17f] shadow-md">

          {/* Image area — light green bg */}
          <div className="bg-[#dcedc8] flex items-center justify-center py-6 px-4">
            <img
              src={matchEgg}
              alt={candidate?.name ?? 'Elisa'}
              className="w-44 h-auto object-contain"
            />
          </div>

          {/* Info area — yellow bg */}
          <div className="bg-[#e8d48a] px-5 py-4">
            <p className="pixel-title text-xs text-[#7a5810] leading-relaxed">
              NAME: {(candidate?.name ?? 'Elisa').toUpperCase()}
            </p>
            <p className="pixel-title text-xs text-[#7a5810] mt-1 leading-relaxed">
              AGE: {candidate?.age ?? 23}
            </p>
            <p className="pixel-title text-xs text-[#7a5810] mt-1 leading-relaxed">
              HOBBY: {(candidate?.hobbies ?? 'Music, Movie').toUpperCase()}
            </p>
          </div>
        </div>

        {/* ── Action buttons ── */}
        <div className="mt-6 flex items-center justify-center gap-8">
          <button
            type="button"
            aria-label="Pass"
            className="inline-flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#ba7f15] bg-[#d38f12] text-[#fff8e7] shadow-md active:scale-95 transition-transform"
          >
            <X size={28} />
          </button>
          <button
            type="button"
            aria-label="Like"
            onClick={() => onStartChat(candidate)}
            className="inline-flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#ba7f15] bg-[#d38f12] text-[#fff8e7] shadow-md active:scale-95 transition-transform"
          >
            <Heart size={28} />
          </button>
        </div>

        {/* ── Bottom nav ── */}
        <div className="mt-auto rounded-xl border-2 border-[#d5bf7a] bg-[#e8d79b] px-4 py-3">
          <div className="flex justify-between text-sm font-semibold text-[#926f1f]">
            <span>Chats</span>
            <span className="text-[#a56d10] underline underline-offset-2">Match</span>
            <span>Profile</span>
          </div>
        </div>

      </div>
    </div>
  )
}

export default MatchPage

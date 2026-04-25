import { useState } from 'react'

import greenEgg  from '../../img/green.png'
import purpleEgg from '../../img/purple.png'
import yellowEgg from '../../img/yellow.png'
import blueEgg   from '../../img/blue.png'
import redEgg    from '../../img/red.png'

const EGG_CHARS = [
  { src: greenEgg,  alt: 'green egg' },
  { src: purpleEgg, alt: 'purple egg' },
  { src: yellowEgg, alt: 'yellow egg' },
  { src: blueEgg,   alt: 'blue egg' },
  { src: redEgg,    alt: 'red egg' },
]

// Stagger delays so eggs float at different phases
const FLOAT_DELAYS = ['0s', '0.4s', '0.8s', '0.5s', '0.2s']

function PixelEgg({ src, alt, delay }) {
  return (
    <img
      src={src}
      alt={alt}
      className="egg-float"
      style={{ width: 58, height: 'auto', animationDelay: delay }}
    />
  )
}

function WelcomeScreen({ onSignUp }) {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    // No real auth — just continue to onboarding
    onSignUp()
  }

  return (
    <div className="flex h-full flex-col items-center bg-[#f5f1dd] px-6">

      {/* ── Big title ── */}
      <h1 className="pixel-title mt-12 mb-6 text-3xl tracking-wide text-[#a56d10]">
        WELCOME
      </h1>

      {/* ── Card ── */}
      <div className="w-full rounded-2xl border-2 border-[#c9aa4a] bg-[#e8d479] px-5 py-6 shadow-lg">
        <h2 className="pixel-title mb-5 text-center text-[11px] tracking-wide text-[#7a5810]">
          SIGN UP YOUR ACCOUNT
        </h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Email */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-[#7a5810]">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border-0 bg-white px-4 py-3 text-sm text-[#5e4a1a] shadow-inner outline-none"
              autoComplete="email"
            />
          </div>

          {/* Password */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-[#7a5810]">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border-0 bg-white px-4 py-3 text-sm text-[#5e4a1a] shadow-inner outline-none"
              autoComplete="new-password"
            />
          </div>

          {/* Confirm password */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-[#7a5810]">Confirm password</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full rounded-xl border-0 bg-white px-4 py-3 text-sm text-[#5e4a1a] shadow-inner outline-none"
              autoComplete="new-password"
            />
          </div>

          {/* Sign up button */}
          <button
            type="submit"
            className="pixel-btn pixel-title mt-1 w-full rounded-xl py-3 text-[11px] tracking-wide"
          >
            SIGN UP
          </button>
        </form>
      </div>

      {/* ── Log in hint ── */}
      <p className="mt-4 text-center text-[11px] text-[#9a7730]">
        Please sign in if you do have an account
      </p>
      <button
        type="button"
        className="pixel-title mt-1 text-[11px] text-[#a56d10] underline underline-offset-2"
      >
        LOG IN
      </button>

      {/* ── Bottom pixel eggs ── */}
      <div className="mt-auto mb-6 flex items-end gap-4">
        {EGG_CHARS.map((egg, i) => (
          <PixelEgg key={i} src={egg.src} alt={egg.alt} delay={FLOAT_DELAYS[i]} />
        ))}
      </div>

    </div>
  )
}

export default WelcomeScreen

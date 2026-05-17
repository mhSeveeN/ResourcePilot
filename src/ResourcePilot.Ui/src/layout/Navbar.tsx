import { motion } from 'framer-motion'
import { Home, CalendarDays, BookOpen, MessageSquare, ShieldCheck } from 'lucide-react'
import { RESTAURANT_NAME } from '../app/core/constants'

export type ViewKey = 'landing' | 'booking' | 'my-reservations' | 'contact' | 'admin'

const NAV_ITEMS: Array<{ key: ViewKey; label: string; icon: typeof Home }> = [
  { key: 'landing',          label: 'Home',            icon: Home },
  { key: 'booking',          label: 'Reserve',         icon: CalendarDays },
  { key: 'my-reservations',  label: 'My Bookings',     icon: BookOpen },
  { key: 'contact',          label: 'Contact',         icon: MessageSquare },
]

export function Navbar({
  active,
  onChange,
}: {
  active: ViewKey
  onChange: (view: ViewKey) => void
}) {
  return (
    <nav className="sticky top-0 z-30 border-b border-[#C5A059]/12 bg-[#080706]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        {/* Logo */}
        <button
          type="button"
          onClick={() => onChange('landing')}
          className="shrink-0 font-['Playfair_Display'] text-xl text-[#C5A059] transition-opacity hover:opacity-80"
        >
          {RESTAURANT_NAME}
        </button>

        {/* Nav links */}
        <div className="flex items-center gap-1 overflow-x-hidden whitespace-nowrap">
          {NAV_ITEMS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => onChange(key)}
              className={`relative flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-xs tracking-[0.06em] transition-colors ${
                active === key
                  ? 'text-[#C5A059]'
                  : 'text-[#F8F4EC]/50 hover:text-[#F8F4EC]/80'
              }`}
            >
              <Icon size={13} />
              {label}
              {active === key && (
                <motion.div
                  layoutId="nav-indicator"
                  className="pointer-events-none absolute inset-0 rounded-xl bg-[#C5A059]/10"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Admin link */}
        <button
          type="button"
          onClick={() => onChange('admin')}
          className={`flex shrink-0 items-center gap-1.5 rounded-xl border px-3 py-2 text-xs tracking-[0.06em] transition-colors ${
            active === 'admin'
              ? 'border-[#C5A059]/50 bg-[#C5A059]/12 text-[#C5A059]'
              : 'border-white/10 bg-white/4 text-[#F8F4EC]/40 hover:border-[#C5A059]/30 hover:text-[#F8F4EC]/70'
          }`}
        >
          <ShieldCheck size={13} />
          Staff
        </button>
      </div>
    </nav>
  )
}

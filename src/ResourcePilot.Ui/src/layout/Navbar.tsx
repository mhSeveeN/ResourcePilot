import { useState } from 'react'
import { motion } from 'framer-motion'
import { Home, CalendarDays, BookOpen, MessageSquare, ShieldCheck, Menu, X } from 'lucide-react'
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
  const [menuOpen, setMenuOpen] = useState(false)

  const handleChange = (view: ViewKey) => {
    setMenuOpen(false)
    onChange(view)
  }

  return (
    <nav className="sticky top-0 z-30 border-b border-[#C5A059]/12 bg-[#080706]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        {/* Logo */}
        <button
          type="button"
          onClick={() => handleChange('landing')}
          className="min-w-0 shrink font-['Playfair_Display'] text-xl text-[#C5A059] transition-opacity hover:opacity-80 md:shrink-0"
        >
          <span className="block truncate">{RESTAURANT_NAME}</span>
        </button>

        {/* Nav links */}
        <div className="hidden items-center gap-1 whitespace-nowrap md:flex">
          {NAV_ITEMS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => handleChange(key)}
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
          onClick={() => handleChange('admin')}
          className={`hidden shrink-0 items-center gap-1.5 rounded-xl border px-3 py-2 text-xs tracking-[0.06em] transition-colors md:flex ${
            active === 'admin'
              ? 'border-[#C5A059]/50 bg-[#C5A059]/12 text-[#C5A059]'
              : 'border-white/10 bg-white/4 text-[#F8F4EC]/40 hover:border-[#C5A059]/30 hover:text-[#F8F4EC]/70'
          }`}
        >
          <ShieldCheck size={13} />
          Staff
        </button>

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className="flex shrink-0 items-center gap-2 rounded-xl border border-white/10 bg-white/4 px-3 py-2 text-xs tracking-[0.06em] text-[#F8F4EC]/70 transition-colors hover:border-[#C5A059]/30 hover:text-[#F8F4EC] md:hidden"
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
        >
          {menuOpen ? <X size={14} /> : <Menu size={14} />}
          Menu
        </button>
      </div>

      {menuOpen && (
        <div id="mobile-navigation" className="border-t border-[#C5A059]/10 px-4 pb-4 md:hidden">
          <div className="grid gap-2 rounded-2xl border border-white/8 bg-black/25 p-2 shadow-[0_18px_45px_rgba(0,0,0,0.25)]">
            {[...NAV_ITEMS, { key: 'admin' as ViewKey, label: 'Staff', icon: ShieldCheck }].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => handleChange(key)}
                className={`flex items-center justify-between rounded-xl px-3 py-3 text-left text-sm transition-colors ${
                  active === key
                    ? 'bg-[#C5A059]/14 text-[#C5A059]'
                    : 'text-[#F8F4EC]/70 hover:bg-white/6 hover:text-[#F8F4EC]'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <Icon size={15} />
                  {label}
                </span>
                {active === key && <span className="h-1.5 w-1.5 rounded-full bg-[#C5A059]" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </nav>
  )
}

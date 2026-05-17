import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CalendarDays, Clock, Users, MapPin, Trash2, Info, ChevronLeft, ChevronRight } from 'lucide-react'
import { pageTransition, itemFadeIn } from '../../app/core/motion'
import { reservationService, getGuestCookieId } from '../../app/core/mockServices'
import type { Reservation } from '../../app/core/types'
import { Button } from '../../shared/ui/Button'
import { Card } from '../../shared/ui/Card'
import { StatusBadge } from '../../shared/ui/StatusBadge'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}
function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

function toISODate(value: string) {
  return value.slice(0, 10)
}

function dateToISO(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function parseISODate(iso: string) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, (m || 1) - 1, d || 1)
}

type Tab = 'upcoming' | 'past'

export function ReservationsTimeline({ refreshKey }: { refreshKey?: number }) {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('upcoming')
  const [cancelling, setCancelling] = useState<string | null>(null)
  const [confirmCancel, setConfirmCancel] = useState<string | null>(null)
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(8)

  const cookieId = getGuestCookieId()

  const load = async () => {
    setLoading(true)
    const data = await reservationService.listForGuest(cookieId)
    setReservations(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [refreshKey])

  const now = new Date()
  const upcoming = reservations.filter(
    (r) => new Date(r.dateTime) >= now && r.status !== 'Cancelled' && r.status !== 'Rejected',
  )
  const past = reservations.filter(
    (r) => new Date(r.dateTime) < now || r.status === 'Cancelled' || r.status === 'Rejected',
  )
  const baseList = tab === 'upcoming' ? upcoming : past
  const filtered = baseList.filter((r) => {
    const day = toISODate(r.dateTime)
    if (fromDate && day < fromDate) return false
    if (toDate && day > toDate) return false
    return true
  })
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage))
  const safePage = Math.min(page, totalPages)
  const start = (safePage - 1) * perPage
  const displayed = filtered.slice(start, start + perPage)

  const handleCancel = async (id: string) => {
    setCancelling(id)
    await reservationService.cancel(id, cookieId)
    await load()
    setCancelling(null)
    setConfirmCancel(null)
  }

  return (
    <motion.div {...pageTransition} className="mx-auto max-w-3xl px-4 py-12">
      <div className="mb-8">
        <p className="text-xs tracking-[0.3em] text-[#C5A059]">YOUR RESERVATIONS</p>
        <h2 className="mt-2 font-['Playfair_Display'] text-4xl">My Bookings</h2>
        <p className="mt-2 text-sm text-[#F8F4EC]/50">
          Reservations linked to this device. Managed via browser cookie.
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex flex-wrap gap-2">
        {(['upcoming', 'past'] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => {
              setTab(t)
              setPage(1)
            }}
            className={`rounded-xl px-4 py-2 text-sm transition-colors ${
              tab === t
                ? 'bg-[#C5A059] text-[#080706] font-medium'
                : 'bg-white/6 text-[#F8F4EC]/60 hover:bg-white/10'
            }`}
          >
            {t === 'upcoming' ? `Upcoming (${upcoming.length})` : `Past (${past.length})`}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <div className="space-y-1.5">
          <label className="text-[10px] tracking-[0.2em] text-[#C5A059]/70">FROM</label>
          <DatePicker value={fromDate} onChange={(v) => { setFromDate(v); setPage(1) }} placeholder="Select date" />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] tracking-[0.2em] text-[#C5A059]/70">TO</label>
          <DatePicker value={toDate} onChange={(v) => { setToDate(v); setPage(1) }} placeholder="Select date" />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] tracking-[0.2em] text-[#C5A059]/70">PER PAGE</label>
          <CustomSelect
            value={String(perPage)}
            onChange={(v) => { setPerPage(Number(v)); setPage(1) }}
            options={[6, 8, 12, 16].map((n) => ({ value: String(n), label: `${n} items` }))}
          />
        </div>
      </div>

      {loading && (
        <div className="flex justify-center py-16">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
            className="h-8 w-8 rounded-full border-2 border-[#C5A059]/30 border-t-[#C5A059]"
          />
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <motion.div {...itemFadeIn}>
          <Card className="flex flex-col items-center py-16 text-center">
            <CalendarDays size={32} className="mb-4 text-[#C5A059]/30" />
            <p className="font-['Playfair_Display'] text-xl text-[#F8F4EC]/50">
              {tab === 'upcoming' ? 'No upcoming reservations' : 'No past reservations'}
            </p>
            <p className="mt-2 text-sm text-[#F8F4EC]/30">
              {tab === 'upcoming' ? 'Make a reservation to see it here.' : 'Your completed bookings will appear here.'}
            </p>
          </Card>
        </motion.div>
      )}

      <div className="space-y-4">
        <AnimatePresence>
          {displayed.map((r, i) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, delay: i * 0.06 }}
            >
              <Card className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-['Playfair_Display'] text-xl">{r.tableName}</p>
                    <p className="mt-0.5 text-xs tracking-[0.1em] text-[#C5A059]/70">{r.zone}</p>
                  </div>
                  <StatusBadge status={r.status} />
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <InfoChip icon={CalendarDays} label="Date" value={formatDate(r.dateTime)} />
                  <InfoChip icon={Clock} label="Time" value={formatTime(r.dateTime)} />
                  <InfoChip icon={Users} label="Guests" value={`${r.partySize} ${r.partySize === 1 ? 'person' : 'people'}`} />
                  <InfoChip icon={MapPin} label="Table" value={r.tableId} />
                </div>

                {r.specialRequest && (
                  <div className="flex items-start gap-2 rounded-xl border border-[#C5A059]/15 bg-[#C5A059]/5 px-4 py-3">
                    <Info size={13} className="mt-0.5 shrink-0 text-[#C5A059]/60" />
                    <p className="text-sm text-[#F8F4EC]/60">{r.specialRequest}</p>
                  </div>
                )}

                {r.adminNote && (
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3">
                    <p className="text-xs tracking-[0.1em] text-emerald-400/70">NOTE FROM RESTAURANT</p>
                    <p className="mt-1 text-sm text-[#F8F4EC]/70">{r.adminNote}</p>
                  </div>
                )}

                <div className="flex items-center justify-between border-t border-white/6 pt-3">
                  <p className="text-xs text-[#F8F4EC]/30">Ref: {r.id}</p>
                  {tab === 'upcoming' && r.status !== 'Cancelled' && (
                    <>
                      {confirmCancel === r.id ? (
                        <div className="flex items-center gap-2">
                          <p className="text-xs text-[#F8F4EC]/50">Cancel this reservation?</p>
                          <Button
                            size="sm"
                            variant="danger"
                            disabled={cancelling === r.id}
                            onClick={() => handleCancel(r.id)}
                          >
                            {cancelling === r.id ? 'Cancelling…' : 'Yes, cancel'}
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setConfirmCancel(null)}>
                            Keep
                          </Button>
                        </div>
                      ) : (
                        <Button size="sm" variant="ghost" onClick={() => setConfirmCancel(r.id)}>
                          <Trash2 size={13} /> Cancel
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {!loading && filtered.length > 0 && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-[#F8F4EC]/40">
            Page {safePage} of {totalPages} · {filtered.length} total
          </p>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
            >
              Prev
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </motion.div>
  )
}

function InfoChip({ icon: Icon, label, value }: { icon: typeof CalendarDays; label: string; value: string }) {
  return (
    <div className="rounded-xl bg-black/20 px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-[10px] tracking-[0.1em] text-[#C5A059]/60">
        <Icon size={10} />
        {label.toUpperCase()}
      </div>
      <p className="mt-1 text-xs text-[#F8F4EC]/80">{value}</p>
    </div>
  )
}

// ── Shared controls ─────────────────────────────────────────────────────────

function CustomSelect({
  value,
  onChange,
  options,
}: {
  value: string
  onChange: (v: string) => void
  options: Array<{ value: string; label: string }>
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!open) return
    const handleClick = (event: MouseEvent) => {
      if (!ref.current) return
      if (!ref.current.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  const active = options.find((o) => o.value === value)

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-black/25 px-3 py-2.5 text-xs text-[#F8F4EC] outline-none transition-colors hover:border-[#C5A059]/40"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span>{active?.label ?? 'Select'}</span>
        <span className="text-[10px] text-[#F8F4EC]/40">▾</span>
      </button>
      {open && (
        <div className="absolute left-0 right-0 top-full z-20 mt-2 w-full rounded-xl border border-[#C5A059]/20 bg-[#0d0c0b] p-1 shadow-[0_20px_50px_rgba(0,0,0,0.45)]">
          {options.map((o) => (
            <button
              key={o.value}
              type="button"
              role="option"
              aria-selected={o.value === value}
              onClick={() => { onChange(o.value); setOpen(false) }}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs transition-colors ${
                o.value === value
                  ? 'bg-[#C5A059]/20 text-[#C5A059]'
                  : 'text-[#F8F4EC]/70 hover:bg-white/6 hover:text-[#F8F4EC]'
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function DatePicker({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!open) return
    const handleClick = (event: MouseEvent) => {
      if (!ref.current) return
      if (!ref.current.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-black/25 px-3 py-2.5 text-xs text-[#F8F4EC] outline-none transition-colors hover:border-[#C5A059]/40"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <span className={value ? 'text-[#F8F4EC]' : 'text-[#F8F4EC]/40'}>
          {value || placeholder || 'Select date'}
        </span>
        <CalendarDays size={12} className="text-[#C5A059]/70" />
      </button>
      {open && (
        <div className="absolute left-0 right-0 top-full z-20 mt-2 w-full rounded-xl border border-[#C5A059]/20 bg-[#0d0c0b] p-3 shadow-[0_20px_50px_rgba(0,0,0,0.45)]">
          <CalendarGrid
            value={value}
            onSelect={(v) => { onChange(v); setOpen(false) }}
            onClear={() => { onChange(''); setOpen(false) }}
          />
        </div>
      )}
    </div>
  )
}

function CalendarGrid({
  value,
  onSelect,
  onClear,
}: {
  value: string
  onSelect: (v: string) => void
  onClear: () => void
}) {
  const selected = value ? parseISODate(value) : null
  const [view, setView] = useState<Date>(() => selected ?? new Date())

  useEffect(() => {
    if (selected) {
      const sameMonth = selected.getMonth() === view.getMonth() && selected.getFullYear() === view.getFullYear()
      if (!sameMonth) setView(selected)
    }
  }, [selected, view])

  const year = view.getFullYear()
  const month = view.getMonth()
  const first = new Date(year, month, 1)
  const startDay = (first.getDay() + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells = Array.from({ length: startDay + daysInMonth }, (_, i) => (i < startDay ? null : i - startDay + 1))

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setView(new Date(year, month - 1, 1))}
          className="rounded-lg border border-white/10 px-2 py-1 text-[10px] text-[#F8F4EC]/60 hover:border-[#C5A059]/40"
        >
          <ChevronLeft size={12} />
        </button>
        <p className="text-[11px] tracking-[0.2em] text-[#C5A059]">
          {view.toLocaleString('en-GB', { month: 'long', year: 'numeric' }).toUpperCase()}
        </p>
        <div className="flex items-center gap-2">
          {value && (
            <button
              type="button"
              onClick={onClear}
              className="rounded-lg border border-white/10 px-2 py-1 text-[10px] text-[#F8F4EC]/60 hover:border-[#C5A059]/40"
            >
              Clear
            </button>
          )}
          <button
            type="button"
            onClick={() => setView(new Date(year, month + 1, 1))}
            className="rounded-lg border border-white/10 px-2 py-1 text-[10px] text-[#F8F4EC]/60 hover:border-[#C5A059]/40"
          >
            <ChevronRight size={12} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-[9px] text-[#F8F4EC]/40">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
          <div key={d} className="py-1">{d}</div>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (!day) return <div key={`blank-${i}`} className="h-8" />
          const dateObj = new Date(year, month, day)
          const iso = dateToISO(dateObj)
          const isSelected = value === iso
          return (
            <button
              key={iso}
              type="button"
              onClick={() => onSelect(iso)}
              className={`h-8 rounded-lg text-[10px] transition-colors ${
                isSelected
                  ? 'bg-[#C5A059] text-[#080706] font-medium'
                  : 'border border-transparent text-[#F8F4EC]/70 hover:border-[#C5A059]/40 hover:text-[#F8F4EC]'
              }`}
            >
              {day}
            </button>
          )
        })}
      </div>
    </div>
  )
}

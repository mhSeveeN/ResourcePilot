import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CalendarDays, Clock, Users, MapPin, ChevronRight, ChevronLeft, CheckCircle2, Phone, User, MessageSquare } from 'lucide-react'
import { pageTransition, itemFadeIn } from '../../app/core/motion'
import { floorTables } from '../../app/core/constants'
import { reservationService, getGuestCookieId } from '../../app/core/mockServices'
import type { ReservationDraft } from '../../app/core/types'
import { Button } from '../../shared/ui/Button'
import { Card } from '../../shared/ui/Card'
import { Input, Textarea } from '../../shared/ui/Input'

type Step = 1 | 2 | 3 | 4

const STEPS = [
  { n: 1 as Step, label: 'Date & Guests' },
  { n: 2 as Step, label: 'Choose Table' },
  { n: 3 as Step, label: 'Your Details' },
  { n: 4 as Step, label: 'Confirmation' },
]

function toISODate(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function parseISODate(iso: string) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, (m || 1) - 1, d || 1)
}

const TODAY = toISODate(new Date())

const TIME_SLOTS = [
  '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00',
]

export function BookingFlow({
  onReserve,
}: {
  onReserve?: (draft: ReservationDraft) => Promise<void>
}) {
  const [step, setStep] = useState<Step>(1)
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [partySize, setPartySize] = useState(2)
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null)
  const [availability, setAvailability] = useState<Record<string, boolean>>({})
  const [loadingAvail, setLoadingAvail] = useState(false)
  const [guestName, setGuestName] = useState('')
  const [guestPhone, setGuestPhone] = useState('')
  const [specialRequest, setSpecialRequest] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [createdId, setCreatedId] = useState('')

  // Load availability when date or partySize changes
  useEffect(() => {
    if (!date || !time) return
    setLoadingAvail(true)
    setSelectedTableId(null)
    reservationService.getAvailability(date, partySize).then((avail) => {
      setAvailability(avail)
      setLoadingAvail(false)
    })
  }, [date, time, partySize])

  const selectedTable = useMemo(
    () => floorTables.find((t) => t.id === selectedTableId),
    [selectedTableId],
  )

  // ── Validation ──────────────────────────────────────────────────────────
  const validateStep1 = () => {
    const e: Record<string, string> = {}
    if (!date) e.date = 'Please select a date.'
    else if (date < TODAY) e.date = 'Date cannot be in the past.'
    if (!time) e.time = 'Please select a time slot.'
    if (partySize < 1 || partySize > 12) e.partySize = 'Party size must be between 1 and 12.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const validateStep2 = () => {
    const e: Record<string, string> = {}
    if (!selectedTableId) e.table = 'Please select a table.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const validateStep3 = () => {
    const e: Record<string, string> = {}
    if (!guestName.trim()) e.guestName = 'Please enter your name.'
    if (!guestPhone.trim()) e.guestPhone = 'Please enter your phone number.'
    else if (!/^[+\d\s\-()]{7,20}$/.test(guestPhone.trim())) e.guestPhone = 'Please enter a valid phone number.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const goNext = () => {
    if (step === 1 && !validateStep1()) return
    if (step === 2 && !validateStep2()) return
    if (step === 3) {
      if (!validateStep3()) return
      handleSubmit()
      return
    }
    setErrors({})
    setStep((s) => (s + 1) as Step)
  }

  const goBack = () => {
    setErrors({})
    setStep((s) => (s - 1) as Step)
  }

  const handleSubmit = async () => {
    if (!selectedTable) return
    setSubmitting(true)
    try {
      const draft: ReservationDraft = {
        guestName: guestName.trim(),
        guestPhone: guestPhone.trim(),
        specialRequest: specialRequest.trim() || undefined,
        partySize,
        tableId: selectedTable.id,
        tableName: selectedTable.name,
        zone: selectedTable.zone,
        dateTime: `${date}T${time}:00`,
      }
      const cookieId = getGuestCookieId()
      let id = ''
      if (onReserve) {
        await onReserve(draft)
      } else {
        const created = await reservationService.create(draft, cookieId)
        id = created.id
      }
      setCreatedId(id)
      setSubmitted(true)
      setStep(4)
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted && step === 4) {
    return <ConfirmationScreen name={guestName} date={date} time={time} tableName={selectedTable?.name ?? ''} reservationId={createdId} />
  }

  return (
    <motion.div {...pageTransition} className="mx-auto max-w-3xl px-4 py-12">
      {/* Progress bar */}
      <div className="mb-10">
        <div className="flex items-center justify-between">
          {STEPS.map((s, i) => (
            <div key={s.n} className="flex flex-1 items-center">
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full border text-xs font-medium transition-colors duration-300 ${
                    step > s.n
                      ? 'border-[#C5A059] bg-[#C5A059] text-[#080706]'
                      : step === s.n
                      ? 'border-[#C5A059] bg-[#C5A059]/15 text-[#C5A059]'
                      : 'border-white/15 bg-transparent text-[#F8F4EC]/30'
                  }`}
                >
                  {step > s.n ? <CheckCircle2 size={14} /> : s.n}
                </div>
                <p className={`hidden text-[10px] tracking-[0.1em] sm:block ${step === s.n ? 'text-[#C5A059]' : 'text-[#F8F4EC]/30'}`}>
                  {s.label.toUpperCase()}
                </p>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`mx-2 h-px flex-1 transition-colors duration-300 ${step > s.n ? 'bg-[#C5A059]/50' : 'bg-white/8'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <StepDateGuests
            key="step1"
            date={date} setDate={setDate}
            time={time} setTime={setTime}
            partySize={partySize} setPartySize={setPartySize}
            errors={errors}
          />
        )}
        {step === 2 && (
          <StepTablePicker
            key="step2"
            date={date} time={time} partySize={partySize}
            availability={availability} loading={loadingAvail}
            selectedTableId={selectedTableId} setSelectedTableId={setSelectedTableId}
            error={errors.table}
          />
        )}
        {step === 3 && (
          <StepGuestDetails
            key="step3"
            guestName={guestName} setGuestName={setGuestName}
            guestPhone={guestPhone} setGuestPhone={setGuestPhone}
            specialRequest={specialRequest} setSpecialRequest={setSpecialRequest}
            errors={errors}
            summary={{ date, time, partySize, tableName: selectedTable?.name ?? '', zone: selectedTable?.zone ?? '' }}
          />
        )}
      </AnimatePresence>

      {/* Navigation */}
      <div className="mt-8 flex items-center justify-between">
        {step > 1 ? (
          <Button variant="ghost" onClick={goBack}>
            <ChevronLeft size={15} /> Back
          </Button>
        ) : (
          <div />
        )}
        <Button onClick={goNext} disabled={submitting}>
          {submitting ? 'Submitting…' : step === 3 ? 'Confirm Reservation' : 'Continue'}
          {!submitting && step < 3 && <ChevronRight size={15} />}
        </Button>
      </div>
    </motion.div>
  )
}

// ── Step 1: Date & Guests ────────────────────────────────────────────────────

function StepDateGuests({
  date, setDate, time, setTime, partySize, setPartySize, errors,
}: {
  date: string; setDate: (v: string) => void
  time: string; setTime: (v: string) => void
  partySize: number; setPartySize: (v: number) => void
  errors: Record<string, string>
}) {
  return (
    <motion.div
      key="s1"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.35 }}
      className="space-y-6"
    >
      <div>
        <p className="text-xs tracking-[0.25em] text-[#C5A059]">STEP 1</p>
        <h2 className="mt-2 font-['Playfair_Display'] text-3xl">Select Date & Party Size</h2>
      </div>

      <Card className="space-y-5">
        {/* Date */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs tracking-[0.12em] text-[#C5A059]/80 uppercase">
            <CalendarDays size={12} /> Date
          </label>
          <CalendarPicker value={date} onChange={setDate} minDate={TODAY} />
          {errors.date && <p className="text-xs text-rose-300">{errors.date}</p>}
        </div>

        {/* Time slots */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs tracking-[0.12em] text-[#C5A059]/80 uppercase">
            <Clock size={12} /> Time
          </label>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            {TIME_SLOTS.map((slot) => (
              <button
                key={slot}
                type="button"
                onClick={() => setTime(slot)}
                className={`rounded-xl border py-2.5 text-sm transition-colors ${
                  time === slot
                    ? 'border-[#C5A059] bg-[#C5A059]/15 text-[#C5A059]'
                    : 'border-white/10 bg-black/20 text-[#F8F4EC]/60 hover:border-[#C5A059]/40 hover:text-[#F8F4EC]'
                }`}
              >
                {slot}
              </button>
            ))}
          </div>
          {errors.time && <p className="text-xs text-rose-300">{errors.time}</p>}
        </div>

        {/* Party size */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs tracking-[0.12em] text-[#C5A059]/80 uppercase">
            <Users size={12} /> Number of Guests
          </label>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setPartySize(Math.max(1, partySize - 1))}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-black/20 text-lg text-[#F8F4EC]/70 hover:border-[#C5A059]/40 transition-colors"
            >
              −
            </button>
            <span className="w-8 text-center font-['Playfair_Display'] text-2xl text-[#F8F4EC]">{partySize}</span>
            <button
              type="button"
              onClick={() => setPartySize(Math.min(12, partySize + 1))}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-black/20 text-lg text-[#F8F4EC]/70 hover:border-[#C5A059]/40 transition-colors"
            >
              +
            </button>
            <span className="text-sm text-[#F8F4EC]/40">
              {partySize === 1 ? '1 guest' : `${partySize} guests`}
            </span>
          </div>
          {errors.partySize && <p className="text-xs text-rose-300">{errors.partySize}</p>}
        </div>
      </Card>
    </motion.div>
  )
}

// ── Step 2: Table Picker ─────────────────────────────────────────────────────

function StepTablePicker({
  date, time, partySize, availability, loading,
  selectedTableId, setSelectedTableId, error,
}: {
  date: string; time: string; partySize: number
  availability: Record<string, boolean>; loading: boolean
  selectedTableId: string | null; setSelectedTableId: (id: string) => void
  error?: string
}) {
  const areas = Array.from(new Set(floorTables.map((t) => t.area)))
  const levels = Array.from(new Set(floorTables.map((t) => t.level)))
  const [areaFilter, setAreaFilter] = useState<string>('All')
  const [levelFilter, setLevelFilter] = useState<string>('All')
  const visibleTables = floorTables.filter((t) =>
    (areaFilter === 'All' || t.area === areaFilter) &&
    (levelFilter === 'All' || t.level === levelFilter),
  )
  const zones = Array.from(new Set(visibleTables.map((t) => t.zone)))

  return (
    <motion.div
      key="s2"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.35 }}
      className="space-y-6"
    >
      <div>
        <p className="text-xs tracking-[0.25em] text-[#C5A059]">STEP 2</p>
        <h2 className="mt-2 font-['Playfair_Display'] text-3xl">Choose Your Table</h2>
        <p className="mt-1 text-sm text-[#F8F4EC]/50">
          {date} · {time} · {partySize} {partySize === 1 ? 'guest' : 'guests'}
        </p>
      </div>

      {/* Floor filters */}
      <Card className="space-y-3">
        <div>
          <p className="text-xs tracking-[0.2em] text-[#C5A059]/70">AREA</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {['All', ...areas].map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => setAreaFilter(a)}
                className={`rounded-lg px-3 py-1.5 text-xs transition-colors ${
                  areaFilter === a
                    ? 'bg-[#C5A059] text-[#080706] font-medium'
                    : 'bg-white/6 text-[#F8F4EC]/60 hover:bg-white/10'
                }`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs tracking-[0.2em] text-[#C5A059]/70">LEVEL</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {['All', ...levels].map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLevelFilter(l)}
                className={`rounded-lg px-3 py-1.5 text-xs transition-colors ${
                  levelFilter === l
                    ? 'bg-[#C5A059] text-[#080706] font-medium'
                    : 'bg-white/6 text-[#F8F4EC]/60 hover:bg-white/10'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Floor plan */}
      <Card noPad className="overflow-hidden">
        <div className="border-b border-white/6 px-5 py-3">
          <p className="text-xs tracking-[0.2em] text-[#C5A059]/70">INTERACTIVE FLOOR PLAN</p>
        </div>
        <div className="relative p-4">
          {loading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-black/60 backdrop-blur-sm">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                className="h-6 w-6 rounded-full border-2 border-[#C5A059]/30 border-t-[#C5A059]"
              />
            </div>
          )}

          {/* Floor plan SVG-like layout */}
          <div
            className="relative mx-auto overflow-hidden rounded-2xl border border-[#C5A059]/15"
            style={{
              height: 380,
              background: 'radial-gradient(ellipse at 30% 20%, rgba(197,160,89,0.06) 0%, transparent 60%), #0a0908',
            }}
          >
            {/* Room decorations */}
            <div className="pointer-events-none absolute inset-4 rounded-xl border border-dashed border-white/5" />
            {/* Zone labels */}
            <div className="pointer-events-none absolute left-3 top-3 text-[9px] tracking-[0.2em] text-[#C5A059]/25">DINING ROOM</div>
            <div className="pointer-events-none absolute bottom-3 right-3 text-[9px] tracking-[0.2em] text-[#C5A059]/25">CELLAR WING</div>

            {/* Tables */}
            {visibleTables.map((table) => {
              const avail = availability[table.id] ?? true
              const selected = table.id === selectedTableId
              const isRound = table.shape === 'round'

              return (
                <motion.button
                  key={table.id}
                  type="button"
                  disabled={!avail}
                  onClick={() => avail && setSelectedTableId(table.id)}
                  whileHover={avail ? { scale: 1.08 } : {}}
                  whileTap={avail ? { scale: 0.96 } : {}}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-200 ${
                    isRound ? 'rounded-full' : 'rounded-xl'
                  } ${
                    !avail
                      ? 'cursor-not-allowed border border-rose-500/20 bg-rose-900/20 text-rose-400/50'
                      : selected
                      ? 'border-2 border-[#C5A059] bg-[#C5A059]/20 text-[#C5A059] shadow-[0_0_20px_rgba(197,160,89,0.3)]'
                      : 'border border-[#C5A059]/30 bg-[#C5A059]/8 text-[#C5A059]/70 hover:border-[#C5A059]/60 hover:bg-[#C5A059]/15'
                  }`}
                  style={{
                    left: `${table.x}%`,
                    top: `${table.y}%`,
                    width: isRound ? 56 : 72,
                    height: isRound ? 56 : 44,
                  }}
                  title={`${table.name} · ${table.seats} seats · ${avail ? 'Available' : 'Unavailable'}`}
                >
                  <span className="flex flex-col items-center leading-tight">
                    <span className="text-[10px] font-medium">{table.id}</span>
                    <span className="text-[8px] opacity-70">{table.seats}p</span>
                  </span>
                </motion.button>
              )
            })}
          </div>

          {/* Legend */}
          <div className="mt-3 flex flex-wrap items-center gap-4 px-1">
            <div className="flex items-center gap-1.5 text-xs text-[#F8F4EC]/50">
              <div className="h-3 w-3 rounded-full border border-[#C5A059]/40 bg-[#C5A059]/10" />
              Available
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[#F8F4EC]/50">
              <div className="h-3 w-3 rounded-full border border-rose-500/30 bg-rose-900/20" />
              Unavailable
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[#F8F4EC]/50">
              <div className="h-3 w-3 rounded-full border-2 border-[#C5A059] bg-[#C5A059]/20" />
              Selected
            </div>
          </div>
        </div>
      </Card>

      {/* Table list by zone */}
      <div className="space-y-4">
        {zones.map((zone) => {
          const zoneTables = visibleTables.filter((t) => t.zone === zone)
          return (
            <div key={zone}>
              <p className="mb-2 text-xs tracking-[0.2em] text-[#C5A059]/60">{zone.toUpperCase()}</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {zoneTables.map((table) => {
                  const avail = availability[table.id] ?? true
                  const selected = table.id === selectedTableId
                  return (
                    <button
                      key={table.id}
                      type="button"
                      disabled={!avail}
                      onClick={() => avail && setSelectedTableId(table.id)}
                      className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left transition-colors ${
                        !avail
                          ? 'cursor-not-allowed border-rose-500/15 bg-rose-900/10 opacity-50'
                          : selected
                          ? 'border-[#C5A059] bg-[#C5A059]/12'
                          : 'border-white/8 bg-black/20 hover:border-[#C5A059]/35'
                      }`}
                    >
                      <div>
                        <p className={`text-sm font-medium ${selected ? 'text-[#C5A059]' : 'text-[#F8F4EC]'}`}>{table.name}</p>
                        <p className="mt-0.5 text-xs text-[#F8F4EC]/45">
                          Up to {table.seats} guests · min. {table.minParty}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {selected && <CheckCircle2 size={14} className="text-[#C5A059]" />}
                        <span className={`text-xs ${avail ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {avail ? 'Free' : 'Taken'}
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
      {visibleTables.length === 0 && (
        <Card className="py-6 text-center">
          <p className="text-sm text-[#F8F4EC]/45">No tables match these filters.</p>
        </Card>
      )}
      {error && <p className="text-sm text-rose-300">{error}</p>}
    </motion.div>
  )
}

// ── Calendar Picker ─────────────────────────────────────────────────────────

function CalendarPicker({
  value,
  onChange,
  minDate,
}: {
  value: string
  onChange: (v: string) => void
  minDate: string
}) {
  const selected = value ? parseISODate(value) : null
  const min = parseISODate(minDate)
  const [view, setView] = useState<Date>(() => selected ?? new Date())

  useEffect(() => {
    if (selected) {
      const sameMonth = selected.getMonth() === view.getMonth() && selected.getFullYear() === view.getFullYear()
      if (!sameMonth) setView(selected)
    }
  }, [value, selected, view])

  const year = view.getFullYear()
  const month = view.getMonth()
  const first = new Date(year, month, 1)
  const startDay = (first.getDay() + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells = Array.from({ length: startDay + daysInMonth }, (_, i) => (i < startDay ? null : i - startDay + 1))

  const isPast = (d: Date) => d < new Date(min.getFullYear(), min.getMonth(), min.getDate())

  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setView(new Date(year, month - 1, 1))}
          className="rounded-lg border border-white/10 px-2.5 py-1 text-xs text-[#F8F4EC]/60 hover:border-[#C5A059]/40"
        >
          <ChevronLeft size={12} />
        </button>
        <p className="text-sm tracking-[0.2em] text-[#C5A059]">
          {view.toLocaleString('en-GB', { month: 'long', year: 'numeric' }).toUpperCase()}
        </p>
        <button
          type="button"
          onClick={() => setView(new Date(year, month + 1, 1))}
          className="rounded-lg border border-white/10 px-2.5 py-1 text-xs text-[#F8F4EC]/60 hover:border-[#C5A059]/40"
        >
          <ChevronRight size={12} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-[#F8F4EC]/40">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
          <div key={d} className="py-1">{d}</div>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (!day) return <div key={`blank-${i}`} className="h-9" />
          const dateObj = new Date(year, month, day)
          const iso = toISODate(dateObj)
          const disabled = isPast(dateObj)
          const isSelected = value === iso
          const isToday = iso === TODAY
          return (
            <button
              key={iso}
              type="button"
              disabled={disabled}
              onClick={() => onChange(iso)}
              className={`h-9 rounded-lg text-xs transition-colors ${
                disabled
                  ? 'cursor-not-allowed text-[#F8F4EC]/20'
                  : isSelected
                  ? 'bg-[#C5A059] text-[#080706] font-medium'
                  : 'border border-transparent text-[#F8F4EC]/70 hover:border-[#C5A059]/40 hover:text-[#F8F4EC]'
              } ${isToday && !isSelected ? 'border border-[#C5A059]/30' : ''}`}
            >
              {day}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ── Step 3: Guest Details ────────────────────────────────────────────────────

function StepGuestDetails({
  guestName, setGuestName, guestPhone, setGuestPhone,
  specialRequest, setSpecialRequest, errors, summary,
}: {
  guestName: string; setGuestName: (v: string) => void
  guestPhone: string; setGuestPhone: (v: string) => void
  specialRequest: string; setSpecialRequest: (v: string) => void
  errors: Record<string, string>
  summary: { date: string; time: string; partySize: number; tableName: string; zone: string }
}) {
  return (
    <motion.div
      key="s3"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.35 }}
      className="space-y-6"
    >
      <div>
        <p className="text-xs tracking-[0.25em] text-[#C5A059]">STEP 3</p>
        <h2 className="mt-2 font-['Playfair_Display'] text-3xl">Your Details</h2>
      </div>

      {/* Booking summary */}
      <div className="rounded-xl border border-[#C5A059]/20 bg-[#C5A059]/5 p-4">
        <p className="mb-3 text-xs tracking-[0.2em] text-[#C5A059]/70">BOOKING SUMMARY</p>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-2 text-[#F8F4EC]/60">
            <CalendarDays size={12} className="text-[#C5A059]/60" />
            {summary.date}
          </div>
          <div className="flex items-center gap-2 text-[#F8F4EC]/60">
            <Clock size={12} className="text-[#C5A059]/60" />
            {summary.time}
          </div>
          <div className="flex items-center gap-2 text-[#F8F4EC]/60">
            <Users size={12} className="text-[#C5A059]/60" />
            {summary.partySize} {summary.partySize === 1 ? 'guest' : 'guests'}
          </div>
          <div className="flex items-center gap-2 text-[#F8F4EC]/60">
            <MapPin size={12} className="text-[#C5A059]/60" />
            {summary.tableName}
          </div>
        </div>
      </div>

      <Card className="space-y-4">
        <Input
          label="Full Name"
          placeholder="e.g. Marco Rossi"
          value={guestName}
          onChange={(e) => setGuestName(e.target.value)}
          error={errors.guestName}
        />
        <Input
          label="Phone Number"
          placeholder="e.g. +48 600 123 456"
          type="tel"
          value={guestPhone}
          onChange={(e) => setGuestPhone(e.target.value)}
          error={errors.guestPhone}
        />
        <Textarea
          label="Special Request (optional)"
          placeholder="Allergies, celebrations, seating preferences…"
          value={specialRequest}
          onChange={(e) => setSpecialRequest(e.target.value)}
          rows={3}
        />
        <p className="text-xs text-[#F8F4EC]/35">
          No account required. Your reservation will be linked to this device via a browser cookie so you can manage it later.
        </p>
      </Card>
    </motion.div>
  )
}

// ── Step 4: Confirmation ─────────────────────────────────────────────────────

function ConfirmationScreen({
  name, date, time, tableName, reservationId,
}: {
  name: string; date: string; time: string; tableName: string; reservationId: string
}) {
  return (
    <motion.div
      {...pageTransition}
      className="mx-auto flex max-w-lg flex-col items-center px-4 py-20 text-center"
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 18 }}
        className="mb-8 flex h-20 w-20 items-center justify-center rounded-full border border-[#C5A059]/30 bg-[#C5A059]/10"
      >
        <CheckCircle2 size={36} className="text-[#C5A059]" />
      </motion.div>
      <p className="text-xs tracking-[0.3em] text-[#C5A059]">RESERVATION RECEIVED</p>
      <h2 className="mt-4 font-['Playfair_Display'] text-4xl">Thank you, {name.split(' ')[0]}.</h2>
      <div className="my-6 h-px w-16 bg-gradient-to-r from-transparent via-[#C5A059] to-transparent" />
      <p className="font-['Cormorant_Garamond'] text-lg text-[#F8F4EC]/65">
        Your table at <span className="text-[#F8F4EC]">{tableName}</span> has been requested for{' '}
        <span className="text-[#F8F4EC]">{date}</span> at <span className="text-[#F8F4EC]">{time}</span>.
      </p>
      <p className="mt-3 text-sm text-[#F8F4EC]/45">
        We will confirm your reservation shortly. You can view and manage it in the <strong className="text-[#F8F4EC]/70">My Reservations</strong> tab.
      </p>
      {reservationId && (
        <p className="mt-4 rounded-xl border border-white/8 bg-black/20 px-4 py-2 font-mono text-xs text-[#F8F4EC]/40">
          Ref: {reservationId}
        </p>
      )}
    </motion.div>
  )
}

// Suppress unused import warnings
void itemFadeIn
void User
void Phone
void MessageSquare

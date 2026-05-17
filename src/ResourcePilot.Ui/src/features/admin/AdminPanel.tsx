import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CalendarDays, Clock, Users, MapPin, Trash2,
  MessageSquare, LogOut, BarChart3, Inbox, Settings,
  ChevronDown, ChevronLeft, ChevronRight, Search, Filter,
} from 'lucide-react'
import { pageTransition } from '../../app/core/motion'
import { reservationService, ticketService, adminAuthService } from '../../app/core/mockServices'
import type { AdminSession, Reservation, ReservationStatus, SupportTicket, TicketStatus } from '../../app/core/types'
import { reservationStatuses, ticketStatuses, RESTAURANT_NAME } from '../../app/core/constants'
import { Button } from '../../shared/ui/Button'
import { Card } from '../../shared/ui/Card'
import { StatusBadge } from '../../shared/ui/StatusBadge'
import { Textarea } from '../../shared/ui/Input'

type AdminTab = 'overview' | 'reservations' | 'tickets'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
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

export function AdminPanel({
  session,
  onLogout,
  onToast,
}: {
  session: AdminSession
  onLogout: () => void
  onToast: (title: string, msg: string, type?: 'success' | 'error' | 'info') => void
}) {
  const [tab, setTab] = useState<AdminTab>('overview')
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [resFilter, setResFilter] = useState<ReservationStatus | 'All'>('All')
  const [resSearch, setResSearch] = useState('')
  const [ticketFilter, setTicketFilter] = useState<TicketStatus | 'All'>('All')
  const [expandedRes, setExpandedRes] = useState<string | null>(null)
  const [expandedTicket, setExpandedTicket] = useState<string | null>(null)
  const [notesDraft, setNotesDraft] = useState<Record<string, string>>({})
  const [replyDraft, setReplyDraft] = useState<Record<string, string>>({})
  const [confirmDelete, setConfirmDelete] = useState<{ type: 'res' | 'ticket'; id: string } | null>(null)

  const load = async () => {
    setLoading(true)
    const [res, tix] = await Promise.all([reservationService.listAll(), ticketService.listAll()])
    setReservations(res)
    setTickets(tix)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  // ── Stats ──────────────────────────────────────────────────────────────────
  const now = new Date()
  const upcoming = reservations.filter((r) => new Date(r.dateTime) >= now && r.status !== 'Cancelled' && r.status !== 'Rejected')
  const today = reservations.filter((r) => r.dateTime.slice(0, 10) === now.toISOString().slice(0, 10))
  const pending = reservations.filter((r) => r.status === 'Pending')
  const openTickets = tickets.filter((t) => t.status === 'New' || t.status === 'InProgress')

  // ── Reservation actions ────────────────────────────────────────────────────
  const updateResStatus = async (id: string, status: ReservationStatus) => {
    const note = notesDraft[id]?.trim()
    await reservationService.updateStatus(id, status, note)
    onToast('Status updated', `Reservation ${id} -> ${status}`)
    await load()
  }

  const updateResNote = async (id: string) => {
    const noteRaw = notesDraft[id]
    const note = noteRaw?.trim()
    await reservationService.updateNote(id, note ? note : undefined)
    onToast('Note saved', `Reservation ${id} updated.`)
    setNotesDraft((p) => ({ ...p, [id]: note ?? '' }))
    await load()
  }

  const deleteRes = async (id: string) => {
    await reservationService.delete(id)
    setConfirmDelete(null)
    onToast('Deleted', `Reservation ${id} removed.`, 'info')
    await load()
  }

  // ── Ticket actions ─────────────────────────────────────────────────────────
  const replyTicket = async (id: string, status: TicketStatus) => {
    const reply = replyDraft[id]?.trim()
    if (!reply) { onToast('Empty reply', 'Please write a reply first.', 'error'); return }
    await ticketService.adminReply(id, reply, status)
    setReplyDraft((p) => ({ ...p, [id]: '' }))
    onToast('Reply sent', `Ticket ${id} updated.`)
    await load()
  }

  const deleteTicket = async (id: string) => {
    await ticketService.delete(id)
    setConfirmDelete(null)
    onToast('Deleted', `Ticket ${id} removed.`, 'info')
    await load()
  }

  // ── Filtered lists ─────────────────────────────────────────────────────────
  const filteredRes = reservations
    .filter((r) => resFilter === 'All' || r.status === resFilter)
    .filter((r) =>
      !resSearch ||
      r.guestName.toLowerCase().includes(resSearch.toLowerCase()) ||
      r.id.toLowerCase().includes(resSearch.toLowerCase()) ||
      r.guestPhone.includes(resSearch),
    )
    .sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime())

  const filteredTickets = tickets
    .filter((t) => ticketFilter === 'All' || t.status === ticketFilter)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const handleLogout = () => {
    adminAuthService.logout()
    onLogout()
  }

  return (
    <motion.div {...pageTransition} className="min-h-screen">
      {/* Admin top bar */}
      <div className="sticky top-0 z-20 border-b border-[#C5A059]/15 bg-[#080706]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <p className="font-['Playfair_Display'] text-lg text-[#C5A059]">{RESTAURANT_NAME}</p>
            <span className="rounded-full border border-[#C5A059]/30 bg-[#C5A059]/10 px-2 py-0.5 text-[10px] tracking-[0.15em] text-[#C5A059]">
              ADMIN
            </span>
          </div>
          <div className="flex items-center gap-3">
            <p className="hidden text-xs text-[#F8F4EC]/40 sm:block">{session.email}</p>
            <Button size="sm" variant="ghost" onClick={handleLogout}>
              <LogOut size={13} /> Sign Out
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Tab navigation */}
        <div className="mb-8 flex gap-2 overflow-x-auto">
          {([
            { key: 'overview' as AdminTab, label: 'Overview', icon: BarChart3 },
            { key: 'reservations' as AdminTab, label: `Reservations (${reservations.length})`, icon: CalendarDays },
            { key: 'tickets' as AdminTab, label: `Messages (${tickets.length})`, icon: Inbox },
          ]).map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm transition-colors ${
                tab === key
                  ? 'bg-[#C5A059] text-[#080706] font-medium'
                  : 'bg-white/6 text-[#F8F4EC]/60 hover:bg-white/10'
              }`}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>

        {loading && (
          <div className="flex justify-center py-20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
              className="h-8 w-8 rounded-full border-2 border-[#C5A059]/30 border-t-[#C5A059]"
            />
          </div>
        )}

        {!loading && (
          <AnimatePresence mode="wait">
            {tab === 'overview' && (
              <OverviewTab
                key="overview"
                upcoming={upcoming.length}
                today={today.length}
                pending={pending.length}
                openTickets={openTickets.length}
                recentReservations={reservations.slice(0, 5)}
              />
            )}
            {tab === 'reservations' && (
              <ReservationsTab
                key="reservations"
                reservations={filteredRes}
                allReservations={reservations}
                resFilter={resFilter}
                setResFilter={setResFilter}
                resSearch={resSearch}
                setResSearch={setResSearch}
                expandedRes={expandedRes}
                setExpandedRes={setExpandedRes}
                notesDraft={notesDraft}
                setNotesDraft={setNotesDraft}
                confirmDelete={confirmDelete}
                setConfirmDelete={setConfirmDelete}
                onUpdateStatus={updateResStatus}
                onDelete={deleteRes}
              />
            )}
            {tab === 'tickets' && (
              <TicketsTab
                key="tickets"
                tickets={filteredTickets}
                ticketFilter={ticketFilter}
                setTicketFilter={setTicketFilter}
                expandedTicket={expandedTicket}
                setExpandedTicket={setExpandedTicket}
                replyDraft={replyDraft}
                setReplyDraft={setReplyDraft}
                confirmDelete={confirmDelete}
                setConfirmDelete={setConfirmDelete}
                onReply={replyTicket}
                onDelete={deleteTicket}
              />
            )}
          </AnimatePresence>
        )}
      </div>

      {/* Confirm delete modal */}
      <AnimatePresence>
        {confirmDelete && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
              onClick={() => setConfirmDelete(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 px-4"
            >
              <Card className="space-y-4 text-center">
                <p className="font-['Playfair_Display'] text-xl">Confirm deletion</p>
                <p className="text-sm text-[#F8F4EC]/60">
                  This action cannot be undone. The {confirmDelete.type === 'res' ? 'reservation' : 'message'} will be permanently removed.
                </p>
                <div className="flex gap-3">
                  <Button variant="ghost" className="flex-1" onClick={() => setConfirmDelete(null)}>Cancel</Button>
                  <Button
                    variant="danger"
                    className="flex-1"
                    onClick={() =>
                      confirmDelete.type === 'res'
                        ? deleteRes(confirmDelete.id)
                        : deleteTicket(confirmDelete.id)
                    }
                  >
                    Delete
                  </Button>
                </div>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ── Overview Tab ─────────────────────────────────────────────────────────────

function OverviewTab({
  upcoming, today, pending, openTickets, recentReservations,
}: {
  upcoming: number; today: number; pending: number; openTickets: number
  recentReservations: Reservation[]
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-8"
    >
      <div>
        <p className="text-xs tracking-[0.25em] text-[#C5A059]">DASHBOARD</p>
        <h2 className="mt-1 font-['Playfair_Display'] text-3xl">Overview</h2>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Upcoming', value: upcoming, sub: 'reservations', color: 'text-emerald-300' },
          { label: 'Today', value: today, sub: 'bookings', color: 'text-sky-300' },
          { label: 'Pending', value: pending, sub: 'awaiting approval', color: 'text-amber-300' },
          { label: 'Open Messages', value: openTickets, sub: 'need response', color: 'text-violet-300' },
        ].map((stat) => (
          <Card key={stat.label} className="space-y-1">
            <p className="text-xs tracking-[0.15em] text-[#F8F4EC]/40">{stat.label.toUpperCase()}</p>
            <p className={`font-['Playfair_Display'] text-4xl ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-[#F8F4EC]/40">{stat.sub}</p>
          </Card>
        ))}
      </div>

      {/* Recent reservations */}
      <div>
        <p className="mb-4 text-xs tracking-[0.2em] text-[#C5A059]/70">RECENT RESERVATIONS</p>
        <div className="space-y-2">
          {recentReservations.map((r) => (
            <div
              key={r.id}
              className="flex items-center justify-between gap-4 rounded-xl border border-white/6 bg-black/20 px-4 py-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{r.guestName}</p>
                <p className="text-xs text-[#F8F4EC]/40">{r.tableName} · {formatDate(r.dateTime)} {formatTime(r.dateTime)}</p>
              </div>
              <StatusBadge status={r.status} />
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

// ── Reservations Tab ──────────────────────────────────────────────────────────

function ReservationsTab({
  reservations, allReservations, resFilter, setResFilter, resSearch, setResSearch,
  expandedRes, setExpandedRes, notesDraft, setNotesDraft,
  confirmDelete, setConfirmDelete, onUpdateStatus, onDelete,
}: {
  reservations: Reservation[]
  allReservations: Reservation[]
  resFilter: ReservationStatus | 'All'
  setResFilter: (v: ReservationStatus | 'All') => void
  resSearch: string
  setResSearch: (v: string) => void
  expandedRes: string | null
  setExpandedRes: (v: string | null) => void
  notesDraft: Record<string, string>
  setNotesDraft: (fn: (p: Record<string, string>) => Record<string, string>) => void
  confirmDelete: { type: 'res' | 'ticket'; id: string } | null
  setConfirmDelete: (v: { type: 'res' | 'ticket'; id: string } | null) => void
  onUpdateStatus: (id: string, status: ReservationStatus) => Promise<void>
  onDelete: (id: string) => Promise<void>
}) {
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const statusCounts = (['All', ...reservationStatuses] as (ReservationStatus | 'All')[]).map((s) => ({
    status: s,
    count: s === 'All' ? allReservations.length : allReservations.filter((r) => r.status === s).length,
  }))

  const dateFiltered = reservations.filter((r) => {
    const day = toISODate(r.dateTime)
    if (fromDate && day < fromDate) return false
    if (toDate && day > toDate) return false
    return true
  })
  const totalPages = Math.max(1, Math.ceil(dateFiltered.length / perPage))
  const safePage = Math.min(page, totalPages)
  const start = (safePage - 1) * perPage
  const pageItems = dateFiltered.slice(start, start + perPage)

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      <div>
        <p className="text-xs tracking-[0.25em] text-[#C5A059]">MANAGE</p>
        <h2 className="mt-1 font-['Playfair_Display'] text-3xl">Reservations</h2>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#F8F4EC]/30" />
          <input
            placeholder="Search by name, phone, or ID…"
            value={resSearch}
            onChange={(e) => setResSearch(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-black/25 py-2.5 pl-9 pr-4 text-sm text-[#F8F4EC] outline-none placeholder:text-[#F8F4EC]/30 focus:border-[#C5A059]/60"
          />
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <Filter size={12} className="shrink-0 text-[#F8F4EC]/30" />
          {statusCounts.map(({ status, count }) => (
            <button
              key={status}
              type="button"
              onClick={() => { setResFilter(status); setPage(1) }}
              className={`shrink-0 rounded-lg px-2.5 py-1.5 text-xs transition-colors ${
                resFilter === status
                  ? 'bg-[#C5A059] text-[#080706] font-medium'
                  : 'bg-white/6 text-[#F8F4EC]/50 hover:bg-white/10'
              }`}
            >
              {status} ({count})
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
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
            options={[10, 15, 20, 30].map((n) => ({ value: String(n), label: `${n} items` }))}
          />
        </div>
      </div>

      {dateFiltered.length === 0 && (
        <Card className="py-12 text-center">
          <p className="text-[#F8F4EC]/40">No reservations match your filter.</p>
        </Card>
      )}

      <div className="space-y-3">
        {pageItems.map((r) => {
          const isExpanded = expandedRes === r.id
          const isPast = new Date(r.dateTime) < new Date()
          return (
            <Card key={r.id} noPad className="overflow-hidden">
              {/* Header row */}
              <button
                type="button"
                onClick={() => setExpandedRes(isExpanded ? null : r.id)}
                className="flex w-full items-center justify-between gap-4 p-4 text-left hover:bg-white/3 transition-colors"
              >
                <div className="flex min-w-0 flex-1 items-center gap-4">
                  <div className={`h-2 w-2 shrink-0 rounded-full ${isPast ? 'bg-zinc-500' : 'bg-emerald-400'}`} />
                  <div className="min-w-0">
                    <p className="truncate font-medium">{r.guestName}</p>
                    <p className="text-xs text-[#F8F4EC]/40">
                      {r.tableName} · {formatDate(r.dateTime)} {formatTime(r.dateTime)} · {r.partySize}p
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <StatusBadge status={r.status} />
                  <ChevronDown
                    size={14}
                    className={`text-[#F8F4EC]/30 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                  />
                </div>
              </button>

              {/* Expanded details */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden border-t border-white/6"
                  >
                    <div className="space-y-4 p-4">
                      {/* Info grid */}
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        <InfoChipAdmin icon={CalendarDays} label="Date" value={formatDate(r.dateTime)} />
                        <InfoChipAdmin icon={Clock} label="Time" value={formatTime(r.dateTime)} />
                        <InfoChipAdmin icon={Users} label="Guests" value={`${r.partySize} people`} />
                        <InfoChipAdmin icon={MapPin} label="Zone" value={r.zone} />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <InfoChipAdmin icon={MessageSquare} label="Phone" value={r.guestPhone} />
                        <InfoChipAdmin icon={Settings} label="Ref" value={r.id} />
                      </div>

                      {r.specialRequest && (
                        <div className="rounded-xl border border-[#C5A059]/15 bg-[#C5A059]/5 px-4 py-3">
                          <p className="text-xs tracking-[0.1em] text-[#C5A059]/60">GUEST REQUEST</p>
                          <p className="mt-1 text-sm text-[#F8F4EC]/70">{r.specialRequest}</p>
                        </div>
                      )}

                      {/* Admin note */}
                      <div className="space-y-2">
                        <p className="text-xs tracking-[0.1em] text-[#F8F4EC]/40">ADMIN NOTE</p>
                        <Textarea
                          placeholder="Add a note for this reservation…"
                          value={notesDraft[r.id] ?? r.adminNote ?? ''}
                          onChange={(e) => setNotesDraft((p) => ({ ...p, [r.id]: e.target.value }))}
                          rows={2}
                        />
                        <div className="flex justify-end">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => updateResNote(r.id)}
                            disabled={(notesDraft[r.id] ?? r.adminNote ?? '') === (r.adminNote ?? '')}
                          >
                            Save Note
                          </Button>
                        </div>
                      </div>

                      {/* Status buttons */}
                      <div className="flex flex-wrap gap-2">
                        {reservationStatuses.map((s) => (
                          <Button
                            key={s}
                            size="sm"
                            variant={r.status === s ? 'primary' : 'ghost'}
                            onClick={() => onUpdateStatus(r.id, s)}
                          >
                            {s}
                          </Button>
                        ))}
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => setConfirmDelete({ type: 'res', id: r.id })}
                        >
                          <Trash2 size={12} /> Delete
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          )
        })}
      </div>

      {dateFiltered.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-[#F8F4EC]/40">
            Page {safePage} of {totalPages} · {dateFiltered.length} total
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

// ── Tickets Tab ───────────────────────────────────────────────────────────────

function TicketsTab({
  tickets, ticketFilter, setTicketFilter,
  expandedTicket, setExpandedTicket,
  replyDraft, setReplyDraft,
  confirmDelete, setConfirmDelete,
  onReply, onDelete,
}: {
  tickets: SupportTicket[]
  ticketFilter: TicketStatus | 'All'
  setTicketFilter: (v: TicketStatus | 'All') => void
  expandedTicket: string | null
  setExpandedTicket: (v: string | null) => void
  replyDraft: Record<string, string>
  setReplyDraft: (fn: (p: Record<string, string>) => Record<string, string>) => void
  confirmDelete: { type: 'res' | 'ticket'; id: string } | null
  setConfirmDelete: (v: { type: 'res' | 'ticket'; id: string } | null) => void
  onReply: (id: string, status: TicketStatus) => Promise<void>
  onDelete: (id: string) => Promise<void>
}) {
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const dateFiltered = tickets.filter((t) => {
    const day = toISODate(t.createdAt)
    if (fromDate && day < fromDate) return false
    if (toDate && day > toDate) return false
    return true
  })
  const totalPages = Math.max(1, Math.ceil(dateFiltered.length / perPage))
  const safePage = Math.min(page, totalPages)
  const start = (safePage - 1) * perPage
  const pageItems = dateFiltered.slice(start, start + perPage)
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      <div>
        <p className="text-xs tracking-[0.25em] text-[#C5A059]">MANAGE</p>
        <h2 className="mt-1 font-['Playfair_Display'] text-3xl">Guest Messages</h2>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-1.5 overflow-x-auto">
        <Filter size={12} className="shrink-0 text-[#F8F4EC]/30" />
        {(['All', ...ticketStatuses] as (TicketStatus | 'All')[]).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => { setTicketFilter(s); setPage(1) }}
            className={`shrink-0 rounded-lg px-2.5 py-1.5 text-xs transition-colors ${
              ticketFilter === s
                ? 'bg-[#C5A059] text-[#080706] font-medium'
                : 'bg-white/6 text-[#F8F4EC]/50 hover:bg-white/10'
            }`}
          >
            {s === 'InProgress' ? 'In Progress' : s}
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
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
            options={[10, 15, 20, 30].map((n) => ({ value: String(n), label: `${n} items` }))}
          />
        </div>
      </div>

      {dateFiltered.length === 0 && (
        <Card className="py-12 text-center">
          <p className="text-[#F8F4EC]/40">No messages match your filter.</p>
        </Card>
      )}

      <div className="space-y-3">
        {pageItems.map((t) => {
          const isExpanded = expandedTicket === t.id
          return (
            <Card key={t.id} noPad className="overflow-hidden">
              <button
                type="button"
                onClick={() => setExpandedTicket(isExpanded ? null : t.id)}
                className="flex w-full items-center justify-between gap-4 p-4 text-left hover:bg-white/3 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-[#F8F4EC]/50">
                      {t.category}
                    </span>
                    {!t.adminReply && (t.status === 'New') && (
                      <span className="rounded-full bg-violet-500/20 px-2 py-0.5 text-[10px] text-violet-300">NEW</span>
                    )}
                  </div>
                  <p className="mt-1 truncate font-medium">{t.subject}</p>
                  <p className="text-xs text-[#F8F4EC]/40">{t.guestName} · {formatDate(t.createdAt)}</p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <StatusBadge status={t.status} />
                  <ChevronDown
                    size={14}
                    className={`text-[#F8F4EC]/30 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                  />
                </div>
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden border-t border-white/6"
                  >
                    <div className="space-y-4 p-4">
                      {/* Guest info */}
                      <div className="grid grid-cols-2 gap-3">
                        <InfoChipAdmin icon={MessageSquare} label="From" value={t.guestName} />
                        {t.guestEmail && <InfoChipAdmin icon={Settings} label="Email" value={t.guestEmail} />}
                      </div>

                      {/* Message */}
                      <div className="rounded-xl border border-white/8 bg-black/20 px-4 py-3">
                        <p className="text-xs tracking-[0.1em] text-[#F8F4EC]/40">MESSAGE</p>
                        <p className="mt-2 text-sm leading-relaxed text-[#F8F4EC]/75">{t.message}</p>
                      </div>

                      {/* Existing reply */}
                      {t.adminReply && (
                        <div className="rounded-xl border border-[#C5A059]/20 bg-[#C5A059]/5 px-4 py-3">
                          <p className="text-xs tracking-[0.1em] text-[#C5A059]/60">YOUR REPLY</p>
                          <p className="mt-1 text-sm text-[#F8F4EC]/70">{t.adminReply}</p>
                        </div>
                      )}

                      {/* Reply form */}
                      <div className="space-y-2">
                        <p className="text-xs tracking-[0.1em] text-[#F8F4EC]/40">
                          {t.adminReply ? 'UPDATE REPLY' : 'WRITE REPLY'}
                        </p>
                        <Textarea
                          placeholder="Write your reply to the guest…"
                          value={replyDraft[t.id] ?? ''}
                          onChange={(e) => setReplyDraft((p) => ({ ...p, [t.id]: e.target.value }))}
                          rows={3}
                        />
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-2">
                        {ticketStatuses.map((s) => (
                          <Button
                            key={s}
                            size="sm"
                            variant={t.status === s ? 'primary' : 'ghost'}
                            onClick={() => onReply(t.id, s)}
                          >
                            {s === 'InProgress' ? 'In Progress' : s}
                          </Button>
                        ))}
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => setConfirmDelete({ type: 'ticket', id: t.id })}
                        >
                          <Trash2 size={12} /> Delete
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          )
        })}
      </div>

      {dateFiltered.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-[#F8F4EC]/40">
            Page {safePage} of {totalPages} · {dateFiltered.length} total
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

// ── Shared sub-components ─────────────────────────────────────────────────────

function InfoChipAdmin({ icon: Icon, label, value }: { icon: typeof CalendarDays; label: string; value: string }) {
  return (
    <div className="rounded-xl bg-black/20 px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-[10px] tracking-[0.1em] text-[#C5A059]/50">
        <Icon size={10} />
        {label.toUpperCase()}
      </div>
      <p className="mt-1 truncate text-xs text-[#F8F4EC]/75">{value}</p>
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


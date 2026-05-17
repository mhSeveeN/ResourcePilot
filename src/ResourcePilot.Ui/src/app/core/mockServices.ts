/**
 * mockServices.ts
 * ---------------
 * All data lives in localStorage, keyed by STORAGE_KEYS.
 * Cookie-based guest identity: a UUID stored in a JS cookie (document.cookie).
 * Admin session: stored in sessionStorage so it clears on tab close.
 *
 * Prepared for real PostgreSQL + .NET API replacement:
 *   - Every function signature mirrors what the REST endpoints will accept/return.
 *   - Replace the body of each function with an `axios` / `fetch` call.
 */

import { floorTables, ADMIN_EMAIL } from './constants'
import type {
  AdminSession,
  Reservation,
  ReservationDraft,
  SupportTicket,
  TicketCategory,
  TicketStatus,
  ReservationStatus,
} from './types'

// ─── helpers ────────────────────────────────────────────────────────────────

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

const STORAGE_KEYS = {
  reservations: 'lt_reservations',
  tickets: 'lt_tickets',
  adminSession: 'lt_admin_session',   // sessionStorage
  adminPassword: 'lt_admin_pwd',      // localStorage (mock only)
} as const

function readLS<T>(key: string, fallback: T): T {
  const raw = localStorage.getItem(key)
  if (!raw) { localStorage.setItem(key, JSON.stringify(fallback)); return structuredClone(fallback) }
  try { return JSON.parse(raw) as T } catch { return structuredClone(fallback) }
}

function writeLS<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value))
}

function readSS<T>(key: string): T | null {
  const raw = sessionStorage.getItem(key)
  if (!raw) return null
  try { return JSON.parse(raw) as T } catch { return null }
}

function writeSS<T>(key: string, value: T | null): void {
  if (value === null) sessionStorage.removeItem(key)
  else sessionStorage.setItem(key, JSON.stringify(value))
}

// ─── Cookie-based guest identity ────────────────────────────────────────────

const COOKIE_KEY = 'lt_guest_id'

export function getGuestCookieId(): string {
  const match = document.cookie.split('; ').find((row) => row.startsWith(`${COOKIE_KEY}=`))
  if (match) return match.split('=')[1]
  const id = crypto.randomUUID()
  const expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toUTCString()
  document.cookie = `${COOKIE_KEY}=${id}; expires=${expires}; path=/; SameSite=Lax`
  return id
}

// ─── Seed data ───────────────────────────────────────────────────────────────

const SEED_COOKIE = 'seed-guest-001'

const seedReservations: Reservation[] = [
  {
    id: 'R-1001',
    cookieId: SEED_COOKIE,
    guestName: 'Marco Rossi',
    guestPhone: '+48 600 123 456',
    specialRequest: 'Anniversary dinner — please prepare a small dessert surprise.',
    partySize: 2,
    tableId: 'T2',
    tableName: 'Terrace Table',
    zone: 'Private Terrace',
    dateTime: '2026-05-20T19:30:00',
    status: 'Approved',
    createdAt: '2026-05-10T14:22:00',
  },
  {
    id: 'R-1002',
    cookieId: SEED_COOKIE,
    guestName: 'Sofia Bianchi',
    guestPhone: '+48 601 987 654',
    partySize: 4,
    tableId: 'T3',
    tableName: 'Salon A',
    zone: 'Grand Salon',
    dateTime: '2026-05-18T20:00:00',
    status: 'Completed',
    createdAt: '2026-05-08T10:00:00',
  },
  {
    id: 'R-1003',
    cookieId: 'other-guest',
    guestName: 'Luca Ferrari',
    guestPhone: '+48 602 111 222',
    specialRequest: 'Gluten-free menu required.',
    partySize: 3,
    tableId: 'T5',
    tableName: 'Cellar Niche',
    zone: 'Wine Cellar',
    dateTime: '2026-05-22T19:00:00',
    status: 'Pending',
    createdAt: '2026-05-12T09:15:00',
  },
  {
    id: 'R-1004',
    cookieId: 'other-guest-2',
    guestName: 'Elena Conti',
    guestPhone: '+48 603 444 555',
    partySize: 6,
    tableId: 'T4',
    tableName: 'Salon B',
    zone: 'Grand Salon',
    dateTime: '2026-05-16T18:30:00',
    status: 'Approved',
    createdAt: '2026-05-05T16:00:00',
  },
]

const seedTickets: SupportTicket[] = [
  {
    id: 'TK-001',
    cookieId: SEED_COOKIE,
    guestName: 'Marco Rossi',
    guestEmail: 'marco@example.com',
    category: 'Special Request',
    subject: 'Nut allergy — tasting menu adjustment',
    message: 'My partner has a severe nut allergy. Could the chef prepare a nut-free version of the tasting menu?',
    status: 'InProgress',
    createdAt: '2026-05-10T15:00:00',
    adminReply: 'Our chef has been informed and will prepare a fully nut-free menu for your visit.',
    adminRepliedAt: '2026-05-11T09:30:00',
  },
  {
    id: 'TK-002',
    cookieId: 'other-guest',
    guestName: 'Luca Ferrari',
    category: 'Feedback',
    subject: 'Exceptional service last visit',
    message: 'I wanted to express my gratitude for the outstanding service during my last visit. The sommelier was exceptional.',
    status: 'Resolved',
    createdAt: '2026-05-09T20:00:00',
  },
]

// Ensure seed data exists
function ensureSeed() {
  readLS(STORAGE_KEYS.reservations, seedReservations)
  readLS(STORAGE_KEYS.tickets, seedTickets)
  // Default admin password (mock — real API uses bcrypt)
  if (!localStorage.getItem(STORAGE_KEYS.adminPassword)) {
    writeLS(STORAGE_KEYS.adminPassword, 'admin123')
  }
}
ensureSeed()

// ─── Reservation Service ─────────────────────────────────────────────────────

export const reservationService = {
  /** GET /api/reservations?cookieId=... (guest) or GET /api/reservations (admin) */
  async listForGuest(cookieId: string): Promise<Reservation[]> {
    await wait(160)
    const all = readLS<Reservation[]>(STORAGE_KEYS.reservations, seedReservations)
    return all.filter((r) => r.cookieId === cookieId)
  },

  /** GET /api/reservations (admin only) */
  async listAll(): Promise<Reservation[]> {
    await wait(180)
    return readLS<Reservation[]>(STORAGE_KEYS.reservations, seedReservations)
  },

  /** GET /api/tables/availability?date=...&partySize=... */
  async getAvailability(date: string, partySize: number): Promise<Record<string, boolean>> {
    await wait(200)
    const all = readLS<Reservation[]>(STORAGE_KEYS.reservations, seedReservations)
    // A table is unavailable if it has an Approved/Pending reservation on the same calendar day
    const dayStr = date.slice(0, 10)
    const takenIds = new Set(
      all
        .filter((r) => r.dateTime.slice(0, 10) === dayStr && (r.status === 'Approved' || r.status === 'Pending'))
        .map((r) => r.tableId),
    )
    const result: Record<string, boolean> = {}
    for (const t of floorTables) {
      result[t.id] = !takenIds.has(t.id) && t.seats >= partySize
    }
    return result
  },

  /** POST /api/reservations */
  async create(draft: ReservationDraft, cookieId: string): Promise<Reservation> {
    await wait(220)
    const all = readLS<Reservation[]>(STORAGE_KEYS.reservations, seedReservations)
    const created: Reservation = {
      id: `R-${Date.now()}`,
      cookieId,
      guestName: draft.guestName,
      guestPhone: draft.guestPhone,
      specialRequest: draft.specialRequest,
      partySize: draft.partySize,
      tableId: draft.tableId,
      tableName: draft.tableName,
      zone: draft.zone,
      dateTime: draft.dateTime,
      status: 'Pending',
      createdAt: new Date().toISOString(),
    }
    writeLS(STORAGE_KEYS.reservations, [created, ...all])
    return created
  },

  /** DELETE /api/reservations/:id (guest can cancel own, admin can delete) */
  async cancel(id: string, cookieId: string): Promise<void> {
    await wait(150)
    const all = readLS<Reservation[]>(STORAGE_KEYS.reservations, seedReservations)
    const updated = all.map((r) =>
      r.id === id && r.cookieId === cookieId ? { ...r, status: 'Cancelled' as ReservationStatus } : r,
    )
    writeLS(STORAGE_KEYS.reservations, updated)
  },

  /** PATCH /api/reservations/:id/status (admin only) */
  async updateStatus(id: string, status: ReservationStatus, adminNote?: string): Promise<void> {
    await wait(150)
    const all = readLS<Reservation[]>(STORAGE_KEYS.reservations, seedReservations)
    const updated = all.map((r) =>
      r.id === id ? { ...r, status, ...(adminNote !== undefined ? { adminNote } : {}) } : r,
    )
    writeLS(STORAGE_KEYS.reservations, updated)
  },

  /** PATCH /api/reservations/:id/note (admin only) */
  async updateNote(id: string, adminNote?: string): Promise<void> {
    await wait(120)
    const all = readLS<Reservation[]>(STORAGE_KEYS.reservations, seedReservations)
    const updated = all.map((r) =>
      r.id === id ? { ...r, adminNote } : r,
    )
    writeLS(STORAGE_KEYS.reservations, updated)
  },

  /** DELETE /api/reservations/:id (admin only) */
  async delete(id: string): Promise<void> {
    await wait(130)
    const all = readLS<Reservation[]>(STORAGE_KEYS.reservations, seedReservations)
    writeLS(STORAGE_KEYS.reservations, all.filter((r) => r.id !== id))
  },
}

// ─── Ticket Service ──────────────────────────────────────────────────────────

export const ticketService = {
  /** GET /api/tickets?cookieId=... */
  async listForGuest(cookieId: string): Promise<SupportTicket[]> {
    await wait(150)
    const all = readLS<SupportTicket[]>(STORAGE_KEYS.tickets, seedTickets)
    return all.filter((t) => t.cookieId === cookieId)
  },

  /** GET /api/tickets (admin) */
  async listAll(): Promise<SupportTicket[]> {
    await wait(160)
    return readLS<SupportTicket[]>(STORAGE_KEYS.tickets, seedTickets)
  },

  /** POST /api/tickets */
  async create(data: {
    cookieId: string
    guestName: string
    guestEmail?: string
    category: TicketCategory
    subject: string
    message: string
  }): Promise<SupportTicket> {
    await wait(200)
    const all = readLS<SupportTicket[]>(STORAGE_KEYS.tickets, seedTickets)
    const created: SupportTicket = {
      id: `TK-${Date.now()}`,
      cookieId: data.cookieId,
      guestName: data.guestName,
      guestEmail: data.guestEmail,
      category: data.category,
      subject: data.subject,
      message: data.message,
      status: 'New',
      createdAt: new Date().toISOString(),
    }
    writeLS(STORAGE_KEYS.tickets, [created, ...all])
    return created
  },

  /** PATCH /api/tickets/:id (admin) */
  async adminReply(id: string, reply: string, status: TicketStatus): Promise<void> {
    await wait(150)
    const all = readLS<SupportTicket[]>(STORAGE_KEYS.tickets, seedTickets)
    const updated = all.map((t) =>
      t.id === id ? { ...t, adminReply: reply, adminRepliedAt: new Date().toISOString(), status } : t,
    )
    writeLS(STORAGE_KEYS.tickets, updated)
  },

  /** DELETE /api/tickets/:id (admin) */
  async delete(id: string): Promise<void> {
    await wait(130)
    const all = readLS<SupportTicket[]>(STORAGE_KEYS.tickets, seedTickets)
    writeLS(STORAGE_KEYS.tickets, all.filter((t) => t.id !== id))
  },
}

// ─── Admin Auth Service ──────────────────────────────────────────────────────

export const adminAuthService = {
  /** POST /api/auth/admin/login */
  async login(email: string, password: string): Promise<AdminSession> {
    await wait(200)
    const storedPwd = readLS<string>(STORAGE_KEYS.adminPassword, 'admin123')
    if (email.toLowerCase() !== ADMIN_EMAIL.toLowerCase() || password !== storedPwd) {
      throw new Error('Invalid credentials.')
    }
    const session: AdminSession = {
      token: `admin-token-${crypto.randomUUID()}`,
      email: ADMIN_EMAIL,
      expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
    }
    writeSS(STORAGE_KEYS.adminSession, session)
    return session
  },

  getSession(): AdminSession | null {
    const s = readSS<AdminSession>(STORAGE_KEYS.adminSession)
    if (!s) return null
    if (new Date(s.expiresAt) < new Date()) {
      writeSS(STORAGE_KEYS.adminSession, null)
      return null
    }
    return s
  },

  logout(): void {
    writeSS(STORAGE_KEYS.adminSession, null)
  },
}

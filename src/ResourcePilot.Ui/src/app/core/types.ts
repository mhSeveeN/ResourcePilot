export type ReservationStatus =
  | 'Pending'
  | 'Approved'
  | 'Rejected'
  | 'Cancelled'
  | 'Completed'

export type TicketStatus = 'New' | 'InProgress' | 'Resolved' | 'Closed'
export type TicketCategory = 'General' | 'Complaint' | 'Special Request' | 'Feedback' | 'Other'

export type Reservation = {
  id: string
  /** Cookie-based guest identifier (no account needed) */
  cookieId: string
  guestName: string
  guestPhone: string
  specialRequest?: string
  partySize: number
  tableId: string
  tableName: string
  zone: string
  dateTime: string          // ISO string
  status: ReservationStatus
  createdAt: string         // ISO string
  /** Admin notes */
  adminNote?: string
}

export type SupportTicket = {
  id: string
  cookieId: string
  guestName: string
  guestEmail?: string
  category: TicketCategory
  subject: string
  message: string
  status: TicketStatus
  createdAt: string
  /** Admin reply */
  adminReply?: string
  adminRepliedAt?: string
}

/** Minimal admin account stored in localStorage (mock — real impl uses JWT + bcrypt) */
export type AdminAccount = {
  email: string
  /** bcrypt hash placeholder — in mock we store plain, real API will hash */
  passwordHash: string
}

export type AdminSession = {
  token: string
  email: string
  expiresAt: string
}

export type ReservationDraft = {
  guestName: string
  guestPhone: string
  specialRequest?: string
  partySize: number
  tableId: string
  tableName: string
  zone: string
  dateTime: string
}

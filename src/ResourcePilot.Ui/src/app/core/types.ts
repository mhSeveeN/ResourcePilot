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

export type AdminAccount = {
  email: string
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

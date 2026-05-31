/*
* reservationApi.ts - 
* This file contains functions for interacting with the reservation-related API endpoints of the ResourcePilot application. 
* It includes functions to get available tables, create a reservation, retrieve a reservation by ID, and cancel a reservation. 
* Each function makes an HTTP request to the appropriate endpoint and handles the response, throwing errors if the request fails. 
* The API base URL is defined at the top of the file for easy configuration.
*/

import type { Reservation, ReservationDraft, ReservationStatus } from '../app/core/types'
import { floorTables } from '../app/core/constants'

const API_BASE = "http://localhost:5275/api";

// Mapping between frontend reservation status and backend status
// Backend use: "pending", "confirmed", "cancelled"
// Frontend use: "pending", "approved", "rejected", "cancelled", "completed"

function mapStatus(backendStatus: string): ReservationStatus {
  const map: Record<string, ReservationStatus> = {
    Pending: 'Pending',
    Confirmed: 'Approved',
    Cancelled: 'Cancelled',
  };
  return map[backendStatus] ?? 'Pending'; // Default to 'Pending' if unknown status
}

function mapStatusToBackend(frontendStatus: ReservationStatus): string {
  const map: Record<ReservationStatus, string> = {
    Pending: 'Pending',
    Approved: 'Confirmed',
    Rejected: 'Cancelled', // Assuming rejected maps to cancelled in backend
    Cancelled: 'Cancelled',
    Completed: 'Confirmed', // Assuming completed also maps to confirmed in backend
  };
  return map[frontendStatus] ?? 'Pending'; // Default to 'Pending' if unknown status
}

// ---------- Mapping answers from backend -> type of frontend reservation ----------
function mapBackendReservation(r: any): Reservation {
  // Backend returns tableNumber(int), we need to map it for table in frontend
  const table = floorTables.find((t) => t.id === `T${r.tableNumber}`)
  return {
    id: String(r.id),
    // Backend doesn't take cookieId - we use simplier string
    // components filtrating by cookieId, so we can use it in ListForGuest
    cookieId: '',
    guestName: r.customerName,
    guestPhone: r.phone,
    specialRequest: r.notes ?? undefined,
    partySize: r.guestCount,
    tableId: `T${r.tableNumber}`,
    tableName: table?.name ?? `Stolik ${r.tableNumber}`,
    zone: table?.zone ?? 'Sala główna',
    // Backend returns date & hour separately, we need to combine them for frontend in ISO string
    dateTime: `${r.reservationDate}T${r.reservationTime}`,
    status: mapStatus(r.status),
    createdAt: r.createdAt,
  }
}

// ---------- Reservation API ------------------------------------

export const reservationApiService = {
  /** Downloading reservations of guest by cookieId catched in localStorage */
  async listForGuest(cookieId: string): Promise<Reservation[]> {
    const res = await fetch(`${API_BASE}/Reservation`)
    if (!res.ok) throw new Error("Błąd pobierania rezerwacji");
    const data = await res.json();
    // Filter reservations by cookieId and map them to frontend format
    return data
      .map(mapBackendReservation)
      // Filter by cookieId - we use simplier string, so we can filter in frontend
      .filter((r: Reservation) => {
        const stored = localStorage.getItem(`reservation_cookie${r.id}`)
        return stored === cookieId
      })
  },

  /** Downloading all reservations - for the admin panel */
  async listAll(): Promise<Reservation[]> {
    const res = await fetch(`${API_BASE}/Reservation`)
    if (!res.ok) throw new Error("Błąd pobierania rezerwacji");
    const data = await res.json();
    return data.map(mapBackendReservation);
  },

  /** Check availability of tables for a given time and guest count */
  async getAvailableTables(date: string, partySize: number): Promise<Record<string, boolean>> {
    // Backend expects date in YYYY-MM-DD format, time and guestCount separately
    // We use 12:00 as default time for checking availability, since backend requires it
    const dateOnly = date.slice(0, 10)
    const params = new URLSearchParams( {
      date: dateOnly,
      time: '12:00:00',
      guestCount: String(partySize),
    })

    const res = await fetch(`${API_BASE}/Tables/available?${params}`)
    if (!res.ok) throw new Error("Błąd pobierania dostępności stolików");
    const avalableTables: any[] = await res.json()

    // Building map of availability in format which frontend expects
    const availableIds = new Set(avalableTables.map((t) => `T${t.number}`))
    const result: Record<string, boolean> = {}
    for (const t of floorTables) {
      result[t.id] = availableIds.has(t.id) && t.seats >= partySize
    }
    return result
  },

  // Creating a new reservation and Saving cookieId locally
  async create(draft: ReservationDraft, cookieId: string): Promise<Reservation> {
    // Getting number of table from ID in format "T3" -> 3
    const tableNumber = parseInt(draft.tableId.replace('T', ''), 10)

    // Searching for table id in backend by number
    const tableRes = await fetch (`${API_BASE}/Tables/available?date=${draft.dateTime.slice(0, 10)}&time=${draft.dateTime.slice(11, 19)}&guestCount=${draft.partySize}`)
    if (!tableRes.ok) throw new Error("Błąd pobierania dostępności stolików");
    const availableTables: any[] = await tableRes.json()
    const backendTable = availableTables.find((t) => t.number === tableNumber)

    if (!backendTable) throw new Error("Wybrany stolik jest niedostępny w tym terminie!.")

      const body = {
        tableId: backendTable.id,
        customerName: draft.guestName,
        customerEmail: `guest_${Date.now()}@noemail.pl`, // Frontend doesn't have email field, but backend requires it, so we generate dummy email
        customerPhone: draft.guestPhone,
        reservationDate: draft.dateTime.slice(0, 10),
        reservationTime: draft.dateTime.slice(11, 19),
        guestCount: draft.partySize,
        notes: draft.specialRequest ?? '',
        
      }

      const res = await fetch(`${API_BASE}/Reservation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message ?? "Błąd tworzenia rezerwacji")
      }

      const created = await res.json()
      const mapped = mapBackendReservation(created)

      // Saving cookieId locally for later filtering in listForGuest
      localStorage.setItem(`reservation_cookie${mapped.id}`, cookieId)

      return { ...mapped, cookieId }
},

/** Canceling a guest reservation */

async cancel(id: string, cookieId: string): Promise<void> {
  // Checking if reservation belongs to guest by cookieId
  const stored = localStorage.getItem(`reservation_cookie_${id}`)
  if (stored !== cookieId) throw new Error('Brak uprawnień do anulowania tej rezerwacji.')

  const res = await fetch(`${API_BASE}/Reservation/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Błąd anulowania rezerwacji')
  },

  /** Changing reservation status - only for admin */
  async updateStatus(id: string, status: ReservationStatus): Promise<void> {
    const res = await fetch(`${API_BASE}/Reservation/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: mapStatusToBackend(status) }),
    });
    if (!res.ok) throw new Error('Błąd aktualizacji statusu rezerwacji');
  },

  /** Note update for admin by reservation */
  async updateNote(id: string, adminNote: string): Promise<void> {
    const res = await fetch(`${API_BASE}/Reservation/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminNote }),
    });
    if (!res.ok) throw new Error('Błąd aktualizacji notatki rezerwacji');
    },

  /** Deleting a reservation by admin using soft delete */
  async delete(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/Reservation/${id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error('Błąd usuwania rezerwacji')
  },

  /** Alias for compatibility with BookingFlow which executes getAvailability */
  async getAvailability(date: string, partySize: number): Promise<Record<string, boolean>> {
    return this.getAvailableTables(date, partySize)
  }
}
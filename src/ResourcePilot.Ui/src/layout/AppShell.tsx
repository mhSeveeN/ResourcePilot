import { useEffect, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { adminAuthService } from '../app/core/mockServices'
import type { AdminSession } from '../app/core/types'
import { AdminLogin } from '../features/admin/AdminLogin'
import { AdminPanel } from '../features/admin/AdminPanel'
import { LandingPage } from '../features/reservations/LandingPage'
import { BookingFlow } from '../features/reservations/BookingFlow'
import { ReservationsTimeline } from '../features/reservations/ReservationsTimeline'
import { ContactForm } from '../features/tickets/ContactForm'
import { ToastStack, type ToastItem } from '../shared/ui/ToastStack'
import { Navbar, type ViewKey } from './Navbar'

export function AppShell() {
  const [view, setView] = useState<ViewKey>('landing')
  const [adminSession, setAdminSession] = useState<AdminSession | null>(null)
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const [resRefreshKey, setResRefreshKey] = useState(0)

  // Restore admin session on mount
  useEffect(() => {
    const s = adminAuthService.getSession()
    setAdminSession(s)
  }, [])

  const pushToast = (title: string, message: string, type: ToastItem['type'] = 'success') => {
    const id = crypto.randomUUID()
    setToasts((prev) => [...prev, { id, title, message, type }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3200)
  }

  const handleAdminLogin = (session: AdminSession) => {
    setAdminSession(session)
    pushToast('Welcome back', `Signed in as ${session.email}`)
  }

  const handleAdminLogout = () => {
    setAdminSession(null)
    setView('landing')
    pushToast('Signed out', 'Admin session ended.', 'info')
  }

  const handleBookingComplete = () => {
    setResRefreshKey((k) => k + 1)
    pushToast('Reservation submitted', 'Check "My Bookings" to track your reservation.')
    setView('my-reservations')
  }

  const handleViewChange = (next: ViewKey) => {
    setView(next)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-[#080706] text-[#F8F4EC]">
      {/* Only show navbar when not in admin panel */}
      {view !== 'admin' && (
        <Navbar active={view} onChange={handleViewChange} />
      )}

      <AnimatePresence mode="wait">
        {view === 'landing' && (
          <LandingPage
            key="landing"
            onBookTable={() => handleViewChange('booking')}
          />
        )}

        {view === 'booking' && (
          <BookingFlow
            key="booking"
            onReserve={async (draft) => {
              const { reservationService, getGuestCookieId } = await import('../app/core/mockServices')
              const cookieId = getGuestCookieId()
              await reservationService.create(draft, cookieId)
              handleBookingComplete()
            }}
          />
        )}

        {view === 'my-reservations' && (
          <ReservationsTimeline
            key="my-reservations"
            refreshKey={resRefreshKey}
          />
        )}

        {view === 'contact' && (
          <ContactForm
            key="contact"
            onToast={pushToast}
          />
        )}

        {view === 'admin' && !adminSession && (
          <AdminLogin
            key="admin-login"
            onLogin={handleAdminLogin}
          />
        )}

        {view === 'admin' && adminSession && (
          <AdminPanel
            key="admin-panel"
            session={adminSession}
            onLogout={handleAdminLogout}
            onToast={pushToast}
          />
        )}
      </AnimatePresence>

      <ToastStack toasts={toasts} />
    </div>
  )
}

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Send, CheckCircle2, MessageSquare } from 'lucide-react'
import { pageTransition } from '../../app/core/motion'
import { ticketService, getGuestCookieId } from '../../app/core/mockServices'
import type { TicketCategory } from '../../app/core/types'
import { Button } from '../../shared/ui/Button'
import { Card } from '../../shared/ui/Card'
import { Input, Textarea } from '../../shared/ui/Input'
import { StatusBadge } from '../../shared/ui/StatusBadge'

const CATEGORIES: TicketCategory[] = ['General', 'Complaint', 'Special Request', 'Feedback', 'Other']

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function ContactForm({ onToast }: { onToast: (title: string, msg: string) => void }) {
  const [guestName, setGuestName] = useState('')
  const [guestEmail, setGuestEmail] = useState('')
  const [category, setCategory] = useState<TicketCategory>('General')
  const [categoryOpen, setCategoryOpen] = useState(false)
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [myTickets, setMyTickets] = useState<Awaited<ReturnType<typeof ticketService.listForGuest>>>([])
  const [showTickets, setShowTickets] = useState(false)
  const [loadingTickets, setLoadingTickets] = useState(false)
  const categoryRef = useRef<HTMLDivElement | null>(null)

  const validate = () => {
    const e: Record<string, string> = {}
    if (!guestName.trim()) e.guestName = 'Please enter your name.'
    if (!subject.trim()) e.subject = 'Please enter a subject.'
    if (!message.trim()) e.message = 'Please enter your message.'
    if (guestEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail)) e.guestEmail = 'Invalid email address.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setSubmitting(true)
    try {
      const cookieId = getGuestCookieId()
      await ticketService.create({
        cookieId,
        guestName: guestName.trim(),
        guestEmail: guestEmail.trim() || undefined,
        category,
        subject: subject.trim(),
        message: message.trim(),
      })
      setSubmitted(true)
      onToast('Message sent', 'We will get back to you as soon as possible.')
    } finally {
      setSubmitting(false)
    }
  }

  const loadMyTickets = async () => {
    setLoadingTickets(true)
    const cookieId = getGuestCookieId()
    const data = await ticketService.listForGuest(cookieId)
    setMyTickets(data)
    setLoadingTickets(false)
    setShowTickets(true)
  }

  useEffect(() => {
    if (!categoryOpen) return
    const handleClick = (event: MouseEvent) => {
      if (!categoryRef.current) return
      if (!categoryRef.current.contains(event.target as Node)) setCategoryOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [categoryOpen])

  return (
    <motion.div {...pageTransition} className="mx-auto max-w-2xl px-4 py-12">
      <div className="mb-8">
        <p className="text-xs tracking-[0.3em] text-[#C5A059]">GET IN TOUCH</p>
        <h2 className="mt-2 font-['Playfair_Display'] text-4xl">Contact Us</h2>
        <p className="mt-2 text-sm text-[#F8F4EC]/50">
          Questions, special requests, or feedback — we are here to help.
        </p>
      </div>

      {submitted ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center py-16 text-center"
        >
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-[#C5A059]/30 bg-[#C5A059]/10">
            <CheckCircle2 size={28} className="text-[#C5A059]" />
          </div>
          <h3 className="font-['Playfair_Display'] text-2xl">Message received</h3>
          <p className="mt-3 text-sm text-[#F8F4EC]/55">
            Thank you for reaching out. Our team will respond within 24 hours.
          </p>
          <Button
            variant="ghost"
            className="mt-8"
            onClick={() => {
              setSubmitted(false)
              setGuestName(''); setGuestEmail(''); setSubject(''); setMessage('')
              setCategory('General')
            }}
          >
            Send another message
          </Button>
        </motion.div>
      ) : (
        <Card className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Your Name"
              placeholder="Marco Rossi"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              error={errors.guestName}
            />
            <Input
              label="Email (optional)"
              placeholder="marco@example.com"
              type="email"
              value={guestEmail}
              onChange={(e) => setGuestEmail(e.target.value)}
              error={errors.guestEmail}
            />
          </div>

          <div ref={categoryRef} className="relative flex flex-col gap-1.5">
            <label className="text-xs tracking-[0.12em] text-[#C5A059]/80 uppercase">Category</label>
            <button
              type="button"
              onClick={() => setCategoryOpen((v) => !v)}
              className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-[#F8F4EC] outline-none transition-colors hover:border-[#C5A059]/40"
              aria-haspopup="listbox"
              aria-expanded={categoryOpen}
            >
              <span>{category}</span>
              <span className="text-xs text-[#F8F4EC]/40">▾</span>
            </button>
            {categoryOpen && (
              <div className="absolute left-0 right-0 top-full z-20 mt-2 w-full rounded-xl border border-[#C5A059]/20 bg-[#0d0c0b] p-1 shadow-[0_20px_50px_rgba(0,0,0,0.45)]">
                {CATEGORIES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    role="option"
                    aria-selected={category === c}
                    onClick={() => {
                      setCategory(c)
                      setCategoryOpen(false)
                    }}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                      category === c
                        ? 'bg-[#C5A059]/20 text-[#C5A059]'
                        : 'text-[#F8F4EC]/70 hover:bg-white/6 hover:text-[#F8F4EC]'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}
          </div>

          <Input
            label="Subject"
            placeholder="Brief description of your enquiry"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            error={errors.subject}
          />

          <Textarea
            label="Message"
            placeholder="Please describe your request in detail…"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            error={errors.message}
            rows={5}
          />

          <div className="flex items-center justify-between pt-1">
            <p className="text-xs text-[#F8F4EC]/30">No account required.</p>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Sending…' : 'Send Message'}
              <Send size={14} />
            </Button>
          </div>
        </Card>
      )}

      {/* My previous tickets */}
      <div className="mt-10">
        <button
          type="button"
          onClick={showTickets ? () => setShowTickets(false) : loadMyTickets}
          className="flex items-center gap-2 text-sm text-[#C5A059]/70 hover:text-[#C5A059] transition-colors"
        >
          <MessageSquare size={14} />
          {showTickets ? 'Hide my previous messages' : 'View my previous messages'}
        </button>

        {showTickets && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 space-y-3"
          >
            {loadingTickets && (
              <div className="flex justify-center py-8">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                  className="h-6 w-6 rounded-full border-2 border-[#C5A059]/30 border-t-[#C5A059]"
                />
              </div>
            )}
            {!loadingTickets && myTickets.length === 0 && (
              <p className="text-sm text-[#F8F4EC]/40">No previous messages found on this device.</p>
            )}
            {myTickets.map((ticket) => (
              <Card key={ticket.id} className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs tracking-[0.1em] text-[#C5A059]/60">{ticket.category.toUpperCase()}</p>
                    <p className="mt-1 font-['Playfair_Display'] text-lg">{ticket.subject}</p>
                    <p className="mt-0.5 text-xs text-[#F8F4EC]/40">{formatDate(ticket.createdAt)}</p>
                  </div>
                  <StatusBadge status={ticket.status} />
                </div>
                <p className="text-sm text-[#F8F4EC]/60">{ticket.message}</p>
                {ticket.adminReply && (
                  <div className="rounded-xl border border-[#C5A059]/20 bg-[#C5A059]/5 px-4 py-3">
                    <p className="text-xs tracking-[0.1em] text-[#C5A059]/70">REPLY FROM LA TAVOLA</p>
                    <p className="mt-1 text-sm text-[#F8F4EC]/75">{ticket.adminReply}</p>
                    {ticket.adminRepliedAt && (
                      <p className="mt-1 text-xs text-[#F8F4EC]/35">{formatDate(ticket.adminRepliedAt)}</p>
                    )}
                  </div>
                )}
              </Card>
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

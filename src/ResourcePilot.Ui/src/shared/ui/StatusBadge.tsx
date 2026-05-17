import { motion } from 'framer-motion'
import {
  CheckCircle2, CircleDashed, Clock3, OctagonX,
  ShieldAlert, Sparkles, Timer, Wrench, MessageCircle, ThumbsUp,
} from 'lucide-react'
import type { ReservationStatus, TicketStatus } from '../../app/core/types'

type Status = ReservationStatus | TicketStatus

const statusStyle: Record<Status, string> = {
  Pending:    'bg-amber-500/15 text-amber-300 border border-amber-500/25',
  Approved:   'bg-emerald-500/15 text-emerald-300 border border-emerald-500/25',
  Rejected:   'bg-rose-500/15 text-rose-300 border border-rose-500/25',
  Cancelled:  'bg-zinc-500/15 text-zinc-400 border border-zinc-500/25',
  Completed:  'bg-sky-500/15 text-sky-300 border border-sky-500/25',
  New:        'bg-violet-500/15 text-violet-300 border border-violet-500/25',
  InProgress: 'bg-orange-500/15 text-orange-300 border border-orange-500/25',
  Resolved:   'bg-teal-500/15 text-teal-300 border border-teal-500/25',
  Closed:     'bg-zinc-500/15 text-zinc-400 border border-zinc-500/25',
}

const statusIcon: Record<Status, typeof Sparkles> = {
  Pending:    Clock3,
  Approved:   CheckCircle2,
  Rejected:   OctagonX,
  Cancelled:  ShieldAlert,
  Completed:  Sparkles,
  New:        CircleDashed,
  InProgress: Timer,
  Resolved:   ThumbsUp,
  Closed:     Wrench,
}

const statusLabel: Record<Status, string> = {
  Pending:    'Pending',
  Approved:   'Approved',
  Rejected:   'Rejected',
  Cancelled:  'Cancelled',
  Completed:  'Completed',
  New:        'New',
  InProgress: 'In Progress',
  Resolved:   'Resolved',
  Closed:     'Closed',
}

export function StatusBadge({ status }: { status: Status }) {
  const Icon = statusIcon[status]
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${statusStyle[status]}`}
    >
      <motion.span
        animate={{ rotate: status === 'InProgress' ? 360 : 0 }}
        transition={{ duration: 2.5, repeat: status === 'InProgress' ? Infinity : 0, ease: 'linear' }}
      >
        <Icon size={11} />
      </motion.span>
      {statusLabel[status]}
    </motion.span>
  )
}

// Unused import fix
void MessageCircle

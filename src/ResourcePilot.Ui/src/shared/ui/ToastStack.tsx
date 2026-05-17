import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, AlertCircle, Info } from 'lucide-react'

export type ToastItem = {
  id: string
  title: string
  message: string
  type?: 'success' | 'error' | 'info'
}

export function ToastStack({ toasts }: { toasts: ToastItem[] }) {
  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-[100] flex w-[340px] max-w-[calc(100vw-2rem)] flex-col gap-2.5">
      <AnimatePresence>
        {toasts.map((toast) => {
          const Icon = toast.type === 'error' ? AlertCircle : toast.type === 'info' ? Info : CheckCircle2
          const color = toast.type === 'error' ? 'text-rose-300' : toast.type === 'info' ? 'text-sky-300' : 'text-[#C5A059]'
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.97 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-2xl border border-white/10 bg-[#0e0d0c]/95 p-4 shadow-[0_12px_36px_rgba(0,0,0,0.55)] backdrop-blur-md"
            >
              <p className={`flex items-center gap-2 text-sm font-medium ${color}`}>
                <Icon size={14} />
                {toast.title}
              </p>
              <p className="mt-1 text-sm text-[#F8F4EC]/75">{toast.message}</p>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}

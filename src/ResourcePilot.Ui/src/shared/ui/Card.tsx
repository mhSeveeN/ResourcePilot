import type { PropsWithChildren } from 'react'

type CardProps = PropsWithChildren<{
  className?: string
  noPad?: boolean
}>

export function Card({ children, className = '', noPad = false }: CardProps) {
  return (
    <section
      className={`rounded-2xl border border-white/8 bg-[rgba(248,244,236,0.045)] shadow-[0_16px_48px_rgba(0,0,0,0.4)] backdrop-blur-md ${noPad ? '' : 'p-6'} ${className}`}
    >
      {children}
    </section>
  )
}

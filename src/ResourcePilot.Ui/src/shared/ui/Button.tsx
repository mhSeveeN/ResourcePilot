import { motion } from 'framer-motion'
import type { HTMLMotionProps } from 'framer-motion'
import type { PropsWithChildren } from 'react'

type ButtonProps = PropsWithChildren<HTMLMotionProps<'button'>> & {
  variant?: 'primary' | 'ghost' | 'danger' | 'outline'
  size?: 'sm' | 'md' | 'lg'
}

export function Button({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  ...props
}: ButtonProps) {
  const variantClass = {
    primary: 'bg-[#C5A059] text-[#080706] hover:bg-[#D4B47A] font-medium',
    ghost:   'bg-white/6 text-[#F8F4EC] hover:bg-white/12 border border-white/10',
    danger:  'bg-rose-500/20 text-rose-200 hover:bg-rose-500/35 border border-rose-500/30',
    outline: 'bg-transparent text-[#C5A059] border border-[#C5A059]/60 hover:bg-[#C5A059]/10',
  }[variant]

  const sizeClass = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3.5 text-base',
  }[size]

  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      whileHover={{ y: -1 }}
      transition={{ duration: 0.15 }}
      className={`inline-flex items-center justify-center gap-2 rounded-xl tracking-[0.06em] transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-40 ${variantClass} ${sizeClass} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  )
}

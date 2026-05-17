import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react'

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  error?: string
}

export function Input({ className = '', label, error, id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-xs tracking-[0.12em] text-[#C5A059]/80 uppercase">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full rounded-xl border bg-black/25 px-4 py-3 text-sm text-[#F8F4EC] outline-none transition-colors placeholder:text-[#F8F4EC]/30 focus:border-[#C5A059]/70 focus:bg-black/35 ${
          error ? 'border-rose-400/60' : 'border-white/10'
        } ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-rose-300">{error}</p>}
    </div>
  )
}

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string
  error?: string
}

export function Textarea({ className = '', label, error, id, ...props }: TextareaProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-xs tracking-[0.12em] text-[#C5A059]/80 uppercase">
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        rows={4}
        className={`w-full resize-none rounded-xl border bg-black/25 px-4 py-3 text-sm text-[#F8F4EC] outline-none transition-colors placeholder:text-[#F8F4EC]/30 focus:border-[#C5A059]/70 focus:bg-black/35 ${
          error ? 'border-rose-400/60' : 'border-white/10'
        } ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-rose-300">{error}</p>}
    </div>
  )
}

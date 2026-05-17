import { useState } from 'react'
import { motion } from 'framer-motion'
import { Lock, Mail, Eye, EyeOff } from 'lucide-react'
import { pageTransition } from '../../app/core/motion'
import { adminAuthService } from '../../app/core/mockServices'
import type { AdminSession } from '../../app/core/types'
import { Button } from '../../shared/ui/Button'
import { Card } from '../../shared/ui/Card'
import { RESTAURANT_NAME } from '../../app/core/constants'

export function AdminLogin({ onLogin }: { onLogin: (session: AdminSession) => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email.trim() || !password) { setError('Please enter email and password.'); return }
    setLoading(true)
    try {
      const session = await adminAuthService.login(email.trim(), password)
      onLogin(session)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      {...pageTransition}
      className="flex min-h-[80vh] items-center justify-center px-4 py-12"
    >
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-10 text-center">
          <p className="font-['Playfair_Display'] text-3xl text-[#C5A059]">{RESTAURANT_NAME}</p>
          <p className="mt-1 text-xs tracking-[0.3em] text-[#F8F4EC]/35">STAFF ACCESS</p>
        </div>

        <Card className="space-y-5">
          <div>
            <p className="text-xs tracking-[0.2em] text-[#C5A059]">ADMINISTRATOR LOGIN</p>
            <h2 className="mt-2 font-['Playfair_Display'] text-2xl">Sign in to Dashboard</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="relative">
              <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#F8F4EC]/30" />
              <input
                type="email"
                placeholder="admin@latavola.pl"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/25 py-3 pl-10 pr-4 text-sm text-[#F8F4EC] outline-none transition-colors placeholder:text-[#F8F4EC]/30 focus:border-[#C5A059]/70"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#F8F4EC]/30" />
              <input
                type={showPwd ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/25 py-3 pl-10 pr-10 text-sm text-[#F8F4EC] outline-none transition-colors placeholder:text-[#F8F4EC]/30 focus:border-[#C5A059]/70"
              />
              <button
                type="button"
                onClick={() => setShowPwd((v) => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#F8F4EC]/30 hover:text-[#F8F4EC]/60"
              >
                {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>

            {error && (
              <p className="rounded-xl border border-rose-500/20 bg-rose-500/8 px-3 py-2 text-sm text-rose-300">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign In'}
            </Button>
          </form>

          <p className="text-center text-xs text-[#F8F4EC]/25">
            Demo: admin@latavola.pl / admin123
          </p>
        </Card>
      </div>
    </motion.div>
  )
}

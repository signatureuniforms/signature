'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Loader2, Lock, ShieldCheck, Sparkles, KeyRound, ArrowRight, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const loginSchema = z.object({
  identifier: z.string().min(1, 'Username or email is required'),
  password: z.string().min(1, 'Password is required'),
})
type LoginInput = z.infer<typeof loginSchema>

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') ?? '/admin/dashboard'

  const [showPassword, setShowPassword] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [filledDemo, setFilledDemo] = useState(false)

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: '',
      password: '',
    },
  })

  const fillDemoCredentials = () => {
    setValue('identifier', 'admin')
    setValue('password', 'Admin@123')
    setFilledDemo(true)
    setAuthError(null)
    setTimeout(() => setFilledDemo(false), 2500)
  }

  const onSubmit = async (data: LoginInput) => {
    setLoading(true)
    setAuthError(null)

    const supabase = createClient()
    const input = data.identifier.trim()
    const emailToUse = input.includes('@') ? input : 'Admin@gmail.com'

    const { error } = await supabase.auth.signInWithPassword({
      email: emailToUse,
      password: data.password,
    })

    if (error) {
      setAuthError('Invalid credentials. Please verify your username/email and password.')
      setLoading(false)
      return
    }

    router.push(redirect)
    router.refresh()
  }

  return (
    <div className="relative min-h-screen bg-[#070709] text-white flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      {/* Ambient background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#FFD700]/[0.07] rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-amber-600/[0.04] rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-10 right-10 w-96 h-96 bg-[#FFD700]/[0.04] rounded-full blur-[120px] pointer-events-none" />

      {/* Subtle geometric pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #FFD700 1px, transparent 0)`,
          backgroundSize: '36px 36px',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-b from-[#1c1c20] to-[#0c0c0e] border border-[#FFD700]/30 shadow-[0_0_35px_rgba(255,215,0,0.15)] mb-4 ring-1 ring-white/10 group">
            <span
              className="text-2xl font-bold tracking-tight text-[#FFD700]"
              style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
            >
              SU
            </span>
          </div>

          <h1
            className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-1.5"
            style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
          >
            Signature <span className="text-[#FFD700]">Uniforms</span>
          </h1>

          <div className="flex items-center justify-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wider uppercase bg-[#FFD700]/10 text-[#FFD700] border border-[#FFD700]/20">
              <ShieldCheck className="w-3 h-3 text-[#FFD700]" />
              Executive Admin Portal
            </span>
          </div>
        </div>

        {/* Card */}
        <div className="relative rounded-3xl bg-[#111114]/80 backdrop-blur-2xl border border-white/[0.08] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8),0_0_40px_rgba(255,215,0,0.05)] p-7 sm:p-9 ring-1 ring-white/[0.05]">
          {/* Subtle gold line accent at top */}
          <div className="absolute top-0 inset-x-8 h-px bg-gradient-to-r from-transparent via-[#FFD700]/60 to-transparent" />

          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-white">Sign In</h2>
              <p className="text-xs text-white/50 mt-0.5">Enter your credentials to access dashboard</p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-[#FFD700]">
              <Lock className="w-4 h-4" />
            </div>
          </div>

          {authError && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/10 border border-red-500/30 text-red-300 text-xs rounded-xl p-3.5 mb-5 flex items-start gap-2.5 leading-relaxed"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 flex-shrink-0" />
              <span>{authError}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div>
              <label className="block text-xs font-medium text-white/70 mb-1.5 uppercase tracking-wider" htmlFor="admin-identifier">
                Username or Email
              </label>
              <div className="relative">
                <input
                  id="admin-identifier"
                  type="text"
                  autoComplete="username"
                  className="w-full bg-white/[0.03] border border-white/10 focus:border-[#FFD700] rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 outline-none transition-all duration-200 focus:ring-2 focus:ring-[#FFD700]/20"
                  placeholder="admin or Admin@gmail.com"
                  {...register('identifier')}
                />
              </div>
              {errors.identifier && (
                <p className="text-red-400 text-xs mt-1.5">{errors.identifier.message}</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-white/70 uppercase tracking-wider" htmlFor="admin-password">
                  Password
                </label>
              </div>
              <div className="relative">
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  className="w-full bg-white/[0.03] border border-white/10 focus:border-[#FFD700] rounded-xl px-4 py-3 pr-11 text-sm text-white placeholder-white/25 outline-none transition-all duration-200 focus:ring-2 focus:ring-[#FFD700]/20"
                  placeholder="••••••••"
                  {...register('password')}
                />
                <button
                  type="button"
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-400 text-xs mt-1.5">{errors.password.message}</p>
              )}
            </div>

            {/* Quick Demo Fill Helper */}
            <div className="pt-1">
              <button
                type="button"
                onClick={fillDemoCredentials}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-dashed border-white/15 text-[11px] text-white/60 hover:text-white transition-all cursor-pointer group"
              >
                <span className="flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-[#FFD700]" />
                  <span>Fill default credentials (<strong className="text-white/80 font-mono">admin</strong>)</span>
                </span>
                {filledDemo ? (
                  <span className="text-emerald-400 flex items-center gap-1 font-medium text-[10px]">
                    <Check className="w-3 h-3" /> Filled
                  </span>
                ) : (
                  <span className="text-[#FFD700] text-[10px] group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                    Click to fill <ArrowRight className="w-2.5 h-2.5" />
                  </span>
                )}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="relative overflow-hidden w-full py-3.5 bg-[#FFD700] hover:bg-[#FFE033] active:bg-[#E6C200] text-black font-semibold text-sm rounded-xl tracking-wide transition-all duration-200 hover:shadow-[0_8px_30px_rgba(255,215,0,0.35)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 mt-4 font-sans"
              id="admin-login-submit"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin text-black" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer inside card */}
          <div className="mt-6 pt-5 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-white/40">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#FFD700]/70" />
              Signature Uniforms by Hari
            </span>
            <span className="font-mono text-[10px] text-white/30">v1.0 • Thrissur, Kerala</span>
          </div>
        </div>

        {/* Outer bottom trust badge */}
        <p className="text-center text-white/25 text-xs mt-6 flex items-center justify-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-white/30" />
          <span>Encrypted Session • Authorized Personnel Only</span>
        </p>
      </motion.div>
    </div>
  )
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#070709] flex items-center justify-center text-[#FFD700]">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}

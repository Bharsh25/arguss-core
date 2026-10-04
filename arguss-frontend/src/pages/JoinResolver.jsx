import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { CheckCircle2, AlertCircle, ArrowRight, Loader2, Sparkles, UserCheck } from 'lucide-react'
import Logo from '../components/Logo.jsx'
import { subjectsApi } from '../api/subjects.js'
import { apiErrorMessage } from '../api/client.js'
import { useAuth } from '../context/AuthContext.jsx'

export default function JoinResolver() {
  const { inviteCode } = useParams()
  const { auth, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [state, setState] = useState('checking') // checking | joining | success | error | wrong-role
  const [detail, setDetail] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let cancelled = false

    async function run() {
      // Not signed in at all — preview the invite, then bounce to student
      // sign-in, preserving this exact URL so we land right back here.
      if (!isAuthenticated) {
        navigate(`/student?redirect=${encodeURIComponent(`/join/${inviteCode}`)}`, { replace: true })
        return
      }

      // Signed in, but as a teacher — this flow is student-only.
      if (auth.role !== 'student') {
        setState('wrong-role')
        return
      }

      // Signed in as a student — join immediately.
      setState('joining')
      try {
        const result = await subjectsApi.join(inviteCode)
        if (cancelled) return
        setDetail(result)
        setState('success')
        setTimeout(() => navigate('/student/dashboard'), 1500)
      } catch (err) {
        if (cancelled) return
        setErrorMessage(apiErrorMessage(err, 'That invite link is invalid or has expired.'))
        setState('error')
      }
    }

    run()
    return () => { cancelled = true }
  }, [inviteCode, isAuthenticated, auth, navigate])

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-3.5 py-8 sm:py-12 selection:bg-cyan-500/30 selection:text-white">
      {/* Background Cyber Lights */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-cyan-500/10 blur-[130px] rounded-full" />
      <div className="pointer-events-none absolute inset-0 bg-grid-cyber opacity-50" />

      <Link to="/" className="relative z-10 mb-6 sm:mb-8 flex items-center gap-2.5 sm:gap-3 transition-transform hover:scale-105">
        <Logo size={36} />
        <div>
          <span className="font-display text-lg sm:text-xl font-bold tracking-wider text-ink">ARGUSS</span>
          <span className="ml-2 text-[10px] font-mono uppercase tracking-widest text-cyan-400 px-2 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-800/40">
            Enrollment Router
          </span>
        </div>
      </Link>

      <div className="relative z-10 w-full max-w-sm rounded-2xl border border-border-strong/80 bg-gradient-to-b from-[#111827]/90 to-[#0A0F1A]/95 p-5 sm:p-7 text-center backdrop-blur-2xl shadow-raised">
        {(state === 'checking' || state === 'joining') && (
          <div className="py-6 flex flex-col items-center">
            <Loader2 size={32} className="animate-spin text-cyan-400 mb-3" />
            <h2 className="font-display text-base font-bold text-ink">Verifying Class Invite Token…</h2>
            <p className="mt-1 text-xs text-muted font-mono">Code: {inviteCode}</p>
          </div>
        )}

        {state === 'success' && (
          <div className="py-4">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shadow-glow-green">
              <CheckCircle2 size={28} />
            </div>
            <h1 className="font-display text-xl font-bold text-ink">
              {detail?.status === 'already_enrolled' ? 'Already Enrolled' : 'Enrollment Successful!'}
            </h1>
            <p className="mt-2 text-xs text-muted leading-relaxed">{detail?.message}</p>
            <div className="mt-5 flex items-center justify-center gap-2 font-mono text-[11px] text-cyan-400">
              <Loader2 size={12} className="animate-spin" />
              <span>Redirecting to your dashboard…</span>
            </div>
          </div>
        )}

        {state === 'error' && (
          <div className="py-4">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400">
              <AlertCircle size={28} />
            </div>
            <h1 className="font-display text-lg font-bold text-ink">Unable to Join Class</h1>
            <p className="mt-2 text-xs text-red-400">{errorMessage}</p>
            <Link to="/student/dashboard" className="btn-cyan mt-6 inline-flex items-center gap-2 text-xs">
              <span>Go to Student Dashboard</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        )}

        {state === 'wrong-role' && (
          <div className="py-4">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <AlertCircle size={28} />
            </div>
            <h1 className="font-display text-lg font-bold text-ink">Student-Only Invite Link</h1>
            <p className="mt-2 text-xs text-muted leading-relaxed">
              You are signed in as a faculty instructor. Please switch to a student account to enroll in this class.
            </p>
            <Link to="/" className="btn-secondary mt-6 inline-flex text-xs">
              Back to Home
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
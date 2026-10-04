import { useEffect, useState } from 'react'
import { 
  Plus, 
  LogOut, 
  BookOpen, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Sparkles, 
  Percent, 
  CalendarCheck,
  UserCheck,
  Trash2
} from 'lucide-react'
import Logo from '../components/Logo.jsx'
import SubjectCard from '../components/SubjectCard.jsx'
import EnrollModal from '../components/EnrollModal.jsx'
import { subjectsApi } from '../api/subjects.js'
import { useAuth } from '../context/AuthContext.jsx'

export default function StudentDashboard() {
  const [subjects, setSubjects] = useState(null)
  const [showEnroll, setShowEnroll] = useState(false)
  const [unenrollConfirm, setUnenrollConfirm] = useState(null) // subjectId
  const { auth, logout } = useAuth()

  async function refresh() {
    try {
      const data = await subjectsApi.listEnrolled()
      setSubjects(data)
    } catch {
      setSubjects([])
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  async function handleUnenroll(subjectId) {
    try {
      await subjectsApi.unenroll(subjectId)
      setUnenrollConfirm(null)
      refresh()
    } catch {
      // error handled silently or refresh
    }
  }

  // Calculate overall metrics
  const totalEnrolled = subjects?.length ?? 0
  const totalClasses = subjects?.reduce((acc, s) => acc + (s.total_classes || 0), 0) ?? 0
  const totalAttended = subjects?.reduce((acc, s) => acc + (s.attended_classes || 0), 0) ?? 0
  const overallRate = totalClasses > 0 ? Math.round((totalAttended / totalClasses) * 100) : 100

  return (
    <div className="min-h-screen bg-page text-ink selection:bg-cyan-500/30 selection:text-white pb-16">
      {/* Top Navigation */}
      <header className="sticky top-0 z-30 border-b border-border/80 bg-nav/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-3.5 py-2.5 sm:px-6 sm:py-3">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <Logo size={32} />
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-display text-sm sm:text-base font-bold tracking-wider text-ink">ARGUSS</span>
                <span className="font-mono text-[9px] sm:text-[10px] uppercase tracking-wider px-1.5 sm:px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                  Student
                </span>
              </div>
              <div className="text-[11px] sm:text-xs text-muted flex items-center gap-1.5">
                <span className="truncate max-w-[120px] sm:max-w-none">{auth?.name}</span>
                <span className="h-1 w-1 rounded-full bg-border-strong hidden xs:inline" />
                <span className="font-mono text-[10px] text-faint hidden xs:inline">ID: #{auth?.id}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:flex items-center gap-1.5 font-mono text-[11px] text-cyan-400 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1">
              <ShieldCheck size={13} className="text-cyan-400" />
              <span>BIOMETRIC IDENTITY ACTIVE</span>
            </div>
            <button
              onClick={logout}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card/60 px-2.5 sm:px-3 py-1.5 text-xs font-medium text-muted transition-all hover:bg-white/[0.08] hover:text-white hover:border-border-strong min-h-[36px]"
            >
              <LogOut size={13} />
              <span className="hidden xs:inline">Sign out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-6xl px-3.5 py-5 sm:px-6 sm:py-8">
        {/* Student Metric Overview Banner */}
        <div className="mb-6 sm:mb-8 rounded-2xl border border-border/80 bg-gradient-to-r from-[#111827]/90 via-[#0E1524]/90 to-[#0A0F1D]/90 p-4 sm:p-7 backdrop-blur-xl shadow-card relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 blur-3xl rounded-full pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-display text-lg sm:text-2xl font-bold text-ink">Welcome back, {auth?.name}</span>
                <span className="flex-shrink-0 flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  <CheckCircle2 size={12} />
                  <span>Enrolled</span>
                </span>
              </div>
              <p className="mt-1 text-xs text-muted max-w-xl leading-relaxed">
                Your attendance is logged automatically whenever your teacher captures a room photo or conducts a voice roll-call.
              </p>
            </div>

            {/* Overall Attendance Stat Pill */}
            <div className="flex items-center justify-around sm:justify-end gap-4 rounded-xl border border-border/70 bg-subtle/80 p-3 sm:px-6 w-full sm:w-auto">
              <div className="text-center sm:text-right">
                <div className="text-[11px] sm:text-xs text-muted">Overall Attendance</div>
                <div className={`font-mono text-xl sm:text-2xl font-bold ${overallRate >= 75 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {overallRate}%
                </div>
              </div>
              <div className="h-8 sm:h-10 w-[1px] bg-border/80" />
              <div className="text-center sm:text-left">
                <div className="text-[11px] sm:text-xs text-muted">Sessions</div>
                <div className="font-mono text-sm sm:text-base font-semibold text-ink">
                  {totalAttended} / {totalClasses}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section Header */}
        <div className="mb-5 sm:mb-6 flex items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-ink">Enrolled Classes</h2>
            <p className="mt-0.5 text-xs text-muted">Overview of your academic courses and attendance standings.</p>
          </div>
          <button
            onClick={() => setShowEnroll(true)}
            className="btn-cyan flex items-center gap-1.5 text-xs py-2 px-3.5 shadow-sm min-h-[38px] whitespace-nowrap"
          >
            <Plus size={15} />
            <span>Join Class</span>
          </button>
        </div>

        {/* Loading State */}
        {subjects === null && (
          <div className="grid gap-4 sm:grid-cols-2">
            {[1, 2].map((i) => (
              <div key={i} className="h-44 rounded-2xl border border-border bg-card/50 p-6 animate-pulse" />
            ))}
          </div>
        )}

        {/* Empty State */}
        {subjects?.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border-strong/70 bg-card/40 p-12 text-center backdrop-blur-xl">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 mb-4">
              <BookOpen size={28} />
            </div>
            <h3 className="font-display text-lg font-bold text-ink">Not Enrolled in Any Classes Yet</h3>
            <p className="mt-1 max-w-sm text-xs text-muted leading-relaxed">
              Ask your teacher for a 6-character class code or scan their QR badge to start tracking attendance.
            </p>
            <button
              onClick={() => setShowEnroll(true)}
              className="btn-cyan mt-6 flex items-center gap-2 text-xs py-2.5 px-5"
            >
              <Plus size={15} />
              <span>Enroll with Invite Code</span>
            </button>
          </div>
        )}

        {/* Subjects Grid */}
        <div className="grid gap-5 sm:grid-cols-2">
          {subjects?.map((s) => {
            const rate = s.total_classes > 0 ? Math.round((s.attended_classes / s.total_classes) * 100) : 100
            const isConfirming = unenrollConfirm === s.subject_id

            return (
              <SubjectCard
                key={s.subject_id}
                subject={s}
                stats={[
                  { label: 'Sessions', value: s.total_classes },
                  { label: 'Attended', value: s.attended_classes },
                  { label: 'Rate', value: `${rate}%` },
                ]}
                footer={
                  <div className="flex items-center justify-between">
                    {isConfirming ? (
                      <div className="flex items-center gap-2 w-full">
                        <span className="text-xs text-red-400 font-medium">Unenroll?</span>
                        <button
                          onClick={() => handleUnenroll(s.subject_id)}
                          className="rounded-md bg-red-500/20 border border-red-500/40 px-2.5 py-1 text-xs font-semibold text-red-300 hover:bg-red-500/30"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setUnenrollConfirm(null)}
                          className="rounded-md border border-border px-2.5 py-1 text-xs text-muted hover:text-white"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setUnenrollConfirm(s.subject_id)}
                        className="inline-flex items-center gap-1.5 text-xs text-faint transition-colors hover:text-red-400"
                      >
                        <Trash2 size={13} />
                        <span>Unenroll from class</span>
                      </button>
                    )}
                  </div>
                }
              />
            )
          })}
        </div>
      </main>

      {/* Enroll Modal */}
      {showEnroll && (
        <EnrollModal
          onClose={() => setShowEnroll(false)}
          onEnrolled={() => { setShowEnroll(false); refresh() }}
        />
      )}
    </div>
  )
}

import { BookOpen, Users, Calendar, Award } from 'lucide-react'

export default function SubjectCard({ subject, stats = [], footer, isStudent = false }) {
  // Find attendance rate if present in stats
  const rateStat = stats.find((s) => s?.label && typeof s.label === 'string' && s.label.toLowerCase().includes('rate'))
  const rateNum = (rateStat && rateStat.value != null) ? parseInt(String(rateStat.value), 10) : null

  return (
    <div className="group relative rounded-2xl border border-border/80 bg-gradient-to-b from-[#111827]/80 to-[#0B0F19]/90 p-4 sm:p-6 backdrop-blur-xl shadow-card transition-all duration-300 hover:border-border-strong hover:bg-card-hover/90 hover:shadow-card-hover hover:-translate-y-0.5">
      {/* Top subtle glow highlight */}
      <div className="absolute top-0 right-10 left-10 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent group-hover:via-cyan-400/40 transition-colors" />

      {/* Header: Subject Title & Code */}
      <div className="flex items-start justify-between gap-2.5 sm:gap-3">
        <div className="flex items-start gap-2.5 sm:gap-3 min-w-0">
          <div className="flex h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 shadow-sm">
            <BookOpen size={17} />
          </div>
          <div className="min-w-0">
            <h3 className="font-display text-sm sm:text-base font-bold text-ink group-hover:text-cyan-300 transition-colors truncate">
              {subject.name}
            </h3>
            <div className="mt-0.5 flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-muted">
              <span className="font-mono text-[10px] sm:text-[11px] text-faint flex-shrink-0">SEC-{subject.section}</span>
              {subject.instructor && (
                <>
                  <span className="text-border-strong">•</span>
                  <span className="truncate">{subject.instructor}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <span className="flex-shrink-0 rounded-lg border border-border bg-subtle/80 px-2 py-0.5 sm:px-2.5 sm:py-1 font-mono text-[11px] sm:text-xs font-semibold text-cyan-400 shadow-inner">
          {subject.subject_code}
        </span>
      </div>

      {/* Attendance Progress bar for Students */}
      {rateNum !== null && !isNaN(rateNum) && (
        <div className="mt-3.5 sm:mt-4 rounded-xl border border-border/60 bg-subtle/60 p-2.5 sm:p-3">
          <div className="flex items-center justify-between text-xs font-medium mb-1.5">
            <span className="text-muted text-[11px] sm:text-xs">Standing</span>
            <span className={`font-mono text-[11px] sm:text-xs font-bold ${rateNum >= 75 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {rateNum}% {rateNum >= 75 ? '• Good Standing' : '• Low Attendance'}
            </span>
          </div>
          <div className="h-1.5 sm:h-2 w-full rounded-full bg-slate-800 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                rateNum >= 75 ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-gradient-to-r from-amber-500 to-red-400'
              }`}
              style={{ width: `${Math.min(100, Math.max(0, rateNum))}%` }}
            />
          </div>
        </div>
      )}

      {/* Stats Metric Grid */}
      {stats.length > 0 && (
        <div className={`mt-3.5 sm:mt-4 grid gap-2 sm:gap-2.5 ${stats.length === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-border/60 bg-subtle/60 px-2 py-2 sm:px-3 sm:py-2.5 text-center backdrop-blur-sm"
            >
              <div className="font-mono text-sm sm:text-base font-bold text-ink truncate">{s.value}</div>
              <div className="text-[10px] sm:text-[11px] text-muted tracking-tight truncate">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Footer Actions */}
      {footer && <div className="mt-4 sm:mt-5 border-t border-border/70 pt-3.5 sm:pt-4">{footer}</div>}
    </div>
  )
}

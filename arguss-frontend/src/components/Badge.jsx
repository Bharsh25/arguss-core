const styles = {
  present: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-sm shadow-emerald-500/10',
  absent: 'bg-rose-500/10 text-rose-400 border-rose-500/30 shadow-sm shadow-rose-500/10',
  pending: 'bg-amber-500/10 text-amber-400 border-amber-500/30 shadow-sm shadow-amber-500/10',
  cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30 shadow-sm shadow-cyan-500/10',
  neutral: 'bg-subtle/80 text-muted border-border/80',
}

const dotStyles = {
  present: 'bg-emerald-400 animate-pulse',
  absent: 'bg-rose-400',
  pending: 'bg-amber-400 animate-pulse',
  cyan: 'bg-cyan-400 animate-pulse',
  neutral: 'bg-slate-400',
}

export default function Badge({ tone = 'neutral', showDot = true, children, className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide backdrop-blur-md transition-all ${styles[tone] || styles.neutral} ${className}`}
    >
      {showDot && <span className={`h-1.5 w-1.5 rounded-full ${dotStyles[tone] || dotStyles.neutral}`} />}
      {children}
    </span>
  )
}

import { useEffect } from 'react'
import { X } from 'lucide-react'

export default function Modal({ title, description, onClose, children, width = 'max-w-md' }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-6 overflow-y-auto">
      {/* Backdrop with frosted blur */}
      <div
        className="fixed inset-0 bg-page/80 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Dialog Card */}
      <div
        className={`relative w-full ${width} my-auto max-h-[92dvh] sm:max-h-[90vh] flex flex-col rounded-2xl border border-border-strong/80 bg-gradient-to-b from-[#0F172A] to-[#0A0F1D] p-4 sm:p-7 shadow-raised z-10 overflow-hidden`}
      >
        {/* Top cyber ambient highlight */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-24 bg-cyan-500/15 blur-2xl rounded-full pointer-events-none" />

        <div className="mb-4 sm:mb-5 flex items-start justify-between gap-3 flex-shrink-0">
          <div className="pr-1">
            <h2 className="font-display text-lg sm:text-xl font-bold tracking-tight text-ink flex items-center gap-2">
              {title}
            </h2>
            {description && <p className="mt-1 text-xs sm:text-sm leading-relaxed text-muted">{description}</p>}
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 sm:h-8 sm:w-8 flex-shrink-0 items-center justify-center rounded-lg border border-border/70 bg-card/60 text-muted transition-all hover:bg-white/[0.08] hover:text-white hover:border-border-strong active:scale-95"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="relative z-10 overflow-y-auto overscroll-contain pr-0.5 sm:pr-1 flex-1">
          {children}
        </div>
      </div>
    </div>
  )
}

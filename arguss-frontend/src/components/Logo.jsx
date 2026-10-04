/**
 * The Argus AI Vision mark — a sleek biometric aperture with concentric target rings,
 * optic sensor iris, and cyber amber/cyan glow.
 */
export default function Logo({ size = 36, className = '', showGlow = true }) {
  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-card via-[#0F192C] to-[#0A101D] border border-border-strong/70 shadow-lg ${showGlow ? 'shadow-cyan-500/10' : ''} ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Subtle outer tech corners */}
      <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-cyan-400" />
        <div className="absolute top-0 right-0 w-1.5 h-1.5 border-t border-r border-amber-400" />
        <div className="absolute bottom-0 left-0 w-1.5 h-1.5 border-b border-l border-amber-400" />
        <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-cyan-400" />
      </div>

      <svg
        width={size * 0.65}
        height={size * 0.65}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="transition-transform duration-300 group-hover:scale-110"
      >
        <defs>
          <linearGradient id="irisGrad" x1="2" y1="12" x2="22" y2="12" gradientUnits="userSpaceOnUse">
            <stop stopColor="#38BDF8" />
            <stop offset="0.5" stopColor="#F59E0B" />
            <stop offset="1" stopColor="#38BDF8" />
          </linearGradient>
          <radialGradient id="pupilGlow" cx="12" cy="12" r="4" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FBBF24" />
            <stop offset="1" stopColor="#D97706" />
          </radialGradient>
        </defs>

        {/* Outer biometric eye arc */}
        <path
          d="M2 12C4.5 6.5 8 4 12 4C16 4 19.5 6.5 22 12C19.5 17.5 16 20 12 20C8 20 4.5 17.5 2 12Z"
          stroke="url(#irisGrad)"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.95"
        />

        {/* Concentric scan circle */}
        <circle
          cx="12"
          cy="12"
          r="5"
          stroke="#38BDF8"
          strokeWidth="1"
          strokeDasharray="2 2"
          opacity="0.75"
        />

        {/* Core AI iris */}
        <circle cx="12" cy="12" r="3" fill="url(#pupilGlow)" />
        
        {/* Optic center focal point */}
        <circle cx="12" cy="12" r="1.1" fill="#FFFFFF" />
      </svg>
    </div>
  )
}
/**
 * Biometric HUD Scanner Viewfinder
 * Wraps camera or video view with sci-fi HUD corner brackets, crosshairs,
 * and laser scanner effect for professional AI attendance feel.
 */
export default function ViewfinderFrame({ children, isScanning = false, className = '' }) {
  const corner = 'absolute w-6 h-6 pointer-events-none transition-all duration-300'

  return (
    <div className={`relative rounded-xl overflow-hidden border border-border-strong/60 shadow-2xl bg-black ${className}`}>
      {/* Laser scanner line effect */}
      {isScanning && <div className="laser-scanner-line" />}

      {/* Futuristic HUD Corner Brackets */}
      <span className={`${corner} top-2 left-2 border-t-2 border-l-2 border-cyan-400 shadow-[0_0_8px_#38bdf8]`} />
      <span className={`${corner} top-2 right-2 border-t-2 border-r-2 border-cyan-400 shadow-[0_0_8px_#38bdf8]`} />
      <span className={`${corner} bottom-2 left-2 border-b-2 border-l-2 border-amber-400 shadow-[0_0_8px_#f59e0b]`} />
      <span className={`${corner} bottom-2 right-2 border-b-2 border-r-2 border-amber-400 shadow-[0_0_8px_#f59e0b]`} />

      {/* Center crosshair for face alignment */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
        <div className="w-16 h-16 border border-cyan-400/50 rounded-full" />
        <div className="absolute w-24 h-[1px] bg-cyan-400/40" />
        <div className="absolute h-24 w-[1px] bg-cyan-400/40" />
      </div>

      {/* Top HUD Telemetry Pill */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
        <span className="font-mono text-[10px] uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-black/60 border border-white/10 text-cyan-300 backdrop-blur-md flex items-center gap-1.5 shadow-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
          AI VISION SENSOR
        </span>
      </div>

      {children}
    </div>
  )
}

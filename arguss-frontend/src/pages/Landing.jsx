import { Link } from 'react-router-dom'
import { 
  Camera, 
  Mic, 
  ShieldCheck, 
  Users, 
  Sparkles, 
  QrCode, 
  ArrowRight, 
  CheckCircle2, 
  Cpu, 
  Zap,
  BarChart3
} from 'lucide-react'
import Logo from '../components/Logo.jsx'

export default function Landing() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-page text-ink selection:bg-accent/30 selection:text-white">
      {/* Background Cyber Ambient Lights */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-gradient-to-b from-cyan-500/15 via-blue-600/10 to-transparent blur-3xl opacity-70" />
      <div className="pointer-events-none absolute top-1/3 -right-32 w-[450px] h-[450px] bg-amber-500/10 blur-[120px] rounded-full" />
      <div className="pointer-events-none absolute bottom-10 -left-32 w-[450px] h-[450px] bg-cyan-500/10 blur-[120px] rounded-full" />
      
      {/* Subtle Background Grid */}
      <div className="pointer-events-none absolute inset-0 bg-grid-cyber opacity-60" />

      {/* Navigation Bar */}
      <header className="relative z-10 border-b border-border/80 bg-nav/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-3.5 py-3 sm:px-6">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <Logo size={32} />
            <div className="flex items-center">
              <span className="font-display text-base sm:text-lg font-bold tracking-wider text-ink">ARGUSS</span>
              <span className="ml-2 hidden text-[10px] font-mono uppercase tracking-widest text-cyan-400 sm:inline-block px-2 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-800/50">
                AI Vision Core
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:flex items-center gap-2 rounded-full border border-border/80 bg-subtle/80 px-3 py-1 font-mono text-xs text-muted backdrop-blur-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>SYSTEM READY</span>
            </div>
            <Link
              to="/teacher"
              className="rounded-lg border border-border bg-card/60 px-3 py-1.5 text-xs font-semibold text-ink transition-all hover:bg-white/[0.08] hover:border-border-strong"
            >
              Faculty
            </Link>
            <Link
              to="/student"
              className="rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-gray-950 transition-all hover:bg-accent-hover shadow-sm shadow-amber-500/20"
            >
              Student
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 mx-auto max-w-6xl px-4 pt-8 pb-14 sm:px-6 sm:pt-20 sm:pb-20">
        <div className="mx-auto max-w-3xl text-center">
          {/* Release Badge */}
          <div className="inline-flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/40 px-3 py-1 text-xs font-medium text-cyan-300 backdrop-blur-md shadow-sm shadow-cyan-500/10 mb-5 sm:mb-6">
            <Sparkles size={13} className="text-cyan-400 animate-spin-slow flex-shrink-0" />
            <span className="font-mono uppercase tracking-widest text-[10px] sm:text-[11px]">v2.5 Multimodal Biometrics</span>
            <span className="text-border-strong hidden sm:inline">•</span>
            <span className="text-muted text-[11px] sm:text-xs">Facial &amp; Voiceprint Neural Engine</span>
          </div>

          <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink sm:text-5xl lg:text-6xl leading-[1.15]">
            Autonomous Attendance <br />
            <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-cyan-400 bg-clip-text text-transparent">
              Powered by Computer Vision
            </span>
          </h1>

          <p className="mt-4 sm:mt-5 text-sm sm:text-lg leading-relaxed text-muted max-w-2xl mx-auto">
            Eliminate tedious roll calls. One wide-angle classroom photo or a 5-second group voice recording automatically detects, matches, and logs everyone in seconds.
          </p>

          {/* Quick Metrics Strip */}
          <div className="mt-6 sm:mt-8 flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs text-muted">
            <div className="flex items-center gap-1.5 rounded-lg border border-border/80 bg-subtle/60 px-2.5 py-1.5 backdrop-blur-sm">
              <Camera size={13} className="text-cyan-400" />
              <span>Multi-Face Batch Matching</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-lg border border-border/80 bg-subtle/60 px-2.5 py-1.5 backdrop-blur-sm">
              <Mic size={13} className="text-amber-400" />
              <span>Voiceprint Roll-Call</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-lg border border-border/80 bg-subtle/60 px-2.5 py-1.5 backdrop-blur-sm">
              <ShieldCheck size={13} className="text-emerald-400" />
              <span>Passwordless Biometrics</span>
            </div>
          </div>
        </div>

        {/* Portals Grid */}
        <div className="mt-10 sm:mt-14 grid gap-5 sm:gap-6 sm:grid-cols-2 max-w-4xl mx-auto">
          {/* Teacher Portal Card */}
          <div className="group relative rounded-2xl border border-border/80 bg-gradient-to-b from-[#111827]/90 to-[#0B0F19]/90 p-5 sm:p-8 backdrop-blur-xl shadow-card transition-all duration-300 hover:border-accent/50 hover:shadow-card-hover hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-3xl rounded-full pointer-events-none group-hover:bg-amber-500/10 transition-colors" />
            
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-400 shadow-sm shadow-amber-500/10 group-hover:scale-105 transition-transform">
                <Users size={22} />
              </div>
              <span className="font-mono text-[10px] sm:text-[11px] uppercase tracking-widest px-2.5 py-1 rounded-md bg-subtle border border-border text-muted">
                Faculty Portal
              </span>
            </div>

            <div className="mt-5 sm:mt-6">
              <h2 className="font-display text-xl sm:text-2xl font-bold text-ink">Instructor &amp; Teacher</h2>
              <p className="mt-2 text-xs sm:text-sm leading-relaxed text-muted">
                Create subjects, manage enrolled rosters, generate shareable QR invite links, and record classroom attendance with photo or voice in one click.
              </p>
            </div>

            <div className="mt-5 sm:mt-6 space-y-2 border-t border-border/70 pt-4 sm:pt-5 text-xs text-muted">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-amber-400 flex-shrink-0" />
                <span>Snap 1 panoramic classroom photo to mark 60+ students</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-amber-400 flex-shrink-0" />
                <span>Instant QR code &amp; 6-character invite codes</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-amber-400 flex-shrink-0" />
                <span>Manual review &amp; override candidate confirmation</span>
              </div>
            </div>

            <div className="mt-6 sm:mt-8">
              <Link
                to="/teacher"
                className="btn-primary w-full flex items-center justify-center gap-2 py-3"
              >
                <span>Enter Faculty Console</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          {/* Student Portal Card */}
          <div className="group relative rounded-2xl border border-border/80 bg-gradient-to-b from-[#111827]/90 to-[#0B0F19]/90 p-5 sm:p-8 backdrop-blur-xl shadow-card transition-all duration-300 hover:border-cyan-500/50 hover:shadow-card-hover hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-3xl rounded-full pointer-events-none group-hover:bg-cyan-500/10 transition-colors" />

            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 shadow-sm shadow-cyan-500/10 group-hover:scale-105 transition-transform">
                <Camera size={22} />
              </div>
              <span className="font-mono text-[10px] sm:text-[11px] uppercase tracking-widest px-2.5 py-1 rounded-md bg-subtle border border-border text-muted">
                Student Portal
              </span>
            </div>

            <div className="mt-5 sm:mt-6">
              <h2 className="font-display text-xl sm:text-2xl font-bold text-ink">Student Access</h2>
              <p className="mt-2 text-xs sm:text-sm leading-relaxed text-muted">
                Passwordless biometric login. Simply look at your webcam or phone camera to verify your identity, enroll in subjects, and inspect attendance records.
              </p>
            </div>

            <div className="mt-5 sm:mt-6 space-y-2 border-t border-border/70 pt-4 sm:pt-5 text-xs text-muted">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-cyan-400 flex-shrink-0" />
                <span>Zero passwords — 100% facial biometric recognition</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-cyan-400 flex-shrink-0" />
                <span>One-tap subject enrollment via invite links &amp; codes</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-cyan-400 flex-shrink-0" />
                <span>Live attendance percentage tracking across all subjects</span>
              </div>
            </div>

            <div className="mt-6 sm:mt-8">
              <Link
                to="/student"
                className="btn-cyan w-full flex items-center justify-center gap-2 py-3"
              >
                <span>Launch Face Scan Sign-In</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>

        {/* Workflow Showcase */}
        <div className="mt-14 sm:mt-20 rounded-2xl border border-border/80 bg-card/60 p-5 sm:p-8 backdrop-blur-xl max-w-4xl mx-auto">
          <div className="text-center mb-6 sm:mb-8">
            <span className="font-mono text-xs uppercase tracking-widest text-cyan-400">High Speed AI Pipeline</span>
            <h3 className="font-display text-lg sm:text-xl font-bold text-ink mt-1">How Arguss Automates Class Attendance</h3>
          </div>

          <div className="grid gap-3.5 sm:gap-6 sm:grid-cols-3">
            <div className="flex flex-col items-center text-center p-4 rounded-xl border border-border/60 bg-subtle/50">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-card text-accent mb-3 border border-border">
                <QrCode size={20} />
              </div>
              <h4 className="font-semibold text-sm text-ink">1. Instant Enrollment</h4>
              <p className="text-xs text-muted mt-1 leading-relaxed">Students scan a QR code to register their facial biometric profile in seconds.</p>
            </div>

            <div className="flex flex-col items-center text-center p-4 rounded-xl border border-border/60 bg-subtle/50">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-card text-cyan-400 mb-3 border border-border">
                <Cpu size={20} />
              </div>
              <h4 className="font-semibold text-sm text-ink">2. Multimodal Scan</h4>
              <p className="text-xs text-muted mt-1 leading-relaxed">Faculty snaps a room photo or records roll-call. Facial &amp; voice embeddings are extracted.</p>
            </div>

            <div className="flex flex-col items-center text-center p-4 rounded-xl border border-border/60 bg-subtle/50">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-card text-emerald-400 mb-3 border border-border">
                <BarChart3 size={20} />
              </div>
              <h4 className="font-semibold text-sm text-ink">3. Instant Verification</h4>
              <p className="text-xs text-muted mt-1 leading-relaxed">Neural model matches students against enrolled vectors and logs records immediately.</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/70 bg-nav/60 py-6 text-center text-xs text-faint">
        <div className="mx-auto max-w-6xl px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Logo size={20} />
            <span className="font-mono text-muted">Arguss Biometric Attendance System</span>
          </div>
          <div className="font-mono text-[11px] text-faint">
            Neural Vision • Precision Vector Embeddings • Encrypted
          </div>
        </div>
      </footer>
    </div>
  )
}

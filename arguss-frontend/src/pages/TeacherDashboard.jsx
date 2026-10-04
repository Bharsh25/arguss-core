import { useEffect, useState } from 'react'
import { 
  Plus, 
  Users, 
  Camera, 
  QrCode, 
  LogOut, 
  BookOpen, 
  Sparkles, 
  Calendar, 
  ShieldCheck,
  RefreshCw,
  Search
} from 'lucide-react'
import Logo from '../components/Logo.jsx'
import SubjectCard from '../components/SubjectCard.jsx'
import CreateSubjectModal from '../components/CreateSubjectModal.jsx'
import ShareInviteModal from '../components/ShareInviteModal.jsx'
import AttendancePhotoModal from '../components/AttendancePhotoModal.jsx'
import { subjectsApi } from '../api/subjects.js'
import { useAuth } from '../context/AuthContext.jsx'

export default function TeacherDashboard() {
  const [subjects, setSubjects] = useState(null)
  const [modal, setModal] = useState(null) // 'create' | { type: 'share'|'attendance', subject }
  const [search, setSearch] = useState('')
  const { auth, logout } = useAuth()

  async function refresh() {
    try {
      const data = await subjectsApi.listMine()
      setSubjects(data)
    } catch {
      setSubjects([])
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  // Aggregate metrics
  const totalStudents = subjects?.reduce((acc, s) => acc + (s.total_students || 0), 0) ?? 0
  const totalClasses = subjects?.reduce((acc, s) => acc + (s.total_classes || 0), 0) ?? 0

  const filteredSubjects = subjects?.filter((s) => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.subject_code.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-page text-ink selection:bg-accent/30 selection:text-white pb-16">
      {/* Top Header */}
      <header className="sticky top-0 z-30 border-b border-border/80 bg-nav/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-3.5 py-2.5 sm:px-6 sm:py-3">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <Logo size={32} />
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-display text-sm sm:text-base font-bold tracking-wider text-ink">ARGUSS</span>
                <span className="font-mono text-[9px] sm:text-[10px] uppercase tracking-wider px-1.5 sm:px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400">
                  Faculty
                </span>
              </div>
              <div className="text-[11px] sm:text-xs text-muted truncate max-w-[140px] sm:max-w-none">Prof. {auth?.name}</div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:flex items-center gap-1.5 font-mono text-[11px] text-emerald-400 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>AI VISION ACTIVE</span>
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

      {/* Main Content Area */}
      <main className="mx-auto max-w-6xl px-3.5 py-5 sm:px-6 sm:py-8">
        {/* Metric Cards Banner: Responsive 3-column stats */}
        <div className="mb-6 sm:mb-8 grid grid-cols-3 gap-2 sm:gap-4">
          <div className="rounded-xl sm:rounded-2xl border border-border/80 bg-card/70 p-3 sm:p-5 backdrop-blur-xl shadow-card text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-between">
              <span className="text-[11px] sm:text-xs font-medium text-muted line-clamp-1">Classes</span>
              <div className="hidden sm:flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <BookOpen size={16} />
              </div>
            </div>
            <div className="mt-1 sm:mt-3 font-mono text-xl sm:text-3xl font-bold text-ink">
              {subjects === null ? '—' : subjects.length}
            </div>
            <div className="mt-1 hidden sm:block text-[11px] text-faint">Registered sections</div>
          </div>

          <div className="rounded-xl sm:rounded-2xl border border-border/80 bg-card/70 p-3 sm:p-5 backdrop-blur-xl shadow-card text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-between">
              <span className="text-[11px] sm:text-xs font-medium text-muted line-clamp-1">Students</span>
              <div className="hidden sm:flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Users size={16} />
              </div>
            </div>
            <div className="mt-1 sm:mt-3 font-mono text-xl sm:text-3xl font-bold text-ink">
              {subjects === null ? '—' : totalStudents}
            </div>
            <div className="mt-1 hidden sm:block text-[11px] text-faint">Verified rosters</div>
          </div>

          <div className="rounded-xl sm:rounded-2xl border border-border/80 bg-card/70 p-3 sm:p-5 backdrop-blur-xl shadow-card text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-between">
              <span className="text-[11px] sm:text-xs font-medium text-muted line-clamp-1">Sessions</span>
              <div className="hidden sm:flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Calendar size={16} />
              </div>
            </div>
            <div className="mt-1 sm:mt-3 font-mono text-xl sm:text-3xl font-bold text-ink">
              {subjects === null ? '—' : totalClasses}
            </div>
            <div className="mt-1 hidden sm:block text-[11px] text-faint">AI scan records</div>
          </div>
        </div>

        {/* Section Title & Actions */}
        <div className="mb-5 sm:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="font-display text-xl sm:text-2xl font-bold text-ink">Your Classroom Roster</h1>
            <p className="mt-0.5 text-xs text-muted">
              Select a class to scan attendance or share access QR codes with students.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {subjects && subjects.length > 2 && (
              <div className="relative flex-1 sm:flex-initial">
                <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type="text"
                  placeholder="Filter classes…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full sm:w-44 rounded-lg border border-border bg-subtle/80 pl-8 pr-3 py-2 sm:py-1.5 text-xs text-ink placeholder:text-faint focus:border-accent focus:outline-none min-h-[38px] sm:min-h-0"
                />
              </div>
            )}
            <button
              onClick={() => setModal('create')}
              className="btn-primary flex-1 sm:flex-initial flex items-center justify-center gap-1.5 text-xs py-2 px-3.5 shadow-sm min-h-[38px] whitespace-nowrap"
            >
              <Plus size={15} />
              <span>Create Class</span>
            </button>
          </div>
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
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mb-4">
              <BookOpen size={28} />
            </div>
            <h3 className="font-display text-lg font-bold text-ink">No Classes Created Yet</h3>
            <p className="mt-1 max-w-sm text-xs text-muted leading-relaxed">
              Create your first subject to generate an invite code and QR badge for your students to join.
            </p>
            <button
              onClick={() => setModal('create')}
              className="btn-primary mt-6 flex items-center gap-2 text-xs py-2.5 px-5"
            >
              <Plus size={15} />
              <span>Create Your First Class</span>
            </button>
          </div>
        )}

        {/* Class Cards Grid */}
        <div className="grid gap-5 sm:grid-cols-2">
          {filteredSubjects?.map((s) => (
            <SubjectCard
              key={s.subject_id}
              subject={s}
              stats={[
                { label: 'Students', value: s.total_students },
                { label: 'Sessions', value: s.total_classes },
              ]}
              footer={
                <div className="flex gap-2.5">
                  <button
                    onClick={() => setModal({ type: 'share', subject: s })}
                    className="btn-secondary flex-1 py-2 text-xs flex items-center justify-center gap-1.5"
                  >
                    <QrCode size={14} className="text-cyan-400" />
                    <span>Access &amp; Invite</span>
                  </button>
                  <button
                    onClick={() => setModal({ type: 'attendance', subject: s })}
                    className="btn-primary flex-1 py-2 text-xs flex items-center justify-center gap-1.5"
                  >
                    <Camera size={14} />
                    <span>Mark Attendance</span>
                  </button>
                </div>
              }
            />
          ))}
        </div>
      </main>

      {/* Modals */}
      {modal === 'create' && (
        <CreateSubjectModal
          onClose={() => setModal(null)}
          onCreated={() => { setModal(null); refresh() }}
        />
      )}
      {modal?.type === 'share' && (
        <ShareInviteModal
          subject={modal.subject}
          onClose={() => setModal(null)}
        />
      )}
      {modal?.type === 'attendance' && (
        <AttendancePhotoModal
          subject={modal.subject}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); refresh() }}
        />
      )}
    </div>
  )
}
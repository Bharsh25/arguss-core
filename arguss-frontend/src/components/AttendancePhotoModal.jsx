import { useRef, useState } from 'react'
import { 
  Camera, 
  UploadCloud, 
  Mic, 
  MicOff, 
  Loader2, 
  RotateCcw, 
  Trash2, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  Users
} from 'lucide-react'
import Modal from './Modal.jsx'
import Badge from './Badge.jsx'
import { attendanceApi } from '../api/attendance.js'
import { apiErrorMessage } from '../api/client.js'

export default function AttendancePhotoModal({ subject, onClose, onSaved }) {
  const [mode, setMode] = useState('photo') // 'photo' | 'voice'
  const [files, setFiles] = useState([])
  const [preview, setPreview] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  // Direct camera & gallery file input refs
  const cameraInputRef = useRef(null)
  const galleryInputRef = useRef(null)

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false)
  const [recordedBlob, setRecordedBlob] = useState(null)
  const [recordedUrl, setRecordedUrl] = useState(null)
  const [elapsed, setElapsed] = useState(0)
  const recorderRef = useRef(null)
  const chunksRef = useRef([])
  const timerRef = useRef(null)

  function handleFiles(e) {
    if (!e.target.files?.length) return
    const incoming = Array.from(e.target.files)
    setFiles((prev) => [...prev, ...incoming])
    setPreview(null)
    setError('')
    e.target.value = ''
  }

  function removeFile(index) {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  function clearFiles() {
    setFiles([])
    setPreview(null)
  }

  function switchMode(next) {
    setMode(next)
    setPreview(null)
    setError('')
  }

  async function scanPhotos() {
    if (files.length === 0) return
    setLoading(true)
    setError('')
    try {
      const result = await attendanceApi.previewFromPhotos(subject.subject_id, files)
      setPreview(result)
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not process the photo(s).'))
    } finally {
      setLoading(false)
    }
  }

  async function startRecording() {
    setError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      chunksRef.current = []
      recorder.ondataavailable = (e) => chunksRef.current.push(e.data)
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        setRecordedBlob(blob)
        setRecordedUrl(URL.createObjectURL(blob))
        stream.getTracks().forEach((t) => t.stop())
        clearInterval(timerRef.current)
      }
      recorder.start()
      recorderRef.current = recorder
      setIsRecording(true)
      setElapsed(0)
      timerRef.current = setInterval(() => setElapsed((s) => s + 1), 1000)
    } catch {
      setError('Could not access the microphone. Check browser permissions and try again.')
    }
  }

  function stopRecording() {
    recorderRef.current?.stop()
    setIsRecording(false)
  }

  function retakeVoice() {
    setRecordedBlob(null)
    setRecordedUrl(null)
    setElapsed(0)
  }

  async function scanVoice() {
    if (!recordedBlob) return
    setLoading(true)
    setError('')
    try {
      const result = await attendanceApi.previewFromVoice(subject.subject_id, recordedBlob)
      setPreview(result)
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not process the recording.'))
    } finally {
      setLoading(false)
    }
  }

  function toggle(studentId) {
    setPreview((p) => ({
      ...p,
      candidates: p.candidates.map((c) =>
        c.student_id === studentId ? { ...c, is_present: !c.is_present } : c
      ),
    }))
  }

  async function confirm() {
    setSaving(true)
    setError('')
    try {
      await attendanceApi.confirm(subject.subject_id, preview.candidates)
      onSaved()
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not save attendance.'))
    } finally {
      setSaving(false)
    }
  }

  const presentCount = preview?.candidates.filter((c) => c.is_present).length ?? 0

  return (
    <Modal
      title="Mark Attendance"
      description={`Scan classroom photo(s) or record roll-call for ${subject.name}.`}
      onClose={onClose}
      width="max-w-lg"
    >
      {!preview && (
        <div className="space-y-4">
          {/* Mode Switch Tabs */}
          <div className="flex gap-1 rounded-xl border border-border bg-subtle p-1">
            <button
              onClick={() => switchMode('photo')}
              className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                mode === 'photo' ? 'bg-amber-400 text-gray-950 shadow-sm' : 'text-muted hover:text-ink'
              }`}
            >
              <Camera size={14} />
              <span>Camera &amp; Photos</span>
            </button>
            <button
              onClick={() => switchMode('voice')}
              className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                mode === 'voice' ? 'bg-amber-400 text-gray-950 shadow-sm' : 'text-muted hover:text-ink'
              }`}
            >
              <Mic size={14} />
              <span>Voice Roll-Call</span>
            </button>
          </div>

          {mode === 'photo' && (
            <div className="space-y-3.5">
              {/* Hidden file inputs for mobile Camera & Gallery */}
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFiles}
                className="hidden"
              />
              <input
                ref={galleryInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFiles}
                className="hidden"
              />

              {/* Action Buttons: Take Photo vs Choose Files */}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="btn-secondary py-3 px-3 flex flex-col items-center justify-center gap-1.5 text-center min-h-[70px] rounded-xl hover:border-cyan-500/50"
                >
                  <Camera size={20} className="text-cyan-400" />
                  <span className="text-xs font-semibold text-ink">Take Photo</span>
                  <span className="text-[10px] text-faint">Mobile Camera</span>
                </button>

                <button
                  type="button"
                  onClick={() => galleryInputRef.current?.click()}
                  className="btn-secondary py-3 px-3 flex flex-col items-center justify-center gap-1.5 text-center min-h-[70px] rounded-xl hover:border-amber-500/50"
                >
                  <UploadCloud size={20} className="text-amber-400" />
                  <span className="text-xs font-semibold text-ink">Select Files</span>
                  <span className="text-[10px] text-faint">Gallery / Storage</span>
                </button>
              </div>

              {/* Selected Photos List / Empty helper */}
              {files.length > 0 ? (
                <div className="rounded-xl border border-border/80 bg-subtle/80 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-ink flex items-center gap-1.5">
                      <Sparkles size={13} className="text-cyan-400" />
                      <span>{files.length} Photo{files.length > 1 ? 's' : ''} Ready</span>
                    </span>
                    <button
                      type="button"
                      onClick={clearFiles}
                      className="text-[11px] text-muted hover:text-red-400 transition-colors"
                    >
                      Clear all
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
                    {files.map((f, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-1 rounded-md bg-card border border-border text-muted truncate max-w-[180px]"
                      >
                        <span className="truncate">{f.name}</span>
                        <button
                          type="button"
                          onClick={() => removeFile(i)}
                          className="hover:text-red-400 flex-shrink-0"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-border-strong/70 bg-card/30 p-4 text-center">
                  <p className="text-xs text-muted">
                    Snap or upload one or more wide-angle classroom photos. Arguss will detect and match all faces.
                  </p>
                </div>
              )}

              {error && (
                <div className="flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
                  <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <button
                onClick={scanPhotos}
                disabled={files.length === 0 || loading}
                className="btn-primary w-full py-3 flex items-center justify-center gap-2 text-sm font-semibold min-h-[46px]"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Analyzing Classroom Faces…</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    <span>Scan {files.length > 0 ? `${files.length} Photo(s)` : 'Faces'}</span>
                  </>
                )}
              </button>
            </div>
          )}

          {mode === 'voice' && (
            <div className="space-y-3.5">
              <div className="rounded-xl border border-border bg-subtle p-4 sm:p-5 text-center">
                {!recordedBlob && !isRecording && (
                  <>
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                      <Mic size={22} />
                    </div>
                    <p className="mb-4 text-xs sm:text-sm text-muted max-w-sm mx-auto leading-relaxed">
                      Tap record and conduct standard roll-call. Arguss matches enrolled student voice embeddings automatically.
                    </p>
                    <button
                      onClick={startRecording}
                      className="btn-primary w-full py-3 flex items-center justify-center gap-2 text-sm font-semibold min-h-[46px]"
                    >
                      <Mic size={16} />
                      <span>Start Voice Recording</span>
                    </button>
                  </>
                )}

                {isRecording && (
                  <div className="py-2">
                    <div className="mb-4 flex items-center justify-center gap-2 text-sm font-mono text-ink">
                      <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-red-500" />
                      <span>Recording… {String(Math.floor(elapsed / 60)).padStart(2, '0')}:{String(elapsed % 60).padStart(2, '0')}</span>
                    </div>
                    <button
                      onClick={stopRecording}
                      className="w-full rounded-xl bg-red-500/20 border border-red-500/50 py-3 px-4 text-xs sm:text-sm font-semibold text-red-300 flex items-center justify-center gap-2 animate-pulse hover:bg-red-500/30 min-h-[46px]"
                    >
                      <MicOff size={16} />
                      <span>Stop Recording</span>
                    </button>
                  </div>
                )}

                {recordedBlob && !isRecording && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 rounded-lg bg-card p-2 border border-border">
                      <audio controls src={recordedUrl} className="w-full h-8" />
                    </div>
                    <button
                      onClick={retakeVoice}
                      className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-red-400 transition-colors"
                    >
                      <RotateCcw size={13} />
                      <span>Discard and re-record</span>
                    </button>
                  </div>
                )}
              </div>

              {error && (
                <div className="flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
                  <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <button
                onClick={scanVoice}
                disabled={!recordedBlob || loading}
                className="btn-primary w-full py-3 flex items-center justify-center gap-2 text-sm font-semibold min-h-[46px]"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Matching Voiceprints…</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    <span>Analyze Audio Recording</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Candidate Verification Preview Screen */}
      {preview && (
        <div className="space-y-3.5">
          {/* Summary Stat Grid */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <SummaryStat
              label={mode === 'photo' ? 'Faces Found' : 'Mode'}
              value={mode === 'photo' ? preview.faces_detected ?? '—' : 'Voice'}
            />
            <SummaryStat
              label="Present"
              value={presentCount}
              tone="success"
            />
            <SummaryStat
              label="Enrolled"
              value={preview.total_enrolled}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-muted px-1">
            <span>Tap any student to toggle status</span>
            <span className="font-mono text-[10px] text-cyan-400">
              {Math.round((presentCount / (preview.total_enrolled || 1)) * 100)}% attendance
            </span>
          </div>

          {/* Interactive Candidate List with comfortable mobile tap rows */}
          <div className="max-h-60 sm:max-h-72 overflow-y-auto rounded-xl border border-border/80 bg-subtle/50 divide-y divide-border/60">
            {preview.candidates.map((c) => (
              <div
                key={c.student_id}
                onClick={() => toggle(c.student_id)}
                className="flex items-center justify-between px-3.5 py-2.5 sm:px-4 sm:py-3 transition-colors hover:bg-card cursor-pointer active:bg-card/80"
              >
                <div className="min-w-0 pr-2">
                  <div className="text-xs sm:text-sm font-semibold text-ink truncate">{c.name}</div>
                  <div className="text-[10px] sm:text-xs text-faint truncate">
                    {c.match_source !== '-' ? c.match_source : 'Manual verification'}
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <Badge tone={c.is_present ? 'present' : 'absent'}>
                    {c.is_present ? 'Present' : 'Absent'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
              <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Sticky action bar */}
          <div className="sticky bottom-0 bg-[#0F172A]/95 backdrop-blur-md pt-2 pb-0 flex gap-2.5">
            <button
              onClick={() => setPreview(null)}
              className="btn-secondary flex-1 py-2.5 text-xs font-semibold min-h-[42px]"
            >
              Rescan
            </button>
            <button
              onClick={confirm}
              disabled={saving}
              className="btn-primary flex-1 py-2.5 text-xs font-semibold min-h-[42px] flex items-center justify-center gap-1.5"
            >
              {saving ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Saving…</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={15} />
                  <span>Confirm ({presentCount})</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </Modal>
  )
}

function SummaryStat({ label, value, tone }) {
  return (
    <div className="rounded-xl border border-border/70 bg-subtle/80 py-2 sm:py-2.5 px-1 sm:px-2">
      <div className={`text-base sm:text-lg font-bold font-mono ${tone === 'success' ? 'text-emerald-400' : 'text-ink'}`}>
        {value}
      </div>
      <div className="text-[10px] sm:text-xs text-muted truncate">{label}</div>
    </div>
  )
}
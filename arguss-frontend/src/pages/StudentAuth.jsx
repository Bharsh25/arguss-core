import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { 
  Camera, 
  Mic, 
  MicOff, 
  Scan, 
  RotateCcw, 
  CheckCircle2, 
  User, 
  Sparkles, 
  Loader2, 
  ArrowLeft, 
  ShieldCheck, 
  AlertCircle,
  Volume2,
  Trash2
} from 'lucide-react'
import Logo from '../components/Logo.jsx'
import ViewfinderFrame from '../components/ViewfinderFrame.jsx'
import { authApi } from '../api/auth.js'
import { subjectsApi } from '../api/subjects.js'
import { apiErrorMessage } from '../api/client.js'
import { useAuth } from '../context/AuthContext.jsx'

export default function StudentAuth() {
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const [capturedBlob, setCapturedBlob] = useState(null)
  const [capturedUrl, setCapturedUrl] = useState(null)
  const [status, setStatus] = useState('camera') // camera | scanning | register
  const [facingMode, setFacingMode] = useState('user') // 'user' | 'environment'
  const [message, setMessage] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)

  // Optional voice enrollment, captured during registration
  const [voiceBlob, setVoiceBlob] = useState(null)
  const [voiceUrl, setVoiceUrl] = useState(null)
  const [isRecordingVoice, setIsRecordingVoice] = useState(false)
  const voiceRecorderRef = useRef(null)
  const voiceChunksRef = useRef([])
  const [invitePreview, setInvitePreview] = useState(null)
  const { login } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/student/dashboard'

  // If arriving here via a /join/:code invite link that bounced through login
  useEffect(() => {
    const match = redirectTo.match(/^\/join\/([^/?]+)/)
    if (!match) return
    subjectsApi.lookupInvite(match[1]).then(setInvitePreview).catch(() => { })
  }, [redirectTo])

  useEffect(() => {
    let cancelled = false
    async function startCamera() {
      try {
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((t) => t.stop())
        }
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: facingMode } },
        })
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }
        streamRef.current = stream
        if (videoRef.current) videoRef.current.srcObject = stream
      } catch {
        setMessage('Could not access your camera. Check browser permissions and try again.')
      }
    }
    if (status === 'camera') startCamera()
    return () => {
      cancelled = true
      streamRef.current?.getTracks().forEach((t) => t.stop())
    }
  }, [status, facingMode])

  function toggleCamera() {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'))
  }

  const audioStreamRef = useRef(null)

  function capture() {
    const video = videoRef.current
    if (!video || !video.videoWidth || !video.videoHeight) {
      setMessage('Camera is starting up. Please wait a second and try again.')
      return
    }
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d').drawImage(video, 0, 0)
    canvas.toBlob(async (blob) => {
      if (!blob) {
        setMessage('Could not capture frame. Please try again.')
        return
      }
      setCapturedBlob(blob)
      setCapturedUrl(URL.createObjectURL(blob))
      streamRef.current?.getTracks().forEach((t) => t.stop())
      await identify(blob)
    }, 'image/jpeg', 0.92)
  }

  async function startVoiceRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      audioStreamRef.current = stream
      
      // Determine a supported web container format
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') 
        ? 'audio/webm' 
        : (MediaRecorder.isTypeSupported('audio/mp4') ? 'audio/mp4' : '')
      
      const options = mimeType ? { mimeType } : {}
      const recorder = new MediaRecorder(stream, options)
      
      voiceChunksRef.current = []
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) voiceChunksRef.current.push(e.data)
      }
      
      recorder.onstop = () => {
        const actualType = recorder.mimeType || 'audio/webm'
        const blob = new Blob(voiceChunksRef.current, { type: actualType })
        
        // Wrap as a File object so the backend reads it cleanly as an UploadFile stream
        const audioFile = new File([blob], "voice_enrollment.webm", { type: actualType })
        
        setVoiceBlob(audioFile)
        setVoiceUrl(URL.createObjectURL(blob))
        stream.getTracks().forEach((t) => t.stop())
        audioStreamRef.current = null
      }
      
      recorder.start()
      voiceRecorderRef.current = recorder
      setIsRecordingVoice(true)
    } catch {
      setMessage('Could not access your microphone. Voice enrollment is optional — you can skip it.')
    }
  }

  function stopVoiceRecording() {
    if (voiceRecorderRef.current && voiceRecorderRef.current.state === 'recording') {
      voiceRecorderRef.current.stop()
    }
    setIsRecordingVoice(false)
  }

  // Cleanup audio tracks on unmount
  useEffect(() => {
    return () => {
      audioStreamRef.current?.getTracks().forEach((t) => t.stop())
    }
  }, [])

  function clearVoice() {
    setVoiceBlob(null)
    setVoiceUrl(null)
  }

  async function identify(blob) {
    setStatus('scanning')
    setMessage('')
    try {
      const result = await authApi.identifyStudent(blob)
      if (result.matched) {
        login(result.token)
        navigate(redirectTo)
        return
      }
      setMessage(result.message || 'Face not recognized in registered database. Please complete registration below.')
      setStatus('register')
    } catch (err) {
      setMessage(apiErrorMessage(err, 'Could not scan your face. Please try again.'))
      setStatus('camera')
    }
  }

  async function handleRegister(e) {
    e.preventDefault()
    if (!capturedBlob) return
    setLoading(true)
    setMessage('')
    try {
      const data = await authApi.registerStudent(name, capturedBlob, voiceBlob)
      login(data)
      navigate(redirectTo)
    } catch (err) {
      setMessage(apiErrorMessage(err, 'Could not create your account.'))
    } finally {
      setLoading(false)
    }
  }

  function retake() {
    setCapturedBlob(null)
    setCapturedUrl(null)
    setMessage('')
    setStatus('camera')
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-3.5 py-6 sm:px-4 sm:py-10 selection:bg-cyan-500/30 selection:text-white">
      {/* Background Cyber Ambient Lights */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-cyan-500/10 blur-[130px] rounded-full" />
      <div className="pointer-events-none absolute bottom-10 left-10 w-[400px] h-[400px] bg-amber-500/10 blur-[120px] rounded-full" />
      <div className="pointer-events-none absolute inset-0 bg-grid-cyber opacity-50" />

      {/* Brand Header */}
      <div className="relative z-10 mb-5 sm:mb-6 flex flex-col items-center">
        <Link to="/" className="group flex items-center gap-2.5 sm:gap-3 transition-transform hover:scale-105">
          <Logo size={36} />
          <div>
            <span className="font-display text-lg sm:text-xl font-bold tracking-wider text-ink">ARGUSS</span>
            <span className="ml-2 text-[10px] font-mono uppercase tracking-widest text-cyan-400 px-2 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-800/40">
              Biometric Auth
            </span>
          </div>
        </Link>
      </div>

      {/* Main Terminal Card */}
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-border-strong/80 bg-gradient-to-b from-[#111827]/90 to-[#0A0F1A]/95 p-4 sm:p-7 backdrop-blur-2xl shadow-raised">
        <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />

        {invitePreview && (
          <div className="mb-4 sm:mb-5 rounded-xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950/40 to-blue-950/20 px-3.5 py-2.5 sm:px-4 sm:py-3 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-semibold text-cyan-300">
              <Sparkles size={14} className="text-cyan-400" />
              <span>Course Invitation Detected</span>
            </div>
            <p className="mt-1 text-xs text-ink">
              You are joining <span className="font-semibold text-white">{invitePreview.subject_name}</span>
            </p>
            <p className="font-mono text-[10px] text-muted mt-0.5">Instructor: {invitePreview.instructor}</p>
          </div>
        )}

        <div className="mb-3 sm:mb-4">
          <h1 className="font-display text-lg sm:text-xl font-bold text-ink flex items-center justify-between">
            <span>{status === 'register' ? 'Register Face Biometrics' : 'Student Facial Sign-In'}</span>
            <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-subtle border border-border text-cyan-400">
              {status === 'register' ? 'Step 2 / 2' : 'Passwordless'}
            </span>
          </h1>
          <p className="mt-1 text-xs text-muted leading-relaxed">
            {status === 'register'
              ? 'Your face was captured. Provide your full name to enroll in the biometric database.'
              : 'Look straight at the camera. The AI neural engine matches your face automatically.'}
          </p>
        </div>

        {/* High-Tech Viewfinder / Captured Photo Area */}
        <div className="relative my-3 sm:my-4">
          <ViewfinderFrame isScanning={status === 'scanning'}>
            {status !== 'register' ? (
              <div className="relative aspect-square sm:aspect-square w-full max-h-[340px] sm:max-h-[380px] overflow-hidden bg-black flex items-center justify-center">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`h-full w-full object-cover transform ${facingMode === 'user' ? 'scale-x-[-1]' : 'scale-x-1'}`}
                />
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-30">
                  <div className="w-40 h-52 sm:w-44 sm:h-56 rounded-[50%] border-2 border-dashed border-cyan-400/80" />
                </div>

                {/* Mobile Camera Flip Button */}
                {status === 'camera' && (
                  <button
                    type="button"
                    onClick={toggleCamera}
                    className="absolute bottom-3 right-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/75 border border-white/20 text-white backdrop-blur-md transition-all hover:bg-black/90 active:scale-90 shadow-md"
                    title={`Switch to ${facingMode === 'user' ? 'rear' : 'front'} camera`}
                    aria-label="Switch Camera"
                  >
                    <RotateCcw size={15} className="text-cyan-400" />
                  </button>
                )}
              </div>
            ) : (
              <div className="relative aspect-square sm:aspect-square w-full max-h-[340px] sm:max-h-[380px] overflow-hidden bg-black">
                <img
                  src={capturedUrl}
                  alt="Captured face"
                  className={`h-full w-full object-cover transform ${facingMode === 'user' ? 'scale-x-[-1]' : 'scale-x-1'}`}
                />
                <div className="absolute bottom-2 right-2 rounded-md bg-black/75 px-2 py-0.5 font-mono text-[10px] text-emerald-400 border border-emerald-500/30 flex items-center gap-1 backdrop-blur-sm">
                  <CheckCircle2 size={11} />
                  <span>FACE ENCODED</span>
                </div>
              </div>
            )}
          </ViewfinderFrame>
        </div>

        {message && (
          <div className="my-3 flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-300">
            <AlertCircle size={15} className="flex-shrink-0 mt-0.5 text-amber-400" />
            <span>{message}</span>
          </div>
        )}

        {status === 'camera' && (
          <div className="mt-4">
            <button
              onClick={capture}
              className="btn-cyan w-full py-3 flex items-center justify-center gap-2 text-sm font-semibold min-h-[46px]"
            >
              <Camera size={17} />
              <span>Capture &amp; Verify Identity</span>
            </button>
            <p className="mt-2 text-center font-mono text-[11px] text-faint">
              Ensure proper lighting and face the camera directly
            </p>
          </div>
        )}

        {status === 'scanning' && (
          <div className="mt-4 flex flex-col items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-950/20 py-4 px-3 text-center">
            <div className="flex items-center gap-2.5 text-sm font-semibold text-cyan-300">
              <Loader2 size={18} className="animate-spin text-cyan-400" />
              <span>Extracting Biometric Embeddings…</span>
            </div>
            <p className="mt-1 font-mono text-[11px] text-muted">
              Running cosine similarity against student database
            </p>
          </div>
        )}

        {status === 'register' && (
          <form onSubmit={handleRegister} className="mt-4 space-y-4">
            <div>
              <label className="block text-xs font-medium text-ink mb-1.5 flex items-center justify-between">
                <span>Student Full Name</span>
                <span className="font-mono text-[10px] text-faint">Official Name</span>
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted">
                  <User size={15} />
                </div>
                <input
                  className="input-field pl-10"
                  placeholder="e.g. Rahul Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoFocus
                />
              </div>
            </div>

            {/* Voice Enrollment Box */}
            <div className="rounded-xl border border-border/80 bg-subtle/70 p-3.5 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="meta-label text-cyan-400">Voiceprint Enrollment (Optional)</span>
                <span className="text-[10px] text-faint font-mono">Neural Roll-call</span>
              </div>

              {!voiceBlob && !isRecordingVoice && (
                <button
                  type="button"
                  onClick={startVoiceRecording}
                  className="btn-secondary w-full py-2 text-xs flex items-center justify-center gap-2"
                >
                  <Mic size={14} className="text-cyan-400" />
                  <span>Record Short Voice Sample ("Present")</span>
                </button>
              )}

              {isRecordingVoice && (
                <button
                  type="button"
                  onClick={stopVoiceRecording}
                  className="w-full rounded-lg bg-red-500/20 border border-red-500/50 py-2.5 px-3 text-xs font-semibold text-red-300 flex items-center justify-center gap-2 animate-pulse hover:bg-red-500/30 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span className="sound-wave-bar w-1 bg-red-400 rounded-full" />
                    <span className="sound-wave-bar w-1 bg-red-400 rounded-full" style={{ animationDelay: '0.2s' }} />
                    <span className="sound-wave-bar w-1 bg-red-400 rounded-full" style={{ animationDelay: '0.4s' }} />
                  </div>
                  <MicOff size={14} />
                  <span>Recording… Click to Complete</span>
                </button>
              )}

              {voiceBlob && !isRecordingVoice && (
                <div className="space-y-2 mt-1">
                  <div className="flex items-center gap-2 rounded-lg bg-card/80 p-2 border border-border">
                    <Volume2 size={15} className="text-cyan-400 flex-shrink-0" />
                    <audio controls src={voiceUrl} className="h-7 w-full accent-cyan-400" />
                  </div>
                  <button
                    type="button"
                    onClick={clearVoice}
                    className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={12} />
                    <span>Discard and re-record</span>
                  </button>
                </div>
              )}

              <p className="mt-2 text-[10px] text-faint leading-normal">
                Enables teachers to mark attendance via voice roll call in addition to photo scans.
              </p>
            </div>

            <div className="flex gap-2.5 pt-1">
              <button
                type="button"
                onClick={retake}
                className="btn-secondary flex-1 py-2.5 text-xs flex items-center justify-center gap-1.5"
              >
                <RotateCcw size={14} />
                <span>Retake Photo</span>
              </button>
              <button
                type="submit"
                disabled={loading || !name.trim()}
                className="btn-primary flex-1 py-2.5 text-xs flex items-center justify-center gap-1.5"
              >
                {loading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Enrolling…</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={14} />
                    <span>Create Profile</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        <div className="mt-5 border-t border-border/70 pt-4 flex items-center justify-between text-xs">
          <Link to="/" className="inline-flex items-center gap-1.5 text-muted hover:text-ink transition-colors">
            <ArrowLeft size={13} />
            <span>Back to home</span>
          </Link>
          <div className="flex items-center gap-1 text-[11px] font-mono text-faint">
            <ShieldCheck size={12} className="text-cyan-400" />
            <span>Biometric Data Encrypted</span>
          </div>
        </div>
      </div>
    </div>
  )
}
import { useState } from 'react'
import { QrCode, ArrowRight, Loader2, AlertCircle, KeyRound } from 'lucide-react'
import Modal from './Modal.jsx'
import { subjectsApi } from '../api/subjects.js'
import { apiErrorMessage } from '../api/client.js'

export default function EnrollModal({ onClose, onEnrolled }) {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const result = await subjectsApi.enroll(code.trim())
      onEnrolled(result)
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not enroll with that code. Verify the code and try again.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      title="Enroll in a Class"
      description="Enter the 6-character access code provided by your instructor."
      onClose={onClose}
      width="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-ink mb-1.5 flex items-center justify-between">
            <span>Invite Code</span>
            <span className="font-mono text-[10px] text-cyan-400">Case-Insensitive</span>
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted">
              <KeyRound size={16} />
            </div>
            <input
              className="input-field pl-10 text-center font-mono text-xl font-bold tracking-[0.25em] text-cyan-400 uppercase"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="ABC123"
              maxLength={12}
              autoCapitalize="characters"
              autoCorrect="off"
              spellCheck="false"
              required
              autoFocus
            />
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-2.5 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
            <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !code.trim()}
          className="btn-cyan w-full py-3 flex items-center justify-center gap-2 text-sm font-semibold min-h-[46px]"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Verifying Enrollment Code…</span>
            </>
          ) : (
            <>
              <span>Join Class Section</span>
              <ArrowRight size={16} />
            </>
          )}
        </button>

        <p className="text-center font-mono text-[11px] text-faint">
          Alternatively, open your instructor's QR code in a camera to join instantly
        </p>
      </form>
    </Modal>
  )
}

import { useState } from 'react'
import { Plus, BookOpen, Hash, Layers, Loader2, AlertCircle } from 'lucide-react'
import Modal from './Modal.jsx'
import { subjectsApi } from '../api/subjects.js'
import { apiErrorMessage } from '../api/client.js'

export default function CreateSubjectModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ subject_code: '', name: '', section: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await subjectsApi.create({
        subject_code: form.subject_code.trim().toUpperCase(),
        name: form.name.trim(),
        section: form.section.trim(),
      })
      onCreated()
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not create the subject.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      title="Create New Subject"
      description="Register a new academic class section to start tracking AI attendance."
      onClose={onClose}
      width="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-ink mb-1.5 flex items-center justify-between">
            <span>Subject Code</span>
            <span className="font-mono text-[10px] text-faint">e.g. CS-401</span>
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted">
              <Hash size={14} />
            </div>
            <input
              className="input-field pl-10 font-mono uppercase"
              value={form.subject_code}
              onChange={update('subject_code')}
              placeholder="CS101"
              autoCapitalize="characters"
              autoCorrect="off"
              required
              autoFocus
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-ink mb-1.5 flex items-center justify-between">
            <span>Subject Name</span>
            <span className="font-mono text-[10px] text-faint">Full Course Title</span>
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted">
              <BookOpen size={14} />
            </div>
            <input
              className="input-field pl-10"
              value={form.name}
              onChange={update('name')}
              placeholder="e.g. Distributed Operating Systems"
              autoCapitalize="words"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-ink mb-1.5 flex items-center justify-between">
            <span>Section</span>
            <span className="font-mono text-[10px] text-faint">Batch / Group</span>
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted">
              <Layers size={14} />
            </div>
            <input
              className="input-field pl-10"
              value={form.section}
              onChange={update('section')}
              placeholder="e.g. Section A"
              autoCapitalize="words"
              required
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
          disabled={loading}
          className="btn-primary w-full py-3 mt-2 flex items-center justify-center gap-2 text-sm font-semibold min-h-[46px]"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Registering Class…</span>
            </>
          ) : (
            <>
              <Plus size={16} />
              <span>Create Class &amp; Generate Invite</span>
            </>
          )}
        </button>
      </form>
    </Modal>
  )
}

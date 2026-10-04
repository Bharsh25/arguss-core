import { useEffect, useRef, useState } from 'react'
import { QRCodeCanvas, QRCodeSVG } from 'qrcode.react'
import { Copy, Check, Download, QrCode, Link2, Sparkles, Share2 } from 'lucide-react'
import Modal from './Modal.jsx'
import { subjectsApi } from '../api/subjects.js'

function CopyButton({ value, label = 'Copy' }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    if (!value) return
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 1600)
  }
  return (
    <button
      onClick={copy}
      className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all min-h-[36px] flex-shrink-0 ${
        copied
          ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
          : 'border-border bg-card/60 text-muted hover:bg-white/[0.08] hover:text-white'
      }`}
    >
      {copied ? (
        <>
          <Check size={13} />
          <span>Copied</span>
        </>
      ) : (
        <>
          <Copy size={13} />
          <span>{label}</span>
        </>
      )}
    </button>
  )
}

export default function ShareInviteModal({ subject, onClose }) {
  const [invite, setInvite] = useState(null)
  const [error, setError] = useState('')
  const svgRef = useRef(null)
  const canvasRef = useRef(null)

  function loadInvite() {
    setError('')
    subjectsApi.getInvite(subject.subject_id)
      .then(setInvite)
      .catch((err) => {
        setError('Could not generate invite details. Please try again.')
      })
  }

  useEffect(() => {
    loadInvite()
  }, [subject.subject_id])

  function downloadPng() {
    const canvas = canvasRef.current?.querySelector('canvas')
    if (!canvas) return
    const link = document.createElement('a')
    link.download = `${subject.subject_code || 'invite'}-qr.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  function downloadSvg() {
    const svg = svgRef.current?.querySelector('svg')
    if (!svg) return
    const serialized = new XMLSerializer().serializeToString(svg)
    const blob = new Blob([serialized], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.download = `${subject.subject_code || 'invite'}-qr.svg`
    link.href = url
    link.click()
    URL.revokeObjectURL(url)
  }

  const canShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function'

  async function handleNativeShare() {
    if (!invite) return
    try {
      await navigator.share({
        title: `${subject.name} — Class Invite`,
        text: `Join ${subject.name} on Arguss Biometric Attendance! Code: ${invite.invite_code}`,
        url: invite.invite_url,
      })
    } catch {
      // User cancelled share dialog
    }
  }

  return (
    <Modal
      title="Access & Student Invite"
      description={`Share this QR badge or direct access code with students for ${subject.name}.`}
      onClose={onClose}
      width="max-w-md"
    >
      {invite ? (
        <div className="space-y-4 sm:space-y-5">
          {/* Native Mobile Share Button */}
          {canShare && (
            <button
              type="button"
              onClick={handleNativeShare}
              className="btn-cyan w-full py-2.5 text-xs font-semibold flex items-center justify-center gap-2 min-h-[42px] shadow-sm"
            >
              <Share2 size={15} />
              <span>Share via WhatsApp / Mobile Apps</span>
            </button>
          )}

          {/* QR Code Card with clean light surface for flawless scanning */}
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-border/80 bg-gradient-to-b from-[#111827] to-[#0A0F1D] p-4 sm:p-5 shadow-card">
            <div className="rounded-xl bg-white p-3 shadow-md" ref={canvasRef}>
              <QRCodeCanvas
                value={invite.invite_url}
                size={160}
                bgColor="#FFFFFF"
                fgColor="#090D15"
                level="M"
              />
            </div>
            
            <div ref={svgRef} className="hidden">
              <QRCodeSVG
                value={invite.invite_url}
                size={160}
                bgColor="#FFFFFF"
                fgColor="#090D15"
                level="M"
              />
            </div>

            <div className="flex gap-2 mt-1 w-full max-w-xs">
              <button
                onClick={downloadPng}
                className="btn-secondary flex-1 py-1.5 px-2.5 text-xs flex items-center justify-center gap-1.5 min-h-[36px]"
              >
                <Download size={12} />
                <span>PNG</span>
              </button>
              <button
                onClick={downloadSvg}
                className="btn-secondary flex-1 py-1.5 px-2.5 text-xs flex items-center justify-center gap-1.5 min-h-[36px]"
              >
                <Download size={12} />
                <span>SVG</span>
              </button>
            </div>
          </div>

          {/* 6-Character Invite Code */}
          <div>
            <p className="meta-label mb-1.5 text-cyan-400">Class Invite Code</p>
            <div className="flex items-center justify-between gap-2 rounded-xl border border-border/80 bg-subtle/80 px-3.5 py-2.5 sm:px-4 sm:py-3">
              <span className="font-mono text-xl sm:text-2xl font-bold tracking-[0.2em] sm:tracking-[0.25em] text-amber-400 truncate">
                {invite.invite_code}
              </span>
              <CopyButton value={invite.invite_code} label="Copy Code" />
            </div>
          </div>

          {/* Direct Enrollment Link */}
          <div>
            <p className="meta-label mb-1.5">Direct Registration Link</p>
            <div className="flex items-center justify-between gap-2 rounded-xl border border-border/80 bg-subtle/80 px-3 py-2 sm:px-3.5 sm:py-2.5 min-w-0">
              <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
                <Link2 size={14} className="text-muted flex-shrink-0" />
                <span className="truncate font-mono text-[11px] sm:text-xs text-muted select-all">
                  {invite.invite_url}
                </span>
              </div>
              <CopyButton value={invite.invite_url} label="Copy Link" />
            </div>
          </div>

          <div className="rounded-xl border border-border/60 bg-card/40 p-2.5 sm:p-3 text-center">
            <p className="text-[10px] sm:text-[11px] text-faint leading-relaxed">
              Students who scan this QR code or open the link will be prompted to verify their face and will be enrolled automatically.
            </p>
          </div>
        </div>
      ) : error ? (
        <div className="p-6 text-center space-y-3">
          <p className="text-xs text-red-400">{error}</p>
          <button onClick={loadInvite} className="btn-secondary py-1.5 px-4 text-xs">
            Try Again
          </button>
        </div>
      ) : (
        <div className="h-64 animate-pulse rounded-2xl bg-subtle/80 flex items-center justify-center text-xs text-muted">
          Generating cryptographic invite token…
        </div>
      )}
    </Modal>
  )
}
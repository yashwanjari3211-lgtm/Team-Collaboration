import { useState } from 'react'
import { X, Send, Copy, Check, Link2, AlertCircle } from 'lucide-react'
import { sendInvite } from '../../api/invites'

export default function InviteModal({ isOpen, onClose }) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('member')
  const [status, setStatus] = useState('idle') // idle | loading | success | error
  const [inviteLink, setInviteLink] = useState('')
  const [copied, setCopied] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  if (!isOpen) return null

  const handleSend = async (e) => {
    e.preventDefault()
    setStatus('loading')
    setErrorMsg('')
    try {
      const res = await sendInvite(email, role)
      const token = res.data.token
      const link = `${window.location.origin}/accept-invite?token=${token}`
      setInviteLink(link)
      setStatus('success')
    } catch (err) {
      console.error(err)
      const detail = err.response?.data?.detail || 'Failed to send invite. Please try again.'
      setErrorMsg(detail)
      setStatus('error')
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback
      const input = document.createElement('input')
      input.value = inviteLink
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleClose = () => {
    onClose()
    // Reset state after animation
    setTimeout(() => {
      setStatus('idle')
      setEmail('')
      setRole('member')
      setInviteLink('')
      setCopied(false)
      setErrorMsg('')
    }, 200)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-surface-900 rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-surface-200 dark:border-surface-800 animate-slide-in-up">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-surface-200 dark:border-surface-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center">
              <Link2 className="w-4 h-4 text-brand-500" />
            </div>
            <h2 className="font-semibold text-surface-900 dark:text-white">Invite People</h2>
          </div>
          <button onClick={handleClose} className="p-1.5 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-lg transition-colors">
            <X className="w-5 h-5 text-surface-500" />
          </button>
        </div>

        {status === 'success' ? (
          /* Success state — show invite link */
          <div className="p-5 space-y-4">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
              <Check className="w-5 h-5" />
              <p className="font-medium">Invite sent to {email}!</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                Share this invite link
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1 px-3 py-2.5 bg-surface-50 dark:bg-surface-950 border border-surface-300 dark:border-surface-700 rounded-lg text-sm text-surface-600 dark:text-surface-400 truncate font-mono">
                  {inviteLink}
                </div>
                <button
                  onClick={handleCopy}
                  className={`p-2.5 rounded-lg transition-all duration-200 flex-shrink-0 ${
                    copied
                      ? 'bg-emerald-500 text-white'
                      : 'bg-brand-500 hover:bg-brand-600 text-white'
                  }`}
                  title={copied ? 'Copied!' : 'Copy link'}
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="pt-2 flex justify-between items-center">
              <button
                onClick={() => {
                  setStatus('idle')
                  setEmail('')
                  setInviteLink('')
                }}
                className="text-sm text-brand-500 hover:text-brand-600 font-medium transition-colors"
              >
                Invite another
              </button>
              <button
                onClick={handleClose}
                className="px-4 py-2 bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700 text-surface-700 dark:text-surface-300 rounded-lg font-medium text-sm transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* Form state */
          <form onSubmit={handleSend} className="p-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 bg-surface-50 dark:bg-surface-950 border border-surface-300 dark:border-surface-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-surface-900 dark:text-white text-sm transition-all"
                placeholder="name@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2.5 bg-surface-50 dark:bg-surface-950 border border-surface-300 dark:border-surface-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-surface-900 dark:text-white text-sm transition-all"
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {/* Error message */}
            {status === 'error' && errorMsg && (
              <div className="flex items-start gap-2 p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-lg">
                <AlertCircle className="w-4 h-4 text-rose-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-rose-700 dark:text-rose-400">{errorMsg}</p>
              </div>
            )}

            <div className="pt-1 flex justify-end">
              <button
                type="submit"
                disabled={status === 'loading'}
                className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-lg flex items-center gap-2 font-medium text-sm disabled:opacity-50 transition-all shadow-sm shadow-brand-500/20"
              >
                {status === 'loading' ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    Send Invite
                    <Send className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

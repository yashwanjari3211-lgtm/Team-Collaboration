import { useState } from 'react'
import { X, Send } from 'lucide-react'
import { sendInvite } from '../../api/invites'

export default function InviteModal({ isOpen, onClose }) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('member')
  const [status, setStatus] = useState('idle')

  if (!isOpen) return null

  const handleSend = async (e) => {
    e.preventDefault()
    setStatus('loading')
    try {
      await sendInvite(email, role)
      setStatus('success')
      setTimeout(() => {
        onClose()
        setStatus('idle')
        setEmail('')
      }, 1500)
    } catch (err) {
      console.error(err)
      setStatus('error')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-surface-900 rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-surface-200 dark:border-surface-800">
          <h2 className="font-semibold text-surface-900 dark:text-white">Invite people</h2>
          <button onClick={onClose} className="p-1 hover:bg-surface-100 dark:hover:bg-surface-800 rounded">
            <X className="w-5 h-5 text-surface-500" />
          </button>
        </div>
        <form onSubmit={handleSend} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-surface-50 dark:bg-surface-950 border border-surface-300 dark:border-surface-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="name@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Role</label>
            <select 
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2 bg-surface-50 dark:bg-surface-950 border border-surface-300 dark:border-surface-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-surface-900 dark:text-white"
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          
          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={status === 'loading'}
              className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg flex items-center gap-2 font-medium disabled:opacity-50"
            >
              {status === 'loading' ? 'Sending...' : status === 'success' ? 'Sent!' : 'Send Invite'}
              {status === 'idle' && <Send className="w-4 h-4" />}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

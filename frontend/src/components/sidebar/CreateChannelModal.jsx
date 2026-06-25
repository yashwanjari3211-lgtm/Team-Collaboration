import { useState } from 'react'
import { X, Hash, Loader2 } from 'lucide-react'
import { createChannel } from '../../api/channels'
import { useDispatch } from 'react-redux'
import { addChannel, setActiveChannel } from '../../store/channelSlice'

export default function CreateChannelModal({ isOpen, onClose }) {
  const [name, setName] = useState('')
  const [status, setStatus] = useState('idle') // idle | loading | error
  const [errorMsg, setErrorMsg] = useState('')
  const dispatch = useDispatch()

  if (!isOpen) return null

  const handleCreate = async (e) => {
    e.preventDefault()
    const channelName = name.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    if (!channelName) return

    setStatus('loading')
    setErrorMsg('')
    try {
      const res = await createChannel(channelName)
      dispatch(addChannel(res.data))
      dispatch(setActiveChannel(res.data.id))
      onClose()
      setName('')
      setStatus('idle')
    } catch (err) {
      console.error(err)
      setErrorMsg(err.response?.data?.detail || 'Failed to create channel.')
      setStatus('error')
    }
  }

  const previewName = name.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || 'new-channel'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-surface-900 rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-surface-200 dark:border-surface-800 animate-slide-in-up">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-surface-200 dark:border-surface-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center">
              <Hash className="w-4 h-4 text-brand-500" />
            </div>
            <h2 className="font-semibold text-surface-900 dark:text-white">Create Channel</h2>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-lg transition-colors">
            <X className="w-5 h-5 text-surface-500" />
          </button>
        </div>

        <form onSubmit={handleCreate} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
              Channel Name
            </label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-surface-50 dark:bg-surface-950 border border-surface-300 dark:border-surface-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-surface-900 dark:text-white text-sm transition-all"
                placeholder="e.g. marketing, design-team"
                autoFocus
                required
              />
            </div>
            <p className="mt-1.5 text-xs text-surface-400">
              Preview: <span className="font-mono text-brand-400">#{previewName}</span>
            </p>
          </div>

          {/* Error */}
          {status === 'error' && errorMsg && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-lg">
              <p className="text-sm text-rose-700 dark:text-rose-400">{errorMsg}</p>
            </div>
          )}

          <div className="pt-1 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-medium text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || status === 'loading'}
              className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-lg font-medium text-sm disabled:opacity-50 transition-all shadow-sm shadow-brand-500/20 flex items-center gap-2"
            >
              {status === 'loading' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Channel'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { X, Search, Hash, MessageSquare, ArrowRight, Loader2, Send } from 'lucide-react'
import { useSelector } from 'react-redux'
import { getOrgMembers } from '../../api/organizations'
import { sendMessage } from '../../api/messages'
import Avatar from '../common/Avatar'
import client from '../../api/client'

export default function ForwardModal({ isOpen, onClose, message }) {
  const [search, setSearch] = useState('')
  const [members, setMembers] = useState([])
  const [forwardingTargetId, setForwardingTargetId] = useState(null) // target id (channel id or user id)
  const [forwardingTargetType, setForwardingTargetType] = useState(null) // 'channel' | 'user'
  const [status, setStatus] = useState('idle') // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState('')

  const channels = useSelector(state => state.channels.items)
  const currentUser = useSelector(state => state.auth.user)

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await getOrgMembers()
        const otherMembers = res.data.filter(m => m.id !== currentUser?.id)
        setMembers(otherMembers)
      } catch (err) {
        console.error('Failed to fetch org members for forward:', err)
      }
    }
    if (isOpen && currentUser) {
      fetchMembers()
    }
  }, [isOpen, currentUser])

  if (!isOpen || !message) return null

  const handleForward = async (target, type) => {
    setForwardingTargetId(target.id)
    setForwardingTargetType(type)
    setStatus('loading')
    setErrorMsg('')

    try {
      const author = message.user?.full_name || message.user?.email || 'User'
      // Build standard Slack/Discord-style blockquote for forwarding
      const forwardContent = `<blockquote><strong>Forwarded from ${author}:</strong><br/>${message.content}</blockquote>`

      let targetChannelId = null
      if (type === 'channel') {
        targetChannelId = target.id
      } else {
        // Direct Message: first fetch/create the DM channel
        const dmRes = await client.get(`/channels/dm/${target.id}`)
        targetChannelId = dmRes.data.id
      }

      await sendMessage(forwardContent, targetChannelId)
      setStatus('success')
      setTimeout(() => {
        onClose()
        setStatus('idle')
        setSearch('')
      }, 1000)
    } catch (err) {
      console.error('Failed to forward message:', err)
      setErrorMsg('Failed to forward message.')
      setStatus('error')
    }
  }

  // Filter lists based on search
  const filteredChannels = channels.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase())
  )
  const filteredMembers = members.filter(m => 
    (m.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
    m.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-surface-900 rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-surface-200 dark:border-surface-800 animate-slide-in-up">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-surface-200 dark:border-surface-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center">
              <ArrowRight className="w-4 h-4 text-brand-500" />
            </div>
            <h2 className="font-semibold text-surface-900 dark:text-white">Forward Message</h2>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-lg transition-colors">
            <X className="w-5 h-5 text-surface-500" />
          </button>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-900/50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-450" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white dark:bg-surface-950 border border-surface-300 dark:border-surface-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-surface-900 dark:text-white text-sm transition-all"
              placeholder="Search channels or members..."
              autoFocus
            />
          </div>
        </div>

        {/* List of Targets */}
        <div className="max-h-[300px] overflow-y-auto divide-y divide-surface-100 dark:divide-surface-800">
          {status === 'success' && (
            <div className="flex flex-col items-center justify-center p-8 space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                ✓
              </div>
              <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Message Forwarded!</p>
            </div>
          )}

          {status !== 'success' && (
            <>
              {/* Channels Section */}
              {filteredChannels.length > 0 && (
                <div className="p-2">
                  <div className="px-3 py-1.5 text-[10px] font-semibold text-surface-400 uppercase tracking-wider">
                    Channels
                  </div>
                  <div className="space-y-0.5">
                    {filteredChannels.map(c => {
                      const isLoading = status === 'loading' && forwardingTargetId === c.id && forwardingTargetType === 'channel'
                      return (
                        <button
                          key={c.id}
                          onClick={() => handleForward(c, 'channel')}
                          disabled={status === 'loading'}
                          className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-surface-50 dark:hover:bg-surface-800 text-left transition-colors"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <Hash className="w-4 h-4 text-surface-400 flex-shrink-0" />
                            <span className="text-[13px] font-medium text-surface-850 dark:text-surface-200 truncate">{c.name}</span>
                          </div>
                          {isLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin text-brand-500" />
                          ) : (
                            <Send className="w-3.5 h-3.5 text-surface-400 hover:text-brand-500 transition-colors" />
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Members Section */}
              {filteredMembers.length > 0 && (
                <div className="p-2">
                  <div className="px-3 py-1.5 text-[10px] font-semibold text-surface-400 uppercase tracking-wider">
                    Members
                  </div>
                  <div className="space-y-0.5">
                    {filteredMembers.map(m => {
                      const isLoading = status === 'loading' && forwardingTargetId === m.id && forwardingTargetType === 'user'
                      return (
                        <button
                          key={m.id}
                          onClick={() => handleForward(m, 'user')}
                          disabled={status === 'loading'}
                          className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-surface-50 dark:hover:bg-surface-800 text-left transition-colors"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <Avatar name={m.full_name || m.email} src={m.avatar} size="xs" />
                            <span className="text-[13px] font-medium text-surface-850 dark:text-surface-200 truncate">
                              {m.full_name || m.email}
                            </span>
                          </div>
                          {isLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin text-brand-500" />
                          ) : (
                            <Send className="w-3.5 h-3.5 text-surface-400 hover:text-brand-500 transition-colors" />
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Empty state */}
              {filteredChannels.length === 0 && filteredMembers.length === 0 && (
                <p className="p-6 text-center text-sm text-surface-450 italic">No matches found</p>
              )}
            </>
          )}
        </div>

        {/* Error */}
        {status === 'error' && errorMsg && (
          <div className="p-3 m-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-lg">
            <p className="text-sm text-rose-700 dark:text-rose-400">{errorMsg}</p>
          </div>
        )}
      </div>
    </div>
  )
}

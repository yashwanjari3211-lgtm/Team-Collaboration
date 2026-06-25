import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { getOrgMembers } from '../../api/organizations'
import { useCall } from './CallContext'
import { X, Phone, Video, Check } from 'lucide-react'
import Avatar from '../common/Avatar'

export default function CallInitiateModal({ isOpen, onClose, defaultCallType = 'audio' }) {
  const { initiateCall } = useCall()
  const user = useSelector(state => state.auth.user)
  const [members, setMembers] = useState([])
  const [selectedIds, setSelectedIds] = useState([])
  const [callType, setCallType] = useState(defaultCallType)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isOpen) return
    setCallType(defaultCallType)
    setSelectedIds([])
    const fetchMembers = async () => {
      setLoading(true)
      try {
        const res = await getOrgMembers()
        // Exclude current user
        setMembers(res.data.filter(m => m.id !== user?.id))
      } catch (err) {
        console.error('Failed to fetch members:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchMembers()
  }, [isOpen, user, defaultCallType])

  if (!isOpen) return null

  const toggleMember = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const selectAll = () => {
    if (selectedIds.length === members.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(members.map(m => m.id))
    }
  }

  const handleStartCall = () => {
    if (selectedIds.length === 0) return
    initiateCall(callType, selectedIds)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-surface-900 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-surface-200 dark:border-surface-800 animate-slide-in-up">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-surface-200 dark:border-surface-800">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              callType === 'video' ? 'bg-violet-500/10' : 'bg-emerald-500/10'
            }`}>
              {callType === 'video' 
                ? <Video className="w-4 h-4 text-violet-500" />
                : <Phone className="w-4 h-4 text-emerald-500" />
              }
            </div>
            <h2 className="font-semibold text-surface-900 dark:text-white">
              Start {callType === 'video' ? 'Video' : 'Voice'} Call
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-lg transition-colors">
            <X className="w-5 h-5 text-surface-500" />
          </button>
        </div>

        {/* Call type toggle */}
        <div className="px-4 pt-4 pb-2">
          <div className="flex gap-2 p-1 bg-surface-100 dark:bg-surface-950 rounded-xl">
            <button
              onClick={() => setCallType('audio')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
                callType === 'audio'
                  ? 'bg-white dark:bg-surface-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'
              }`}
            >
              <Phone className="w-4 h-4" /> Voice
            </button>
            <button
              onClick={() => setCallType('video')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
                callType === 'video'
                  ? 'bg-white dark:bg-surface-800 text-violet-600 dark:text-violet-400 shadow-sm'
                  : 'text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'
              }`}
            >
              <Video className="w-4 h-4" /> Video
            </button>
          </div>
        </div>

        {/* Members list */}
        <div className="px-4 py-2">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-surface-400">
              Select who to ring ({selectedIds.length}/{members.length})
            </p>
            <button
              onClick={selectAll}
              className="text-[11px] text-brand-500 hover:text-brand-600 font-medium transition-colors"
            >
              {selectedIds.length === members.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>

          <div className="max-h-[240px] overflow-y-auto space-y-1 -mx-1 px-1">
            {loading ? (
              <div className="py-8 text-center text-surface-400 text-sm">Loading members...</div>
            ) : members.length === 0 ? (
              <div className="py-8 text-center text-surface-400 text-sm">No other members in this organization</div>
            ) : (
              members.map(member => {
                const isSelected = selectedIds.includes(member.id)
                return (
                  <button
                    key={member.id}
                    onClick={() => toggleMember(member.id)}
                    className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-all ${
                      isSelected
                        ? 'bg-brand-50 dark:bg-brand-950/30 border border-brand-200 dark:border-brand-800'
                        : 'border border-transparent hover:bg-surface-50 dark:hover:bg-surface-800'
                    }`}
                  >
                    <Avatar name={member.full_name || member.email} src={member.avatar} size="sm" />
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-sm font-medium text-surface-900 dark:text-white truncate">
                        {member.full_name || member.email}
                      </p>
                      {member.full_name && (
                        <p className="text-[11px] text-surface-400 truncate">{member.email}</p>
                      )}
                    </div>
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-brand-500 border-brand-500'
                        : 'border-surface-300 dark:border-surface-600'
                    }`}>
                      {isSelected && <Check className="w-3 h-3 text-white" />}
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-surface-200 dark:border-surface-800">
          <button
            onClick={handleStartCall}
            disabled={selectedIds.length === 0}
            className={`w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
              selectedIds.length > 0
                ? callType === 'video'
                  ? 'bg-violet-500 hover:bg-violet-600 text-white shadow-lg shadow-violet-500/30'
                  : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/30'
                : 'bg-surface-200 dark:bg-surface-800 text-surface-400 cursor-not-allowed'
            }`}
          >
            {callType === 'video' ? <Video className="w-5 h-5" /> : <Phone className="w-5 h-5" />}
            {selectedIds.length > 0
              ? `Start ${callType === 'video' ? 'Video' : 'Voice'} Call (${selectedIds.length})`
              : 'Select members to call'}
          </button>
        </div>
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { toggleTaskPanel, setCommandPaletteOpen } from '../../store/uiSlice'
import { Hash, Search, PanelRight, Phone, Video } from 'lucide-react'
import CallInitiateModal from '../call/CallInitiateModal'
import { getOrgMembers } from '../../api/organizations'
import Avatar from '../common/Avatar'

export default function ChatHeader({ channelName }) {
  const dispatch = useDispatch()
  const taskPanelOpen = useSelector(state => state.ui.taskPanelOpen)
  const [callModalOpen, setCallModalOpen] = useState(false)
  const [defaultCallType, setDefaultCallType] = useState('audio')
  const [members, setMembers] = useState([])
  const activeDmUser = useSelector(state => state.channels.activeDmUser)

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await getOrgMembers()
        setMembers(res.data)
      } catch (err) {
        console.error('Failed to fetch org members for header:', err)
      }
    }
    if (localStorage.getItem('activeOrganizationId')) {
      fetchMembers()
    }
  }, [])

  const openCallModal = (type) => {
    setDefaultCallType(type)
    setCallModalOpen(true)
  }

  return (
    <>
      <header className="h-14 flex items-center justify-between px-4 border-b border-surface-100 dark:border-surface-800 bg-white/80 dark:bg-surface-950/80 backdrop-blur-md sticky top-0 z-10 flex-shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          {activeDmUser ? (
            <Avatar name={activeDmUser.full_name || activeDmUser.email} src={activeDmUser.avatar} size="sm" className="flex-shrink-0" />
          ) : (
            <Hash className="w-5 h-5 text-surface-400 flex-shrink-0" strokeWidth={2} />
          )}
          <h2 className="text-[15px] font-semibold text-surface-900 dark:text-white truncate">
            {channelName || 'general'}
          </h2>
          {!activeDmUser && (
            <span className="hidden sm:block text-xs text-surface-400 truncate ml-2 border-l border-surface-200 dark:border-surface-700 pl-2">
              Team discussions and updates
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {/* Member avatars stack */}
          <div className="hidden md:flex items-center mr-2">
            <div className="flex -space-x-2">
              {members.slice(0, 3).map((member) => (
                <div key={member.id} className="w-6 h-6 rounded-full overflow-hidden flex items-center justify-center ring-2 ring-white dark:ring-surface-950">
                  <Avatar name={member.full_name || member.email} src={member.avatar} size="xs" />
                </div>
              ))}
            </div>
            {members.length > 0 && (
              <span className="ml-2 text-xs text-surface-400">{members.length}</span>
            )}
          </div>

          {/* Voice call */}
          <button
            onClick={() => openCallModal('audio')}
            className="p-2 rounded-lg hover-surface text-surface-400 hover:text-emerald-500 transition-colors"
            title="Voice Call"
          >
            <Phone className="w-4 h-4" />
          </button>

          {/* Video call */}
          <button
            onClick={() => openCallModal('video')}
            className="p-2 rounded-lg hover-surface text-surface-400 hover:text-violet-500 transition-colors"
            title="Video Call"
          >
            <Video className="w-4 h-4" />
          </button>

          {/* Search */}
          <button
            onClick={() => dispatch(setCommandPaletteOpen(true))}
            className="p-2 rounded-lg hover-surface text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 transition-colors"
            title="Search (Ctrl+K)"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Toggle task panel */}
          <button
            onClick={() => dispatch(toggleTaskPanel())}
            className={`p-2 rounded-lg transition-colors ${
              taskPanelOpen
                ? 'bg-brand-50 dark:bg-brand-950/50 text-brand-600 dark:text-brand-400'
                : 'hover-surface text-surface-400 hover:text-surface-600 dark:hover:text-surface-300'
            }`}
            title="Toggle task panel"
          >
            <PanelRight className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Call Initiate Modal */}
      <CallInitiateModal
        isOpen={callModalOpen}
        onClose={() => setCallModalOpen(false)}
        defaultCallType={defaultCallType}
      />
    </>
  )
}

import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { toggleTaskPanel, setCommandPaletteOpen } from '../../store/uiSlice'
import { Hash, Search, PanelRight, Phone, Video } from 'lucide-react'
import CallInitiateModal from '../call/CallInitiateModal'

export default function ChatHeader({ channelName }) {
  const dispatch = useDispatch()
  const taskPanelOpen = useSelector(state => state.ui.taskPanelOpen)
  const [callModalOpen, setCallModalOpen] = useState(false)
  const [defaultCallType, setDefaultCallType] = useState('audio')

  const openCallModal = (type) => {
    setDefaultCallType(type)
    setCallModalOpen(true)
  }

  return (
    <>
      <header className="h-14 flex items-center justify-between px-4 border-b border-surface-100 dark:border-surface-800 bg-white/80 dark:bg-surface-950/80 backdrop-blur-md sticky top-0 z-10 flex-shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <Hash className="w-5 h-5 text-surface-400 flex-shrink-0" strokeWidth={2} />
          <h2 className="text-[15px] font-semibold text-surface-900 dark:text-white truncate">
            {channelName || 'general'}
          </h2>
          <span className="hidden sm:block text-xs text-surface-400 truncate ml-2 border-l border-surface-200 dark:border-surface-700 pl-2">
            Team discussions and updates
          </span>
        </div>

        <div className="flex items-center gap-1">
          {/* Member avatars stack (mock) */}
          <div className="hidden md:flex items-center mr-2">
            <div className="flex -space-x-2">
              {['A', 'B', 'C'].map((l, i) => (
                <div key={i} className="w-6 h-6 rounded-full bg-surface-200 dark:bg-surface-700 flex items-center justify-center text-[10px] font-medium text-surface-500 dark:text-surface-300 ring-2 ring-white dark:ring-surface-950">
                  {l}
                </div>
              ))}
            </div>
            <span className="ml-2 text-xs text-surface-400">3</span>
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

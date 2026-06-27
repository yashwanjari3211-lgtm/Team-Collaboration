import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setActiveChannel } from '../../store/channelSlice'
import { setFilter } from '../../store/messageSlice'
import { Hash, Plus } from 'lucide-react'
import CreateChannelModal from './CreateChannelModal'

// Mock unread messages count for demo presentation
const MOCK_UNREADS = {
  2: 4,
  3: 12,
}

export default function ChannelList({ collapsed }) {
  const dispatch = useDispatch()
  const channels = useSelector(state => state.channels.items)
  const activeId = useSelector(state => state.channels.activeId)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  if (collapsed) {
    return (
      <div className="flex flex-col items-center gap-2 py-2">
        <button 
          onClick={() => {
            if (channels.length > 0) {
              dispatch(setActiveChannel(channels[0].id));
            }
          }}
          className="p-2 rounded-lg hover-surface text-surface-500 hover:text-surface-600 transition-colors" 
          title="Channels"
        >
          <Hash className="w-5 h-5" />
        </button>
      </div>
    )
  }

  return (
    <div>
      {!collapsed && (
        <div className="flex items-center justify-between px-3 py-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-surface-400">
            Channels
          </span>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="p-1 rounded hover-surface text-surface-400 hover:text-surface-600 dark:hover:text-surface-200 transition-colors"
            title="New channel"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <div className="space-y-0.5">
        {channels.map(channel => {
          const isActive = channel.id === activeId
          const unreadCount = !isActive ? MOCK_UNREADS[channel.id] : null

          return (
            <button
              key={channel.id}
              onClick={() => {
                dispatch(setActiveChannel(channel.id))
                dispatch(setFilter('all'))
              }}
              className={`w-full flex items-center gap-2.5 rounded-lg transition-colors duration-100 ${
                collapsed ? 'justify-center p-2.5' : 'px-3 py-1.5'
              } ${
                isActive
                  ? 'active-surface font-semibold text-brand-300'
                  : 'hover-surface text-surface-400 font-medium'
              }`}
              title={collapsed ? `#${channel.name}` : undefined}
            >
              <Hash
                className={`w-[16px] h-[16px] flex-shrink-0 ${
                  isActive ? 'text-brand-500' : 'text-surface-400'
                }`}
                strokeWidth={2}
              />
              {!collapsed && (
                <>
                  <span className="text-[13px] truncate flex-1 text-left">
                    {channel.name}
                  </span>
                  {unreadCount && (
                    <span className="ml-auto bg-brand-500 text-white text-[10px] font-semibold min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1 shadow-sm shadow-brand-500/30">
                      {unreadCount}
                    </span>
                  )}
                </>
              )}
            </button>
          )
        })}

        {channels.length === 0 && !collapsed && (
          <p className="px-3 py-2 text-xs text-surface-400">No channels yet</p>
        )}
      </div>

      {/* Create Channel Modal */}
      <CreateChannelModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
    </div>
  )
}

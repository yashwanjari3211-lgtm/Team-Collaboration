import { useSelector, useDispatch } from 'react-redux'
import { setActiveChannel } from '../../store/channelSlice'
import { Hash, Plus } from 'lucide-react'
import Badge from '../common/Badge'

export default function ChannelList({ collapsed }) {
  const dispatch = useDispatch()
  const channels = useSelector(state => state.channels.items)
  const activeId = useSelector(state => state.channels.activeId)

  return (
    <div>
      {!collapsed && (
        <div className="flex items-center justify-between px-3 py-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-surface-400">
            Channels
          </span>
          <button className="p-1 rounded hover-surface text-surface-400 hover:text-surface-600 dark:hover:text-surface-200 transition-colors">
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <div className="space-y-0.5">
        {channels.map(channel => {
          const isActive = channel.id === activeId

          return (
            <button
              key={channel.id}
              onClick={() => dispatch(setActiveChannel(channel.id))}
              className={`w-full flex items-center gap-2.5 rounded-lg transition-all duration-150 ${
                collapsed ? 'justify-center p-2.5' : 'px-3 py-1.5'
              } ${
                isActive
                  ? 'active-surface'
                  : 'hover-surface text-surface-600 dark:text-surface-400'
              }`}
              title={collapsed ? `#${channel.name}` : undefined}
            >
              <Hash className={`w-[16px] h-[16px] flex-shrink-0 ${
                isActive ? 'text-brand-500' : 'text-surface-400'
              }`} strokeWidth={2} />
              {!collapsed && (
                <>
                  <span className={`text-[13px] truncate flex-1 text-left ${
                    isActive ? 'font-semibold' : 'font-medium'
                  }`}>
                    {channel.name}
                  </span>
                  {/* Badge for unread (mock) */}
                </>
              )}
            </button>
          )
        })}

        {channels.length === 0 && !collapsed && (
          <p className="px-3 py-2 text-xs text-surface-400">No channels yet</p>
        )}
      </div>
    </div>
  )
}

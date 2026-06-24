import { useSelector, useDispatch } from 'react-redux'
import { toggleSidebar } from '../../store/uiSlice'
import WorkspaceSwitcher from './WorkspaceSwitcher'
import ChannelList from './ChannelList'
import UserProfile from './UserProfile'
import Avatar from '../common/Avatar'
import { AtSign, Bookmark, MessageSquare, PanelLeftClose, PanelLeft, Plus } from 'lucide-react'

const NAV_ITEMS = [
  { icon: AtSign, label: 'Mentions & Reactions', id: 'mentions' },
  { icon: Bookmark, label: 'Saved Items', id: 'saved' },
  { icon: MessageSquare, label: 'Direct Messages', id: 'dms' },
]

const MOCK_DMS = [
  { id: 1, name: 'Sarah Connor', presence: 'online' },
  { id: 2, name: 'John Doe', presence: 'away' },
  { id: 3, name: 'Alice Vance', presence: 'offline' },
]

export default function Sidebar() {
  const dispatch = useDispatch()
  const collapsed = useSelector(state => state.ui.sidebarCollapsed)

  return (
    <aside
      className={`flex flex-col bg-white dark:bg-surface-900 border-r border-surface-200 dark:border-surface-800 transition-all duration-300 ease-in-out ${
        collapsed ? 'w-[72px]' : 'w-[280px]'
      }`}
    >
      {/* Workspace header */}
      <WorkspaceSwitcher collapsed={collapsed} />

      {/* Collapse toggle */}
      <div className={`px-3 py-1 ${collapsed ? 'flex justify-center' : ''}`}>
        <button
          onClick={() => dispatch(toggleSidebar())}
          className="p-1.5 rounded-lg hover-surface text-surface-500 dark:text-surface-400 transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation section */}
      <nav className="flex-1 overflow-y-auto px-2 py-1 space-y-0.5">
        {/* Quick nav items */}
        {NAV_ITEMS.map(item => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              className={`w-full flex items-center gap-3 rounded-lg hover-surface transition-colors ${
                collapsed ? 'justify-center p-2.5' : 'px-3 py-2'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="w-[18px] h-[18px] text-surface-500 dark:text-surface-400 flex-shrink-0" strokeWidth={1.8} />
              {!collapsed && (
                <span className="text-[13px] font-medium text-surface-600 dark:text-surface-300 truncate">{item.label}</span>
              )}
            </button>
          )
        })}

        {/* Divider */}
        <div className="!my-3 border-t border-surface-100 dark:border-surface-800" />

        {/* Channels */}
        <ChannelList collapsed={collapsed} />

        {/* Divider */}
        <div className="!my-3 border-t border-surface-100 dark:border-surface-800" />

        {/* Direct Messages */}
        <div className="space-y-1">
          {!collapsed && (
            <div className="flex items-center justify-between px-3 py-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-surface-400">
                Direct Messages
              </span>
              <button className="p-1 rounded hover-surface text-surface-400 hover:text-surface-600 dark:hover:text-surface-200 transition-colors" title="Start DM">
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <div className="space-y-0.5">
            {MOCK_DMS.map(dm => {
              const presenceColor =
                dm.presence === 'online'
                  ? 'bg-[#10B981]'
                  : dm.presence === 'away'
                  ? 'bg-[#F59E0B]'
                  : 'bg-[#6B7280]'

              return (
                <button
                  key={dm.id}
                  className={`w-full flex items-center gap-2.5 rounded-lg hover-surface text-surface-650 dark:text-surface-400 transition-colors ${
                    collapsed ? 'justify-center p-2' : 'px-3 py-1.5'
                  }`}
                  title={collapsed ? dm.name : undefined}
                >
                  <div className="relative flex-shrink-0">
                    <Avatar name={dm.name} size="xs" />
                    <span
                      className={`absolute bottom-0 right-0 w-2 h-2 rounded-full border-2 border-white dark:border-surface-900 ${presenceColor}`}
                    />
                  </div>
                  {!collapsed && (
                    <span className="text-[13px] font-medium text-left truncate flex-1">{dm.name}</span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </nav>

      {/* User profile at bottom */}
      <UserProfile collapsed={collapsed} />
    </aside>
  )
}

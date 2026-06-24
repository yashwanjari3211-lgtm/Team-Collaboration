import { useSelector, useDispatch } from 'react-redux'
import { toggleSidebar } from '../../store/uiSlice'
import WorkspaceSwitcher from './WorkspaceSwitcher'
import ChannelList from './ChannelList'
import UserProfile from './UserProfile'
import { AtSign, Bookmark, MessageSquare, PanelLeftClose, PanelLeft } from 'lucide-react'

const NAV_ITEMS = [
  { icon: AtSign, label: 'Mentions & Reactions', id: 'mentions' },
  { icon: Bookmark, label: 'Saved Items', id: 'saved' },
  { icon: MessageSquare, label: 'Direct Messages', id: 'dms' },
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
      </nav>

      {/* User profile at bottom */}
      <UserProfile collapsed={collapsed} />
    </aside>
  )
}

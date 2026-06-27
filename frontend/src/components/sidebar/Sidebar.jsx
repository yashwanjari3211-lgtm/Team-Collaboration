import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { toggleSidebar } from '../../store/uiSlice'
import { setActiveDm } from '../../store/channelSlice'
import { setFilter } from '../../store/messageSlice'
import { setActiveBoard } from '../../store/boardSlice'
import WorkspaceSwitcher from './WorkspaceSwitcher'
import ChannelList from './ChannelList'
import BoardsList from './BoardsList'
import UserProfile from './UserProfile'
import Avatar from '../common/Avatar'
import { AtSign, Bookmark, MessageSquare, PanelLeftClose, PanelLeft, Plus } from 'lucide-react'
import { getOrgMembers } from '../../api/organizations'

const NAV_ITEMS = [
  { icon: AtSign, label: 'Mentions & Reactions', id: 'mentions' },
  { icon: Bookmark, label: 'Saved Items', id: 'saved' },
  { icon: MessageSquare, label: 'Direct Messages', id: 'dms' },
]

export default function Sidebar() {
  const dispatch = useDispatch()
  const collapsed = useSelector(state => state.ui.sidebarCollapsed)
  const currentUser = useSelector(state => state.auth.user)
  const activeDmUserId = useSelector(state => state.channels.activeDmUserId)
  const messageFilter = useSelector(state => state.messages.filter || 'all')
  const [members, setMembers] = useState([])

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await getOrgMembers()
        // Filter out current user
        const otherMembers = res.data.filter(m => m.id !== currentUser?.id)
        setMembers(otherMembers)
      } catch (err) {
        console.error('Failed to fetch members:', err)
      }
    }
    
    // Only fetch if we have an active org
    if (localStorage.getItem('activeOrganizationId')) {
      fetchMembers()
    }
  }, [currentUser])

  return (
    <aside
      className={`flex flex-col bg-white dark:bg-surface-900 border-r border-surface-200 dark:border-surface-800 transition-all duration-300 ease-in-out ${
        collapsed ? 'w-[72px]' : 'w-[280px]'
      }`}
    >
      {/* Workspace header */}
      <WorkspaceSwitcher collapsed={collapsed} />

      {/* Collapse toggle */}
      <div className={`shrink-0 px-3 py-1 ${collapsed ? 'flex justify-center' : ''}`}>
        <button
          onClick={() => dispatch(toggleSidebar())}
          className="p-1.5 rounded-lg hover-surface text-surface-500 dark:text-surface-400 transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation section */}
      <nav className="flex-1 min-h-0 overflow-y-auto px-2 py-1 space-y-0.5">
        {/* Quick nav items */}
        {NAV_ITEMS.map(item => {
          const Icon = item.icon
          const isActive = messageFilter === item.id
          return (
            <button
              key={item.id}
              onClick={() => {
                dispatch(setFilter(item.id))
                dispatch(setActiveBoard(null)) // Reset board to show ChatPanel
              }}
              className={`w-full flex items-center gap-3 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 font-semibold' 
                  : 'hover-surface text-surface-600 dark:text-surface-400'
              } ${
                collapsed ? 'justify-center p-2.5' : 'px-3 py-2'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon className={`w-[18px] h-[18px] flex-shrink-0 ${isActive ? 'text-brand-500' : 'text-surface-500 dark:text-surface-400'}`} strokeWidth={1.8} />
              {!collapsed && (
                <span className="text-[13px] font-medium truncate">{item.label}</span>
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

        {/* Boards */}
        <BoardsList collapsed={collapsed} />

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
            {members.map(member => {
              // Mock presence for now, can be wired to real presence later
              const presence = 'online'
              const presenceColor =
                presence === 'online'
                  ? 'bg-[#10B981]'
                  : presence === 'away'
                  ? 'bg-[#F59E0B]'
                  : 'bg-[#6B7280]'

              return (
                  <button
                    key={member.id}
                    onClick={() => {
                      dispatch(setActiveDm({ userId: member.id, user: member }))
                      dispatch(setFilter('all'))
                    }}
                    className={`w-full flex items-center gap-2.5 rounded-lg hover-surface transition-colors ${
                      activeDmUserId === member.id ? 'bg-surface-100 dark:bg-surface-800 text-brand-600 dark:text-brand-400' : 'text-surface-650 dark:text-surface-400'
                    } ${
                      collapsed ? 'justify-center p-2' : 'px-3 py-1.5'
                    }`}
                    title={collapsed ? member.full_name || member.email : undefined}
                  >
                  <div className="relative flex-shrink-0">
                    <Avatar name={member.full_name || member.email} src={member.avatar} size="xs" />
                    <span
                      className={`absolute bottom-0 right-0 w-2 h-2 rounded-full border-2 border-white dark:border-surface-900 ${presenceColor}`}
                    />
                  </div>
                  {!collapsed && (
                    <span className="text-[13px] font-medium text-left truncate flex-1">{member.full_name || member.email}</span>
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

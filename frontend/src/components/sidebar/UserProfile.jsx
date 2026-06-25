import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '../../store/authSlice'
import { useNavigate } from 'react-router-dom'
import { Settings, LogOut } from 'lucide-react'
import Avatar from '../common/Avatar'
import UserSettingsModal from './UserSettingsModal'

export default function UserProfile({ collapsed }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const user = useSelector(state => state.auth.user)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  const displayName = user?.full_name || user?.email || 'User'

  return (
    <div className={`border-t border-surface-100 dark:border-surface-800 ${
      collapsed ? 'p-2 flex flex-col items-center gap-2' : 'p-3'
    }`}>
      <div className={`flex items-center ${collapsed ? 'flex-col gap-2' : 'gap-3'}`}>
        <Avatar name={displayName} src={user?.avatar} size="sm" presence="online" />

        {!collapsed && (
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-surface-800 dark:text-surface-200 truncate">
              {displayName}
            </p>
            <p className="text-[11px] text-surface-400 truncate">{user?.email || ''}</p>
          </div>
        )}

        {!collapsed && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-1.5 rounded-lg hover-surface text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 transition-colors"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg hover-surface text-surface-400 hover:text-rose-500 transition-colors"
              title="Log out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {collapsed && (
        <button
          onClick={handleLogout}
          className="p-1.5 rounded-lg hover-surface text-surface-400 hover:text-rose-500 transition-colors"
          title="Log out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      )}

      {/* Settings Modal */}
      <UserSettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  )
}

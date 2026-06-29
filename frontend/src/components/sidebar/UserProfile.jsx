import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { logout, setCredentials } from '../../store/authSlice'
import { useNavigate } from 'react-router-dom'
import { Settings, LogOut, CreditCard } from 'lucide-react'
import Avatar from '../common/Avatar'
import UserSettingsModal from './UserSettingsModal'
import client from '../../api/client'

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

  const changeStatus = async (newStatus) => {
    try {
      const res = await client.patch('/users/me', { status: newStatus })
      dispatch(setCredentials({
        token: localStorage.getItem('token'),
        user: res.data
      }))
    } catch (err) {
      console.error('Failed to update status:', err)
    }
  }

  return (
    <div className={`shrink-0 border-t border-surface-100 dark:border-surface-800 ${
      collapsed ? 'p-2 flex flex-col items-center gap-2' : 'p-3'
    }`}>
      <div className={`flex items-center ${collapsed ? 'flex-col gap-2' : 'gap-3'}`}>
        <Avatar name={displayName} src={user?.avatar} size="sm" presence={user?.status || 'online'} />

        {!collapsed && (
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-surface-800 dark:text-white truncate">
              {displayName}
            </p>
            <select
              value={user?.status || 'online'}
              onChange={(e) => changeStatus(e.target.value)}
              className="mt-0.5 text-[11px] bg-transparent text-surface-450 dark:text-surface-400 focus:outline-none border-none cursor-pointer p-0 font-medium"
            >
              <option value="online" className="bg-surface-50 dark:bg-surface-900 text-surface-900 dark:text-white">🟢 Active</option>
              <option value="away" className="bg-surface-50 dark:bg-surface-900 text-surface-900 dark:text-white">🟡 Away</option>
              <option value="busy" className="bg-surface-50 dark:bg-surface-900 text-surface-900 dark:text-white">🔴 Busy</option>
              <option value="offline" className="bg-surface-50 dark:bg-surface-900 text-surface-900 dark:text-white">⚫ Offline</option>
            </select>
          </div>
        )}

        {!collapsed && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => navigate('/billing')}
              className="p-1.5 rounded-lg hover-surface text-surface-400 hover:text-brand-400 transition-colors"
              title="Billing"
            >
              <CreditCard className="w-4 h-4" />
            </button>
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
        <>
          <button
            onClick={() => navigate('/billing')}
            className="p-1.5 rounded-lg hover-surface text-surface-400 hover:text-brand-400 transition-colors"
            title="Billing"
          >
            <CreditCard className="w-4 h-4" />
          </button>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg hover-surface text-surface-400 hover:text-rose-500 transition-colors"
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </>
      )}

      {/* Settings Modal */}
      <UserSettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  )
}

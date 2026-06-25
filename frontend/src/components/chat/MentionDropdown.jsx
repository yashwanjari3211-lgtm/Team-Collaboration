import { useEffect, useRef } from 'react'
import Avatar from '../common/Avatar'

export default function MentionDropdown({ isOpen, users, filter, onSelect, onClose, position }) {
  const dropdownRef = useRef(null)

  useEffect(() => {
    if (!isOpen) return
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [isOpen, onClose])

  if (!isOpen || !users || users.length === 0) return null

  // Filter users based on query after @
  const filtered = users.filter(u => {
    const q = (filter || '').toLowerCase()
    const name = (u.full_name || '').toLowerCase()
    const email = (u.email || '').toLowerCase()
    return name.includes(q) || email.includes(q)
  }).slice(0, 8)

  if (filtered.length === 0) return null

  return (
    <div
      ref={dropdownRef}
      className="absolute bottom-full left-0 mb-1 w-72 bg-white dark:bg-surface-900 rounded-xl shadow-2xl border border-surface-200 dark:border-surface-700 overflow-hidden z-50 animate-slide-in-up"
      style={position ? { left: position.x, bottom: position.y } : {}}
    >
      <div className="px-3 py-2 border-b border-surface-200 dark:border-surface-800">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-surface-400">
          Members matching "{filter}"
        </p>
      </div>
      <div className="max-h-[200px] overflow-y-auto py-1">
        {filtered.map(user => (
          <button
            key={user.id}
            onClick={() => onSelect(user)}
            className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors text-left"
          >
            <Avatar name={user.full_name || user.email} src={user.avatar} size="xs" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-surface-900 dark:text-white truncate">
                {user.full_name || user.email}
              </p>
              {user.full_name && (
                <p className="text-[11px] text-surface-400 truncate">{user.email}</p>
              )}
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-100 dark:bg-surface-800 text-surface-500 font-medium">
              {user.role}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

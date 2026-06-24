import { useState } from 'react'
import { useSelector } from 'react-redux'
import Avatar from '../common/Avatar'
import { SmilePlus, Reply, Forward, ListTodo } from 'lucide-react'

function formatTime(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function MessageBubble({ message, isOwn, userName, onConvertToTask }) {
  const [showActions, setShowActions] = useState(false)

  return (
    <div
      className={`group flex gap-3 px-4 py-1.5 transition-colors hover:bg-surface-50 dark:hover:bg-surface-900/50 relative ${
        isOwn ? 'flex-row-reverse' : ''
      }`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <Avatar name={userName} size="sm" className="mt-0.5 flex-shrink-0" />

      <div className={`flex flex-col max-w-[70%] min-w-0 ${isOwn ? 'items-end' : 'items-start'}`}>
        <div className="flex items-center gap-2 mb-0.5">
          <span className={`text-[13px] font-semibold ${
            isOwn ? 'text-brand-600 dark:text-brand-400' : 'text-surface-800 dark:text-surface-200'
          }`}>
            {userName}
          </span>
          <span className="text-[11px] text-surface-400">{formatTime(message.created_at)}</span>
        </div>

        <div className={`rounded-2xl px-3.5 py-2 text-[13.5px] leading-relaxed ${
          isOwn
            ? 'bg-brand-500 text-white rounded-tr-md'
            : 'bg-surface-100 dark:bg-surface-800 text-surface-800 dark:text-surface-200 rounded-tl-md'
        }`}>
          {message.content}
        </div>
      </div>

      {/* Hover actions */}
      {showActions && (
        <div className={`absolute top-0 ${isOwn ? 'left-4' : 'right-4'} -translate-y-1/2 flex items-center gap-0.5 bg-white dark:bg-surface-800 rounded-lg shadow-lg border border-surface-200 dark:border-surface-700 p-0.5 animate-fade-in z-10`}>
          <button className="p-1.5 rounded-md hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 transition-colors" title="React">
            <SmilePlus className="w-3.5 h-3.5" />
          </button>
          <button className="p-1.5 rounded-md hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 transition-colors" title="Reply">
            <Reply className="w-3.5 h-3.5" />
          </button>
          <button className="p-1.5 rounded-md hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 transition-colors" title="Forward">
            <Forward className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onConvertToTask?.(message.content)}
            className="p-1.5 rounded-md hover:bg-brand-50 dark:hover:bg-brand-950/50 text-surface-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
            title="Convert to Task"
          >
            <ListTodo className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  )
}

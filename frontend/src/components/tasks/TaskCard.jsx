import Avatar from '../common/Avatar'
import { Calendar, Flag } from 'lucide-react'

function isOverdue(dateStr) {
  if (!dateStr) return false
  return new Date(dateStr) < new Date()
}

function formatDueDate(dateStr) {
  if (!dateStr) return null
  const d = new Date(dateStr)
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

const PRIORITY_COLORS = {
  high: 'text-rose-500',
  medium: 'text-amber-500',
  low: 'text-surface-400',
}

export default function TaskCard({ task }) {
  const overdue = isOverdue(task.due_date) && task.status !== 'done'
  const dueFormatted = formatDueDate(task.due_date)

  const handleDragStart = (e) => {
    e.dataTransfer.setData('taskId', task.id.toString())
    e.dataTransfer.effectAllowed = 'move'
  }

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className="bg-white dark:bg-surface-850 border border-surface-200 dark:border-surface-700 rounded-lg p-3 cursor-grab active:cursor-grabbing hover:shadow-md dark:hover:shadow-surface-900/50 transition-all duration-200 group"
    >
      {/* Title */}
      <p className={`text-[13px] font-medium leading-snug ${
        task.status === 'done'
          ? 'line-through text-surface-400'
          : 'text-surface-800 dark:text-surface-200'
      }`}>
        {task.title}
      </p>

      {/* Description preview */}
      {task.description && (
        <p className="text-[12px] text-surface-400 mt-1 line-clamp-2 leading-relaxed">
          {task.description}
        </p>
      )}

      {/* Footer: assignee, due date, priority */}
      <div className="flex items-center justify-between mt-2.5">
        <div className="flex items-center gap-2">
          {task.assignee_id && (
            <Avatar name={`User ${task.assignee_id}`} size="xs" />
          )}
          {dueFormatted && (
            <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-1.5 py-0.5 rounded ${
              overdue
                ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400'
                : 'bg-surface-100 dark:bg-surface-800 text-surface-500'
            }`}>
              <Calendar className="w-3 h-3" />
              {dueFormatted}
            </span>
          )}
        </div>

        <Flag className={`w-3.5 h-3.5 ${PRIORITY_COLORS.medium} opacity-0 group-hover:opacity-100 transition-opacity`} />
      </div>
    </div>
  )
}

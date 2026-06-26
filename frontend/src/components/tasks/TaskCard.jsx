import Avatar from '../common/Avatar'

function isOverdue(dateStr) {
  if (!dateStr) return false
  const due = new Date(dateStr)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return due < today
}

function formatDueDate(dateStr) {
  if (!dateStr) return null
  const d = new Date(dateStr)
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

const PRIORITY_BORDER_COLORS = {
  high: 'border-l-[#EF4444]',
  medium: 'border-l-[#F59E0B]',
  low: 'border-l-[#10B981]',
}

export default function TaskCard({ task }) {
  const priority = task.priority || ['medium', 'high', 'low'][task.id % 3]
  const tag = task.tag || ['UI', 'BUG', 'FEAT', 'API'][task.id % 4]
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
      className={`bg-surface-850 border border-surface-700/60 border-l-[3px] ${
        PRIORITY_BORDER_COLORS[priority]
      } rounded-lg p-3 cursor-grab active:cursor-grabbing hover:-translate-y-[2px] hover:border-brand-500 hover:shadow-[0_4px_12px_rgba(0,0,0,0.3)] transition-all duration-150 ease-in-out group`}
    >
      {/* Title */}
      <p
        className={`text-[13px] font-medium leading-snug pl-[10px] ${
          task.status === 'done'
            ? 'line-through text-surface-400'
            : 'text-studio-100'
        }`}
      >
        {task.title}
      </p>

      {/* Description preview */}
      {task.description && (
        <p className="text-[12px] text-surface-400 mt-1 pl-[10px] line-clamp-2 leading-relaxed">
          {task.description}
        </p>
      )}

      {/* Footer row */}
      <div className="flex items-center justify-between mt-3 pl-[10px]">
        {/* Left side: Tag chip */}
        <div>
          {tag && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-500/10 text-brand-600 text-brand-400">
              {tag}
            </span>
          )}
        </div>

        {/* Right side: Assignee & Due Date */}
        {(task.assignee_id || dueFormatted) && (
          <div className="flex items-center gap-1.5">
            {task.assignee_id && (
              <Avatar name={`User ${task.assignee_id}`} size="xxs" />
            )}
            {dueFormatted && (
              <span
                className={`text-[11px] font-medium ${
                  overdue
                    ? 'text-[#EF4444] font-semibold'
                    : 'text-surface-400 text-surface-500'
                }`}
              >
                {dueFormatted}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

import { useDispatch } from 'react-redux'
import { moveTask } from '../../store/taskSlice'
import { updateTask } from '../../api/tasks'
import TaskCard from './TaskCard'
import EmptyState from '../common/EmptyState'

const COLOR_MAP = {
  slate: {
    dot: 'bg-surface-400',
    count: 'text-surface-500',
  },
  amber: {
    dot: 'bg-amber-500',
    count: 'text-amber-600 dark:text-amber-400',
  },
  emerald: {
    dot: 'bg-emerald-500',
    count: 'text-emerald-600 dark:text-emerald-400',
  },
}

export default function TaskColumn({ title, status, tasks, color }) {
  const dispatch = useDispatch()
  const colors = COLOR_MAP[color] || COLOR_MAP.slate

  const handleDragOver = (e) => {
    e.preventDefault()
    e.currentTarget.classList.add('bg-surface-50', 'dark:bg-surface-800/50')
  }

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove('bg-surface-50', 'dark:bg-surface-800/50')
  }

  const handleDrop = async (e) => {
    e.preventDefault()
    e.currentTarget.classList.remove('bg-surface-50', 'dark:bg-surface-800/50')
    const taskId = parseInt(e.dataTransfer.getData('taskId'))
    if (!taskId) return

    // Optimistic update
    dispatch(moveTask({ taskId, newStatus: status }))

    // Persist to backend
    try {
      await updateTask(taskId, { status })
    } catch (err) {
      console.error('Failed to update task status:', err)
    }
  }

  return (
    <div
      className="rounded-xl transition-colors duration-200"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Column header */}
      <div className="flex items-center gap-2 mb-2 px-1">
        <div className={`w-2 h-2 rounded-full ${colors.dot}`} />
        <span className="text-[12px] font-semibold uppercase tracking-wider text-surface-500 dark:text-surface-400">
          {title}
        </span>
        <span className={`text-[11px] font-medium ${colors.count}`}>{tasks.length}</span>
      </div>

      {/* Task cards */}
      <div className="space-y-2 min-h-[40px] rounded-lg p-1">
        {tasks.length === 0 ? (
          <div className="py-4 text-center text-[12px] text-surface-400 border-2 border-dashed border-surface-200 dark:border-surface-800 rounded-lg">
            Drop tasks here
          </div>
        ) : (
          tasks.map(task => <TaskCard key={task.id} task={task} />)
        )}
      </div>
    </div>
  )
}

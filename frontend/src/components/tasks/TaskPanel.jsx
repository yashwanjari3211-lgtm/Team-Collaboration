import { useSelector } from 'react-redux'
import TaskColumn from './TaskColumn'
import TaskQuickAdd from './TaskQuickAdd'
import TaskSkeleton from './TaskSkeleton'
import { ListTodo, X } from 'lucide-react'
import { useDispatch } from 'react-redux'
import { toggleTaskPanel } from '../../store/uiSlice'

export default function TaskPanel() {
  const dispatch = useDispatch()
  const { todo, inProgress, done, loading } = useSelector(state => state.tasks)
  const isOpen = useSelector(state => state.ui.taskPanelOpen)

  if (!isOpen) return null

  return (
    <aside className="w-[320px] flex flex-col bg-surface-900 border-l border-surface-700/60 animate-slide-in-right flex-shrink-0">
      {/* Header */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-surface-700/50 flex-shrink-0">
        <div className="flex items-center gap-2">
          <ListTodo className="w-4 h-4 text-brand-500" />
          <h3 className="text-[14px] font-semibold text-surface-900 text-studio-100">Tasks</h3>
          <span className="text-[11px] text-surface-400 bg-surface-100 bg-surface-800 rounded-full px-2 py-0.5">
            {todo.length + inProgress.length + done.length}
          </span>
        </div>
        <button
          onClick={() => dispatch(toggleTaskPanel())}
          className="p-1.5 rounded-lg hover-surface text-surface-400 hover:text-surface-600 hover:text-studio-200 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Quick add */}
      <TaskQuickAdd />

      {/* Task columns */}
      {loading ? (
        <TaskSkeleton />
      ) : (
        <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-4">
          <TaskColumn title="To Do" status="todo" tasks={todo} color="slate" />
          <TaskColumn title="In Progress" status="in_progress" tasks={inProgress} color="amber" />
          <TaskColumn title="Done" status="done" tasks={done} color="emerald" />
        </div>
      )}
    </aside>
  )
}

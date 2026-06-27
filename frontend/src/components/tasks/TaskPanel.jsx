import { useSelector } from 'react-redux'
import TaskColumn from './TaskColumn'
import TaskQuickAdd from './TaskQuickAdd'
import TaskSkeleton from './TaskSkeleton'
import { ListTodo, X } from 'lucide-react'
import { useDispatch } from 'react-redux'
import { toggleTaskPanel } from '../../store/uiSlice'

export default function TaskPanel() {
  const dispatch = useDispatch()
  const isOpen = useSelector(state => state.ui.taskPanelOpen)
  const boards = useSelector(state => state.boards.items)
  const activeBoard = useSelector(state => state.boards.activeBoard)

  if (!isOpen) return null

  const targetBoard = activeBoard || (boards && boards.length > 0 ? boards[0] : null)

  const colors = ['slate', 'amber', 'emerald', 'blue', 'purple']

  return (
    <aside className="w-[320px] flex flex-col bg-surface-900 border-l border-surface-700/60 animate-slide-in-right flex-shrink-0">
      {/* Header */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-surface-700/50 flex-shrink-0">
        <div className="flex items-center gap-2">
          <ListTodo className="w-4 h-4 text-brand-500" />
          <h3 className="text-[14px] font-semibold text-surface-900 text-studio-100">Tasks</h3>
          {targetBoard && (
            <span className="text-[11px] text-surface-400 bg-surface-100 bg-surface-800 rounded-full px-2 py-0.5">
              {targetBoard.columns?.reduce((acc, col) => acc + (col.tasks?.length || 0), 0) || 0}
            </span>
          )}
        </div>
        <button
          onClick={() => dispatch(toggleTaskPanel())}
          className="p-1.5 rounded-lg hover-surface text-surface-400 hover:text-surface-600 hover:text-studio-200 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {!targetBoard ? (
        <div className="flex-1 flex items-center justify-center p-6 text-center text-surface-400 text-sm">
          No boards available to manage tasks. Please create a board first.
        </div>
      ) : (
        <>
          {/* Quick add */}
          <TaskQuickAdd targetBoard={targetBoard} />

          {/* Task columns */}
          <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-4 pt-4">
            {targetBoard.columns?.map((col, idx) => (
              <TaskColumn 
                key={col.id}
                title={col.name} 
                columnId={col.id} 
                boardId={targetBoard.id}
                tasks={col.tasks || []} 
                color={colors[idx % colors.length]} 
              />
            ))}
            {(!targetBoard.columns || targetBoard.columns.length === 0) && (
              <div className="text-center text-surface-400 text-sm mt-8">
                This board has no columns. Add columns in the board view.
              </div>
            )}
          </div>
        </>
      )}
    </aside>
  )
}

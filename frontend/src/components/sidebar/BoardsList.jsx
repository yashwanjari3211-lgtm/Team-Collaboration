import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { ChevronDown, ChevronRight, Hash, Plus, KanbanSquare } from 'lucide-react'
import { fetchBoards, setActiveBoard, createBoardThunk } from '../../store/boardSlice'

export default function BoardsList({ collapsed }) {
  const dispatch = useDispatch()
  const [isExpanded, setIsExpanded] = useState(true)
  const boards = useSelector(state => state.boards.items)
  const activeBoard = useSelector(state => state.boards.activeBoard)
  const activeOrgId = localStorage.getItem('activeOrganizationId')

  useEffect(() => {
    if (activeOrgId) {
      dispatch(fetchBoards())
    }
  }, [activeOrgId, dispatch])

  if (collapsed) {
    return (
      <div className="flex flex-col items-center gap-2 py-2">
        <button 
          onClick={() => {
            if (boards.length > 0) {
              dispatch(setActiveBoard(boards[0]));
            }
          }}
          className="p-2 rounded-lg hover-surface text-surface-500 hover:text-surface-600 transition-colors" 
          title="Boards"
        >
          <KanbanSquare className="w-5 h-5" />
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-1.5 group">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 transition-colors"
        >
          {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          Boards
        </button>
        <button
          onClick={() => {
            const name = prompt('Enter new board name:')
            if (name && name.trim()) {
              dispatch(createBoardThunk({ name: name.trim() }))
            }
          }}
          className="p-1 rounded hover-surface text-surface-400 hover:text-surface-600 dark:hover:text-surface-200 transition-colors opacity-0 group-hover:opacity-100" 
          title="Create Board"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* List */}
      {isExpanded && (
        <div className="space-y-0.5">
          {boards.map(board => (
            <button
              key={board.id}
              onClick={() => {
                dispatch(setActiveBoard(board));
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover-surface transition-colors ${
                activeBoard?.id === board.id
                  ? 'bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 font-medium'
                  : 'text-surface-600 dark:text-surface-400'
              }`}
            >
              <KanbanSquare className={`w-4 h-4 flex-shrink-0 ${activeBoard?.id === board.id ? 'text-brand-500' : 'text-surface-400'}`} />
              <span className="text-[13px] truncate text-left">{board.name}</span>
            </button>
          ))}
          {boards.length === 0 && (
            <div className="px-5 py-2 text-[12px] text-surface-400 italic">
              No boards yet
            </div>
          )}
        </div>
      )}
    </div>
  )
}

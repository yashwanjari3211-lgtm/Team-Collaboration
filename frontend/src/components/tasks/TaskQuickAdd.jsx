import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { addTask } from '../../store/taskSlice'
import { setConvertingMessage } from '../../store/uiSlice'
import { createTask } from '../../api/tasks'
import { Plus, X } from 'lucide-react'

export default function TaskQuickAdd() {
  const dispatch = useDispatch()
  const activeChannelId = useSelector(state => state.channels.activeId)
  const convertingMessage = useSelector(state => state.ui.convertingMessage)
  const [title, setTitle] = useState('')
  const [adding, setAdding] = useState(false)

  // Pre-fill from "Convert to Task" action
  const displayTitle = convertingMessage || title

  const handleSubmit = async (e) => {
    e?.preventDefault()
    const taskTitle = displayTitle.trim()
    if (!taskTitle || !activeChannelId) return

    setAdding(true)
    try {
      const res = await createTask({ title: taskTitle, channel_id: activeChannelId })
      dispatch(addTask(res.data))
      setTitle('')
      dispatch(setConvertingMessage(null))
    } catch (err) {
      console.error('Failed to create task:', err)
    } finally {
      setAdding(false)
    }
  }

  const handleCancelConvert = () => {
    dispatch(setConvertingMessage(null))
  }

  return (
    <form onSubmit={handleSubmit} className="px-3 py-3 border-b border-surface-100 dark:border-surface-800 flex-shrink-0">
      {convertingMessage && (
        <div className="flex items-center gap-2 mb-2 px-2 py-1.5 bg-brand-50 dark:bg-brand-950/30 rounded-lg text-[11px] text-brand-600 dark:text-brand-400">
          <span className="flex-1 truncate">Converting message to task</span>
          <button type="button" onClick={handleCancelConvert} className="hover:text-brand-800 dark:hover:text-brand-200">
            <X className="w-3 h-3" />
          </button>
        </div>
      )}
      <div className="flex items-center gap-2">
        <div className="flex-1 flex items-center gap-2 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-lg px-3 py-2 focus-within:border-brand-500/50 focus-within:ring-2 focus-within:ring-brand-500/20 transition-all">
          <Plus className="w-4 h-4 text-surface-400 flex-shrink-0" />
          <input
            type="text"
            value={convertingMessage ? convertingMessage : title}
            onChange={(e) => {
              if (convertingMessage) {
                dispatch(setConvertingMessage(e.target.value))
              } else {
                setTitle(e.target.value)
              }
            }}
            placeholder="Add new task…"
            className="flex-1 bg-transparent text-[13px] text-surface-800 dark:text-surface-200 placeholder:text-surface-400 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={!displayTitle.trim() || adding}
          className={`px-3 py-2 rounded-lg text-[12px] font-semibold transition-all ${
            displayTitle.trim()
              ? 'bg-brand-500 hover:bg-brand-600 text-white shadow-sm shadow-brand-500/30'
              : 'bg-surface-200 dark:bg-surface-800 text-surface-400 cursor-not-allowed'
          }`}
        >
          Add
        </button>
      </div>
    </form>
  )
}

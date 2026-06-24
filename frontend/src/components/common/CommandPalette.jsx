import { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { setCommandPaletteOpen, toggleDarkMode, toggleTaskPanel } from '../../store/uiSlice'
import { setActiveChannel } from '../../store/channelSlice'
import { Search, Hash, Sun, Moon, PanelRight, X } from 'lucide-react'

export default function CommandPalette() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const isOpen = useSelector(state => state.ui.commandPaletteOpen)
  const channels = useSelector(state => state.channels.items)
  const darkMode = useSelector(state => state.ui.darkMode)
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        dispatch(setCommandPaletteOpen(true))
      }
      if (e.key === 'Escape') {
        dispatch(setCommandPaletteOpen(false))
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [dispatch])

  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen])

  if (!isOpen) return null

  const actions = [
    { id: 'toggle-dark', label: darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode', icon: darkMode ? Sun : Moon, action: () => dispatch(toggleDarkMode()) },
    { id: 'toggle-tasks', label: 'Toggle Task Panel', icon: PanelRight, action: () => dispatch(toggleTaskPanel()) },
  ]

  const filteredChannels = channels.filter(c =>
    c.name.toLowerCase().includes(query.toLowerCase())
  )

  const filteredActions = actions.filter(a =>
    a.label.toLowerCase().includes(query.toLowerCase())
  )

  const allItems = [
    ...filteredChannels.map(c => ({ type: 'channel', ...c })),
    ...filteredActions.map(a => ({ type: 'action', ...a })),
  ]

  const handleSelect = (item) => {
    if (item.type === 'channel') {
      dispatch(setActiveChannel(item.id))
    } else if (item.type === 'action') {
      item.action()
    }
    dispatch(setCommandPaletteOpen(false))
  }

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(i => Math.min(i + 1, allItems.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(i => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && allItems[selectedIndex]) {
      e.preventDefault()
      handleSelect(allItems[selectedIndex])
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]" onClick={() => dispatch(setCommandPaletteOpen(false))}>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg glass-heavy rounded-xl shadow-2xl overflow-hidden animate-slide-in-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-surface-200 dark:border-surface-700">
          <Search className="w-5 h-5 text-surface-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => { setQuery(e.target.value); setSelectedIndex(0) }}
            onKeyDown={handleKeyDown}
            placeholder="Search channels, actions…"
            className="flex-1 bg-transparent text-sm text-surface-900 dark:text-surface-100 placeholder:text-surface-400 focus:outline-none"
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium text-surface-400 bg-surface-100 dark:bg-surface-800 rounded border border-surface-200 dark:border-surface-700">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[300px] overflow-y-auto py-2">
          {filteredChannels.length > 0 && (
            <>
              <div className="px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-surface-400">Channels</div>
              {filteredChannels.map((c, i) => {
                const idx = i
                return (
                  <button
                    key={c.id}
                    onClick={() => handleSelect({ type: 'channel', ...c })}
                    className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors ${
                      selectedIndex === idx ? 'bg-brand-50 dark:bg-brand-950/50 text-brand-600 dark:text-brand-300' : 'text-surface-700 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-800'
                    }`}
                  >
                    <Hash className="w-4 h-4 text-surface-400" />
                    {c.name}
                  </button>
                )
              })}
            </>
          )}

          {filteredActions.length > 0 && (
            <>
              <div className="px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-surface-400">Actions</div>
              {filteredActions.map((a, i) => {
                const idx = filteredChannels.length + i
                const Icon = a.icon
                return (
                  <button
                    key={a.id}
                    onClick={() => handleSelect({ type: 'action', ...a })}
                    className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors ${
                      selectedIndex === idx ? 'bg-brand-50 dark:bg-brand-950/50 text-brand-600 dark:text-brand-300' : 'text-surface-700 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-800'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-surface-400" />
                    {a.label}
                  </button>
                )
              })}
            </>
          )}

          {allItems.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-surface-400">
              No results found for "{query}"
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-4 px-4 py-2 border-t border-surface-200 dark:border-surface-700 text-[11px] text-surface-400">
          <span>↑↓ Navigate</span>
          <span>↵ Select</span>
          <span>esc Close</span>
        </div>
      </div>
    </div>
  )
}

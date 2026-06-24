import { useState, useRef } from 'react'
import { useSelector } from 'react-redux'
import { sendMessage } from '../../api/messages'
import { Smile, Paperclip, SendHorizontal } from 'lucide-react'

export default function MessageInput({ channelName }) {
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const textareaRef = useRef(null)
  const activeChannelId = useSelector(state => state.channels.activeId)

  const handleSend = async () => {
    if (!text.trim() || !activeChannelId || sending) return
    setSending(true)
    try {
      await sendMessage(text.trim(), activeChannelId)
      setText('')
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    } catch (err) {
      console.error('Failed to send message:', err)
    } finally {
      setSending(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleInput = (e) => {
    setText(e.target.value)
    // Auto-resize
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px'
  }

  return (
    <div className="px-4 pb-4 pt-2 flex-shrink-0">
      <div className="flex items-end gap-2 bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-xl px-3 py-2 focus-within:border-brand-500/50 focus-within:ring-2 focus-within:ring-brand-500/20 transition-all">
        {/* Attachment button */}
        <button className="p-1.5 rounded-lg hover:bg-surface-200 dark:hover:bg-surface-800 text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 transition-colors flex-shrink-0 mb-0.5">
          <Paperclip className="w-4 h-4" />
        </button>

        {/* Text input */}
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder={`Message #${channelName || 'general'}…`}
          rows={1}
          className="flex-1 bg-transparent text-[13.5px] text-surface-800 dark:text-surface-200 placeholder:text-surface-400 resize-none focus:outline-none leading-relaxed max-h-40"
        />

        {/* Emoji button */}
        <button className="p-1.5 rounded-lg hover:bg-surface-200 dark:hover:bg-surface-800 text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 transition-colors flex-shrink-0 mb-0.5">
          <Smile className="w-4 h-4" />
        </button>

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={!text.trim() || sending}
          className={`p-2 rounded-lg flex-shrink-0 transition-all duration-200 mb-0.5 ${
            text.trim()
              ? 'bg-brand-500 hover:bg-brand-600 text-white shadow-sm shadow-brand-500/30'
              : 'bg-surface-200 dark:bg-surface-800 text-surface-400 cursor-not-allowed'
          }`}
        >
          <SendHorizontal className="w-4 h-4" />
        </button>
      </div>
      <p className="text-[11px] text-surface-400 mt-1.5 px-1">
        <kbd className="font-mono text-[10px]">Enter</kbd> to send · <kbd className="font-mono text-[10px]">Shift+Enter</kbd> for new line · <kbd className="font-mono text-[10px]">Ctrl+K</kbd> to search
      </p>
    </div>
  )
}

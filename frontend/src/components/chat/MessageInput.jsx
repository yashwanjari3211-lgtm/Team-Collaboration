import { useState, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { sendMessage } from '../../api/messages'
import { addMessage } from '../../store/messageSlice'
import { Smile, Paperclip, SendHorizontal } from 'lucide-react'

export default function MessageInput({ channelName }) {
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const editorRef = useRef(null)
  const containerRef = useRef(null)
  const fileInputRef = useRef(null)
  const activeChannelId = useSelector(state => state.channels.activeId)
  const dispatch = useDispatch()

  const handleSend = async () => {
    const htmlContent = editorRef.current?.innerHTML || ''
    if (!text.trim() || !activeChannelId || sending) return
    setSending(true)
    try {
      const res = await sendMessage(htmlContent, activeChannelId)
      dispatch(addMessage(res.data))
      setText('')
      if (editorRef.current) {
        editorRef.current.innerHTML = ''
      }
    } catch (err) {
      console.error('Failed to send message:', err)
    } finally {
      setSending(false)
    }
  }

  const applyCommand = (command, value = null) => {
    document.execCommand(command, false, value)
    if (editorRef.current) {
      editorRef.current.focus()
      setText(editorRef.current.textContent)
    }
  }

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (file && editorRef.current) {
      editorRef.current.innerHTML += `<div>[Attached: ${file.name}]</div>`
      setText(editorRef.current.textContent)
      e.target.value = ''
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleInput = (e) => {
    setText(e.currentTarget.textContent)
  }

  const handleBlur = (e) => {
    // Delay slightly to check if focus moved to a formatting button inside the container
    if (containerRef.current && containerRef.current.contains(e.relatedTarget)) {
      return
    }
    setIsFocused(false)
  }

  return (
    <div
      ref={containerRef}
      onBlur={handleBlur}
      className="px-4 pb-4 pt-2 flex-shrink-0"
    >
      <div className="flex flex-col bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-xl focus-within:border-brand-500/50 focus-within:ring-2 focus-within:ring-brand-500/20 transition-all">
        
        {/* Formatting Toolbar (Slides Down) */}
        <div
          className={`overflow-hidden transition-all duration-200 ease-in-out ${
            isFocused ? 'max-h-[36px]' : 'max-h-0'
          }`}
        >
          <div className="flex items-center gap-1 px-2.5 py-1">
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); applyCommand('bold') }}
              className="w-7 h-7 flex items-center justify-center rounded hover:bg-surface-200 dark:hover:bg-surface-800 text-surface-650 dark:text-surface-300 font-bold text-xs"
              title="Bold"
            >
              B
            </button>
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); applyCommand('italic') }}
              className="w-7 h-7 flex items-center justify-center rounded hover:bg-surface-200 dark:hover:bg-surface-800 text-surface-650 dark:text-surface-300 italic text-xs"
              title="Italic"
            >
              I
            </button>
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); applyCommand('underline') }}
              className="w-7 h-7 flex items-center justify-center rounded hover:bg-surface-200 dark:hover:bg-surface-800 text-surface-650 dark:text-surface-300 underline text-xs"
              title="Underline"
            >
              U
            </button>
            <button
              type="button"
              onMouseDown={(e) => { 
                e.preventDefault()
                const url = prompt("Enter link URL:")
                if (url) applyCommand('createLink', url)
              }}
              className="w-7 h-7 flex items-center justify-center rounded hover:bg-surface-200 dark:hover:bg-surface-800 text-surface-650 dark:text-surface-300 text-xs"
              title="Link"
            >
              🔗
            </button>
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); applyCommand('insertUnorderedList') }}
              className="w-7 h-7 flex items-center justify-center rounded hover:bg-surface-200 dark:hover:bg-surface-800 text-surface-650 dark:text-surface-300 text-xs"
              title="Unordered list"
            >
              ≡
            </button>
          </div>
          <div className="border-b border-surface-200 dark:border-surface-800" />
        </div>

        {/* Chat Input Textarea & Icons Row */}
        <div className="flex items-end gap-2 px-3 py-2">
          {/* Attachment button */}
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="p-1.5 rounded-lg hover:bg-surface-200 dark:hover:bg-surface-800 text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 transition-colors flex-shrink-0 mb-0.5"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          {/* Text input */}
          <div
            ref={editorRef}
            contentEditable
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            data-placeholder={`Message #${channelName || 'general'}…`}
            className="flex-1 min-h-[24px] bg-transparent text-[13.5px] text-surface-800 dark:text-surface-200 focus:outline-none leading-relaxed max-h-40 overflow-y-auto empty:before:content-[attr(data-placeholder)] empty:before:text-surface-400 break-words"
          />

          {/* Emoji button */}
          <button 
            onClick={() => applyCommand('insertText', '😊')}
            className="p-1.5 rounded-lg hover:bg-surface-200 dark:hover:bg-surface-800 text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 transition-colors flex-shrink-0 mb-0.5"
          >
            <Smile className="w-4 h-4" />
          </button>

          {/* Send button */}
          <button
            onClick={handleSend}
            disabled={!text.trim() || sending}
            className={`p-2 rounded-lg flex-shrink-0 transition-all duration-200 mb-0.5 ${
              text.trim()
                ? 'bg-brand-500 hover:bg-brand-600 text-white shadow-sm shadow-brand-500/30 shadow-brand-500/20'
                : 'bg-surface-200 dark:bg-surface-800 text-surface-400 cursor-not-allowed'
            }`}
          >
            <SendHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>
      <p className="text-[11px] text-surface-400 mt-1.5 px-1">
        <kbd className="font-mono text-[10px]">Enter</kbd> to send · <kbd className="font-mono text-[10px]">Shift+Enter</kbd> for new line · <kbd className="font-mono text-[10px]">Ctrl+K</kbd> to search
      </p>
    </div>
  )
}

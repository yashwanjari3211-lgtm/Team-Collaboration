import { useState, useRef, useEffect, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { sendMessage } from '../../api/messages'
import { getOrgMembers } from '../../api/organizations'
import { addMessage } from '../../store/messageSlice'
import { Smile, Paperclip, SendHorizontal } from 'lucide-react'
import EmojiPicker from './EmojiPicker'
import MentionDropdown from './MentionDropdown'

export default function MessageInput({ channelName }) {
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [emojiOpen, setEmojiOpen] = useState(false)
  const [mentionOpen, setMentionOpen] = useState(false)
  const [mentionFilter, setMentionFilter] = useState('')
  const [orgMembers, setOrgMembers] = useState([])
  const editorRef = useRef(null)
  const containerRef = useRef(null)
  const fileInputRef = useRef(null)
  const emojiButtonRef = useRef(null)
  const activeChannelId = useSelector(state => state.channels.activeId)
  const dispatch = useDispatch()

  // Fetch org members for @mention
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await getOrgMembers()
        setOrgMembers(res.data)
      } catch (err) {
        console.error('Failed to fetch org members:', err)
      }
    }
    fetchMembers()
  }, [])

  const getPlainText = useCallback(() => {
    if (!editorRef.current) return ''
    // Get text content, handling mention spans properly
    const clone = editorRef.current.cloneNode(true)
    const mentionSpans = clone.querySelectorAll('.mention-tag')
    mentionSpans.forEach(span => {
      const textNode = document.createTextNode(span.textContent)
      span.replaceWith(textNode)
    })
    return clone.textContent || ''
  }, [])

  const handleSend = async () => {
    const content = getPlainText().trim()
    if (!content || !activeChannelId || sending) return
    setSending(true)
    try {
      const res = await sendMessage(content, activeChannelId)
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
      setText(getPlainText())
    }
  }

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (file && editorRef.current) {
      editorRef.current.innerHTML += `<div>[Attached: ${file.name}]</div>`
      setText(getPlainText())
      e.target.value = ''
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (mentionOpen) return // Don't send when mention dropdown is open
      handleSend()
    }
    if (e.key === 'Escape') {
      setMentionOpen(false)
      setEmojiOpen(false)
    }
  }

  const handleInput = (e) => {
    const content = getPlainText()
    setText(content)

    // Check for @ mention trigger
    const sel = window.getSelection()
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0)
      const textBeforeCursor = range.startContainer.textContent?.slice(0, range.startOffset) || ''
      
      // Find the last @ that doesn't have a space after the query
      const atMatch = textBeforeCursor.match(/@(\w*)$/)
      if (atMatch) {
        setMentionOpen(true)
        setMentionFilter(atMatch[1])
      } else {
        setMentionOpen(false)
        setMentionFilter('')
      }
    }
  }

  const handleMentionSelect = (user) => {
    const displayName = user.full_name || user.email
    
    // Replace the @query with a mention span
    const sel = window.getSelection()
    if (sel && sel.rangeCount > 0 && editorRef.current) {
      const range = sel.getRangeAt(0)
      const textNode = range.startContainer
      const text = textNode.textContent || ''
      const offset = range.startOffset
      
      // Find where the @ starts
      const beforeCursor = text.slice(0, offset)
      const atIndex = beforeCursor.lastIndexOf('@')
      
      if (atIndex >= 0) {
        // Create the mention span
        const mentionSpan = document.createElement('span')
        mentionSpan.className = 'mention-tag'
        mentionSpan.contentEditable = 'false'
        mentionSpan.textContent = `@${displayName}`
        mentionSpan.dataset.userId = user.id

        // Split the text node
        const before = text.slice(0, atIndex)
        const after = text.slice(offset)
        
        const beforeNode = document.createTextNode(before)
        const afterNode = document.createTextNode('\u00A0' + after) // non-breaking space after mention
        
        const parent = textNode.parentNode
        parent.insertBefore(beforeNode, textNode)
        parent.insertBefore(mentionSpan, textNode)
        parent.insertBefore(afterNode, textNode)
        parent.removeChild(textNode)
        
        // Move cursor after the mention
        const newRange = document.createRange()
        newRange.setStart(afterNode, 1)
        newRange.collapse(true)
        sel.removeAllRanges()
        sel.addRange(newRange)
      }
    }
    
    setMentionOpen(false)
    setMentionFilter('')
    setText(getPlainText())
    editorRef.current?.focus()
  }

  const handleEmojiSelect = (emoji) => {
    if (editorRef.current) {
      editorRef.current.focus()
      
      const sel = window.getSelection()
      if (sel && sel.rangeCount > 0) {
        const range = sel.getRangeAt(0)
        range.deleteContents()
        const textNode = document.createTextNode(emoji)
        range.insertNode(textNode)
        
        // Move cursor after emoji
        range.setStartAfter(textNode)
        range.collapse(true)
        sel.removeAllRanges()
        sel.addRange(range)
      } else {
        editorRef.current.textContent += emoji
      }
      
      setText(getPlainText())
    }
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
      <div className="relative flex flex-col bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-xl focus-within:border-brand-500/50 focus-within:ring-2 focus-within:ring-brand-500/20 transition-all">
        
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

        {/* Mention Dropdown */}
        <MentionDropdown
          isOpen={mentionOpen}
          users={orgMembers}
          filter={mentionFilter}
          onSelect={handleMentionSelect}
          onClose={() => setMentionOpen(false)}
        />

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
          <div className="relative flex-shrink-0 mb-0.5">
            <button
              ref={emojiButtonRef}
              onClick={() => setEmojiOpen(!emojiOpen)}
              className={`p-1.5 rounded-lg transition-colors ${
                emojiOpen
                  ? 'bg-brand-500/10 text-brand-500'
                  : 'hover:bg-surface-200 dark:hover:bg-surface-800 text-surface-400 hover:text-surface-600 dark:hover:text-surface-300'
              }`}
            >
              <Smile className="w-4 h-4" />
            </button>
            <EmojiPicker
              isOpen={emojiOpen}
              onClose={() => setEmojiOpen(false)}
              onSelect={handleEmojiSelect}
              anchorRef={emojiButtonRef}
            />
          </div>

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
        <kbd className="font-mono text-[10px]">Enter</kbd> to send · <kbd className="font-mono text-[10px]">Shift+Enter</kbd> for new line · <kbd className="font-mono text-[10px]">@</kbd> to mention · <kbd className="font-mono text-[10px]">Ctrl+K</kbd> to search
      </p>
    </div>
  )
}

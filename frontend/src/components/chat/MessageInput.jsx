import { useState, useRef, useEffect, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { sendMessage } from '../../api/messages'
import { getOrgMembers } from '../../api/organizations'
import { addMessage } from '../../store/messageSlice'
import { setReplyingTo } from '../../store/uiSlice'
import { Smile, Paperclip, X, CornerUpLeft } from 'lucide-react'
import EmojiPicker from './EmojiPicker'
import MentionDropdown from './MentionDropdown'
import { motion } from 'framer-motion'
import clsx from 'clsx'

export default function MessageInput({ channelName }) {
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [emojiOpen, setEmojiOpen] = useState(false)
  const [mentionOpen, setMentionOpen] = useState(false)
  const [mentionFilter, setMentionFilter] = useState('')
  const [orgMembers, setOrgMembers] = useState([])
  
  // Animation refs
  const canvasRef = useRef(null)
  const newDataRef = useRef([])
  const [animating, setAnimating] = useState(false)

  const editorRef = useRef(null)
  const containerRef = useRef(null)
  const fileInputRef = useRef(null)
  const emojiButtonRef = useRef(null)
  const activeChannelId = useSelector(state => state.channels.activeId)
  const replyingTo = useSelector(state => state.ui.replyingTo)
  const dispatch = useDispatch()

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
    const clone = editorRef.current.cloneNode(true)
    const mentionSpans = clone.querySelectorAll('.mention-tag')
    mentionSpans.forEach(span => {
      const textNode = document.createTextNode(span.textContent)
      span.replaceWith(textNode)
    })
    return clone.textContent || ''
  }, [])

  // -------------------------------------------------------------
  // Animation Logic
  // -------------------------------------------------------------
  const draw = useCallback(() => {
    if (!editorRef.current) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const rect = editorRef.current.getBoundingClientRect()
    canvas.width = rect.width
    canvas.height = rect.height
    ctx.clearRect(0, 0, rect.width, rect.height)
    
    const computedStyles = getComputedStyle(editorRef.current)
    const fontSize = parseFloat(computedStyles.getPropertyValue("font-size"))
    ctx.font = `${fontSize}px ${computedStyles.fontFamily}`
    
    const isDark = document.documentElement.classList.contains('dark')
    ctx.fillStyle = isDark ? "#e5e5e5" : "#1f2937"
    ctx.textBaseline = "top"
    
    const lines = getPlainText().split('\n')
    let y = 4 // padding-top approx
    lines.forEach(line => {
      ctx.fillText(line, 0, y)
      y += fontSize * 1.5 // approx line height
    })

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const pixelData = imageData.data
    const newData = []

    for (let t = 0; t < canvas.height; t++) {
      let i = 4 * t * canvas.width
      for (let n = 0; n < canvas.width; n++) {
        let e = i + 4 * n
        if (pixelData[e + 3] > 0) {
          newData.push({
            x: n,
            y: t,
            color: [pixelData[e], pixelData[e + 1], pixelData[e + 2], pixelData[e + 3]],
          })
        }
      }
    }

    newDataRef.current = newData.map(({ x, y, color }) => ({
      x,
      y,
      r: 1,
      color: `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${color[3]})`,
    }))
  }, [getPlainText])

  const animate = (start) => {
    const animateFrame = (pos = 0) => {
      requestAnimationFrame(() => {
        const newArr = []
        for (let i = 0; i < newDataRef.current.length; i++) {
          const current = newDataRef.current[i]
          if (current.x < pos) {
            newArr.push(current)
          } else {
            if (current.r <= 0) {
              current.r = 0
              continue
            }
            current.x += Math.random() > 0.5 ? 1 : -1
            current.y += Math.random() > 0.5 ? 1 : -1
            current.r -= 0.05 * Math.random()
            newArr.push(current)
          }
        }
        newDataRef.current = newArr
        const ctx = canvasRef.current?.getContext("2d")
        if (ctx) {
          const canvas = canvasRef.current
          ctx.clearRect(pos, 0, canvas.width, canvas.height)
          newDataRef.current.forEach((t) => {
            const { x: n, y: i, r: s, color } = t
            if (n > pos) {
              ctx.beginPath()
              ctx.rect(n, i, s, s)
              ctx.fillStyle = color
              ctx.strokeStyle = color
              ctx.stroke()
            }
          })
        }
        if (newDataRef.current.length > 0) {
          animateFrame(pos - 4) // adjust speed of vanish line here
        } else {
          setText("")
          if (editorRef.current) {
             editorRef.current.innerHTML = ""
          }
          setAnimating(false)
        }
      })
    }
    animateFrame(start)
  }

  const vanishAndSubmit = () => {
    if (animating || !text.trim() || sending) return
    setAnimating(true)
    draw()
    
    // Trigger the API call concurrently
    handleSend(true)

    const value = getPlainText()
    if (value && editorRef.current) {
      const maxX = newDataRef.current.reduce(
        (prev, current) => (current.x > prev ? current.x : prev),
        0
      )
      animate(maxX)
    } else {
      setAnimating(false)
    }
  }

  const handleSend = async (fromVanish = false) => {
    let content = getPlainText().trim()
    if (!content || !activeChannelId) return

    if (replyingTo) {
      // Create blockquote with original message text without html tags
      const rawText = replyingTo.content.replace(/<[^>]*>?/gm, '').substring(0, 100)
      const username = replyingTo.user?.full_name || replyingTo.user?.email || 'User'
      content = `<blockquote><strong>${username}:</strong> ${rawText}</blockquote>${content}`
    }

    setSending(true)
    try {
      const res = await sendMessage(content, activeChannelId)
      dispatch(addMessage(res.data))
      if (!fromVanish) {
        setText('')
        if (editorRef.current) {
          editorRef.current.innerHTML = ''
        }
      }
      if (replyingTo) {
        dispatch(setReplyingTo(null))
      }
    } catch (err) {
      console.error('Failed to send message:', err)
      if (fromVanish) setAnimating(false)
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
      if (mentionOpen) return
      vanishAndSubmit() // Trigger animation on Enter
    }
    if (e.key === 'Escape') {
      setMentionOpen(false)
      setEmojiOpen(false)
    }
  }

  const handleInput = (e) => {
    if (animating) {
      e.preventDefault()
      return
    }
    const content = getPlainText()
    setText(content)

    const sel = window.getSelection()
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0)
      const textBeforeCursor = range.startContainer.textContent?.slice(0, range.startOffset) || ''
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
    const sel = window.getSelection()
    if (sel && sel.rangeCount > 0 && editorRef.current) {
      const range = sel.getRangeAt(0)
      const textNode = range.startContainer
      const text = textNode.textContent || ''
      const offset = range.startOffset
      const beforeCursor = text.slice(0, offset)
      const atIndex = beforeCursor.lastIndexOf('@')
      
      if (atIndex >= 0) {
        const mentionSpan = document.createElement('span')
        mentionSpan.className = 'mention-tag'
        mentionSpan.contentEditable = 'false'
        mentionSpan.textContent = `@${displayName}`
        mentionSpan.dataset.userId = user.id

        const before = text.slice(0, atIndex)
        const after = text.slice(offset)
        const beforeNode = document.createTextNode(before)
        const afterNode = document.createTextNode('\u00A0' + after)
        
        const parent = textNode.parentNode
        parent.insertBefore(beforeNode, textNode)
        parent.insertBefore(mentionSpan, textNode)
        parent.insertBefore(afterNode, textNode)
        parent.removeChild(textNode)
        
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
        
        <div className={`overflow-hidden transition-all duration-200 ease-in-out ${isFocused ? 'max-h-[36px]' : 'max-h-0'}`}>
          <div className="flex items-center gap-1 px-2.5 py-1">
            <button type="button" onMouseDown={(e) => { e.preventDefault(); applyCommand('bold') }} className="w-7 h-7 flex items-center justify-center rounded hover:bg-surface-200 dark:hover:bg-surface-800 text-surface-650 dark:text-surface-300 font-bold text-xs">B</button>
            <button type="button" onMouseDown={(e) => { e.preventDefault(); applyCommand('italic') }} className="w-7 h-7 flex items-center justify-center rounded hover:bg-surface-200 dark:hover:bg-surface-800 text-surface-650 dark:text-surface-300 italic text-xs">I</button>
            <button type="button" onMouseDown={(e) => { e.preventDefault(); applyCommand('underline') }} className="w-7 h-7 flex items-center justify-center rounded hover:bg-surface-200 dark:hover:bg-surface-800 text-surface-650 dark:text-surface-300 underline text-xs">U</button>
            <button type="button" onMouseDown={(e) => { e.preventDefault(); const url = prompt("Enter link URL:"); if (url) applyCommand('createLink', url) }} className="w-7 h-7 flex items-center justify-center rounded hover:bg-surface-200 dark:hover:bg-surface-800 text-surface-650 dark:text-surface-300 text-xs">🔗</button>
            <button type="button" onMouseDown={(e) => { e.preventDefault(); applyCommand('insertUnorderedList') }} className="w-7 h-7 flex items-center justify-center rounded hover:bg-surface-200 dark:hover:bg-surface-800 text-surface-650 dark:text-surface-300 text-xs">≡</button>
          </div>
          <div className="border-b border-surface-200 dark:border-surface-800" />
        </div>

        {replyingTo && (
          <div className="flex items-center justify-between px-3 py-2 bg-surface-100 dark:bg-surface-800/50 border-b border-surface-200 dark:border-surface-800 text-xs">
            <div className="flex items-center gap-2 overflow-hidden">
              <CornerUpLeft className="w-3.5 h-3.5 text-brand-500 flex-shrink-0" />
              <span className="font-semibold text-surface-700 dark:text-surface-300">
                Replying to {replyingTo.user?.full_name || replyingTo.user?.email}
              </span>
              <span className="text-surface-500 truncate">
                {replyingTo.content.replace(/<[^>]*>?/gm, '').substring(0, 50)}...
              </span>
            </div>
            <button 
              onClick={() => dispatch(setReplyingTo(null))}
              className="p-1 hover:bg-surface-200 dark:hover:bg-surface-700 rounded-full text-surface-400 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <MentionDropdown isOpen={mentionOpen} users={orgMembers} filter={mentionFilter} onSelect={handleMentionSelect} onClose={() => setMentionOpen(false)} />

        <div className="flex items-end gap-2 px-3 py-2">
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
          <button onClick={() => fileInputRef.current?.click()} className="p-1.5 rounded-lg hover:bg-surface-200 dark:hover:bg-surface-800 text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 transition-colors flex-shrink-0 mb-0.5">
            <Paperclip className="w-4 h-4" />
          </button>

          {/* Animated Input Area */}
          <div className="flex-1 relative min-h-[24px] max-h-40">
            <canvas
              ref={canvasRef}
              className={clsx(
                "absolute inset-0 pointer-events-none z-10 w-full h-full",
                !animating ? "opacity-0" : "opacity-100"
              )}
            />
            <div
              ref={editorRef}
              contentEditable={!animating}
              onInput={handleInput}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              data-placeholder={`Message #${channelName || 'general'}…`}
              className={clsx(
                "w-full h-full min-h-[24px] bg-transparent text-[13.5px] text-surface-800 dark:text-surface-200 focus:outline-none leading-relaxed overflow-y-auto empty:before:content-[attr(data-placeholder)] empty:before:text-surface-400 break-words",
                animating && "text-transparent"
              )}
              style={{ caretColor: animating ? 'transparent' : 'auto' }}
            />
          </div>

          <div className="relative flex-shrink-0 mb-0.5">
            <button ref={emojiButtonRef} onClick={() => setEmojiOpen(!emojiOpen)} className={`p-1.5 rounded-lg transition-colors ${emojiOpen ? 'bg-brand-500/10 text-brand-500' : 'hover:bg-surface-200 dark:hover:bg-surface-800 text-surface-400 hover:text-surface-600 dark:hover:text-surface-300'}`}>
              <Smile className="w-4 h-4" />
            </button>
            <EmojiPicker isOpen={emojiOpen} onClose={() => setEmojiOpen(false)} onSelect={handleEmojiSelect} anchorRef={emojiButtonRef} />
          </div>

          <button
            onClick={() => vanishAndSubmit()}
            disabled={!text.trim() || sending}
            className={`p-2 rounded-lg flex-shrink-0 transition-all duration-200 mb-0.5 flex items-center justify-center ${
              text.trim()
                ? 'bg-brand-500 hover:bg-brand-600 text-white shadow-sm shadow-brand-500/30'
                : 'bg-surface-200 dark:bg-surface-800 text-surface-400 cursor-not-allowed'
            }`}
          >
            {/* Aceternity SVG Animated Icon */}
            <motion.svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-inherit"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <motion.path
                d="M5 12l14 0"
                initial={{ strokeDasharray: "50%", strokeDashoffset: "50%" }}
                animate={{ strokeDashoffset: text ? 0 : "50%" }}
                transition={{ duration: 0.3, ease: "linear" }}
              />
              <path d="M13 18l6 -6" />
              <path d="M13 6l6 6" />
            </motion.svg>
          </button>
        </div>
      </div>
      <p className="text-[11px] text-surface-400 mt-1.5 px-1">
        <kbd className="font-mono text-[10px]">Enter</kbd> to send · <kbd className="font-mono text-[10px]">Shift+Enter</kbd> for new line · <kbd className="font-mono text-[10px]">@</kbd> to mention · <kbd className="font-mono text-[10px]">Ctrl+K</kbd> to search
      </p>
    </div>
  )
}

import { useRef, useEffect } from 'react'
import { useSelector } from 'react-redux'
import MessageBubble from './MessageBubble'
import MessageSkeleton from './MessageSkeleton'
import EmptyState from '../common/EmptyState'

function formatDateDivider(dateStr) {
  const d = new Date(dateStr)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (d.toDateString() === today.toDateString()) return 'Today'
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

export default function MessageList({ channelName, onConvertToTask, isTyping = false, typingUser }) {
  const messages = useSelector(state => state.messages.items)
  const filter = useSelector(state => state.messages.filter || 'all')
  const loading = useSelector(state => state.messages.loading)
  const user = useSelector(state => state.auth.user)
  const bottomRef = useRef(null)

  let filteredMessages = messages
  if (filter === 'mentions') {
    const nameQuery = user?.full_name || user?.email || ''
    filteredMessages = messages.filter(msg => 
      msg.content.includes('@') && 
      (msg.content.toLowerCase().includes(nameQuery.toLowerCase()) || msg.content.toLowerCase().includes('all'))
    )
  } else if (filter === 'saved') {
    // Show messages that are bookmarked/saved (in our mock case, messages containing link, attachment or own messages)
    filteredMessages = messages.filter(msg => 
      msg.content.includes('Attached') || msg.content.includes('http') || msg.content.includes('href')
    )
  } else if (filter === 'dms') {
    filteredMessages = []
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [filteredMessages, isTyping])

  if (loading) return <MessageSkeleton />

  if (filteredMessages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <EmptyState type={filter === 'dms' ? 'dms' : 'messages'} channelName={channelName} />
      </div>
    )
  }

  let lastDate = null

  return (
    <div className="flex-1 overflow-y-auto py-4 message-feed-scroll">
      {filteredMessages.map((msg, i) => {
        const msgDate = new Date(msg.created_at).toDateString()
        let dateDivider = null
        if (msgDate !== lastDate) {
          lastDate = msgDate
          dateDivider = (
            <div className="flex items-center my-4 px-4" key={`divider-${msgDate}`}>
              <div className="flex-1 border-t border-surface-700" />
              <span className="text-[11px] font-semibold text-surface-500 dark:text-surface-400 px-3 py-1 bg-white dark:bg-surface-950 border border-surface-700 rounded-full mx-4 shadow-sm">
                {formatDateDivider(msg.created_at)}
              </span>
              <div className="flex-1 border-t border-surface-700" />
            </div>
          )
        }

        const isOwn = user?.id === msg.user_id
        const userName = isOwn 
          ? (user?.full_name || 'You') 
          : (msg.user?.full_name || msg.user?.email || `User ${msg.user_id}`)

        // Calculate consecutive messages from the same sender within 5 minutes on same day
        const prevMsg = i > 0 ? filteredMessages[i - 1] : null
        const isGrouped = !!(
          prevMsg &&
          prevMsg.user_id === msg.user_id &&
          new Date(msg.created_at) - new Date(prevMsg.created_at) < 5 * 60 * 1000 &&
          new Date(msg.created_at).toDateString() === new Date(prevMsg.created_at).toDateString()
        )

        return (
          <div key={msg.id}>
            {dateDivider}
            <MessageBubble
              message={msg}
              isOwn={isOwn}
              userName={userName}
              onConvertToTask={onConvertToTask}
              isGrouped={isGrouped}
            />
          </div>
        )
      })}

      {/* Typing indicator */}
      {isTyping && (
        <div className="flex items-center gap-1.5 px-6 py-2 text-surface-400 dark:text-surface-500 text-xs italic">
          <div className="flex gap-1 items-center mr-1">
            <span className="w-1.5 h-1.5 bg-surface-400 dark:bg-surface-500 rounded-full animate-bounce-dot" style={{ animationDelay: '0s' }} />
            <span className="w-1.5 h-1.5 bg-surface-400 dark:bg-surface-500 rounded-full animate-bounce-dot" style={{ animationDelay: '0.2s' }} />
            <span className="w-1.5 h-1.5 bg-surface-400 dark:bg-surface-500 rounded-full animate-bounce-dot" style={{ animationDelay: '0.4s' }} />
          </div>
          <span>{typingUser || 'Someone'} is typing...</span>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  )
}

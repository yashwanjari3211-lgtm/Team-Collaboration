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
  return d.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })
}

export default function MessageList({ channelName, onConvertToTask }) {
  const messages = useSelector(state => state.messages.items)
  const loading = useSelector(state => state.messages.loading)
  const user = useSelector(state => state.auth.user)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (loading) return <MessageSkeleton />

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <EmptyState type="messages" channelName={channelName} />
      </div>
    )
  }

  // Group messages by date
  let lastDate = null

  return (
    <div className="flex-1 overflow-y-auto py-4">
      {messages.map((msg, i) => {
        const msgDate = new Date(msg.created_at).toDateString()
        let dateDivider = null
        if (msgDate !== lastDate) {
          lastDate = msgDate
          dateDivider = (
            <div className="flex items-center gap-3 px-4 my-4" key={`divider-${msgDate}`}>
              <div className="flex-1 border-t border-surface-200 dark:border-surface-800" />
              <span className="text-[11px] font-medium text-surface-400 px-2">{formatDateDivider(msg.created_at)}</span>
              <div className="flex-1 border-t border-surface-200 dark:border-surface-800" />
            </div>
          )
        }

        const isOwn = user?.id === msg.user_id
        const userName = isOwn ? (user?.full_name || 'You') : `User ${msg.user_id}`

        return (
          <div key={msg.id}>
            {dateDivider}
            <MessageBubble
              message={msg}
              isOwn={isOwn}
              userName={userName}
              onConvertToTask={onConvertToTask}
            />
          </div>
        )
      })}
      <div ref={bottomRef} />
    </div>
  )
}

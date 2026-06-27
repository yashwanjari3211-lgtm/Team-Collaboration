import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import ChatHeader from './ChatHeader'
import MessageList from './MessageList'
import MessageInput from './MessageInput'

export default function ChatPanel({ channelName, onConvertToTask }) {
  const [isTyping, setIsTyping] = useState(false)
  const [typingUser, setTypingUser] = useState('Sarah Connor')
  const filter = useSelector(state => state.messages.filter || 'all')

  useEffect(() => {
    // Show typing simulation periodically for UX presentation
    const interval = setInterval(() => {
      setIsTyping(prev => !prev)
      setTypingUser(Math.random() > 0.5 ? 'Sarah Connor' : 'John Doe')
    }, 6000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-surface-950">
      <ChatHeader channelName={channelName} />
      <MessageList
        channelName={channelName}
        onConvertToTask={onConvertToTask}
        isTyping={isTyping}
        typingUser={typingUser}
      />
      {filter === 'all' && <MessageInput channelName={channelName} />}
    </div>
  )
}

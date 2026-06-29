import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import ChatHeader from './ChatHeader'
import MessageList from './MessageList'
import MessageInput from './MessageInput'
import DmDashboard from './DmDashboard'

export default function ChatPanel({ channelName, onConvertToTask }) {
  const filter = useSelector(state => state.messages.filter || 'all')
  const activeChannelId = useSelector(state => state.channels.activeId)
  const currentUser = useSelector(state => state.auth.user)
  
  const typingUsersMap = useSelector(state => state.messages.typingUsers?.[activeChannelId] || {})
  const typingUsernames = Object.entries(typingUsersMap)
    .filter(([id]) => parseInt(id) !== currentUser?.id)
    .map(([_, name]) => name)
  
  const isTyping = typingUsernames.length > 0
  const typingUser = typingUsernames.join(', ')

  if (filter === 'dms') {
    return <DmDashboard />
  }

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

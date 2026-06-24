import ChatHeader from './ChatHeader'
import MessageList from './MessageList'
import MessageInput from './MessageInput'

export default function ChatPanel({ channelName, onConvertToTask }) {
  return (
    <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-surface-950">
      <ChatHeader channelName={channelName} />
      <MessageList channelName={channelName} onConvertToTask={onConvertToTask} />
      <MessageInput channelName={channelName} />
    </div>
  )
}

import { MessageCircle, CheckSquare, Hash } from 'lucide-react'

const ICONS = {
  messages: MessageCircle,
  tasks: CheckSquare,
  channels: Hash,
}

export default function EmptyState({ type = 'messages', channelName = '', className = '' }) {
  const Icon = ICONS[type] || MessageCircle

  const texts = {
    messages: {
      title: 'No messages yet',
      subtitle: channelName
        ? `Start the conversation in #${channelName}!`
        : 'Select a channel to start chatting.',
    },
    tasks: {
      title: 'All clear!',
      subtitle: 'No tasks here yet. Add one above to get started.',
    },
    channels: {
      title: 'No channels',
      subtitle: 'Create a channel to start collaborating.',
    },
    dms: {
      title: 'Direct Messages',
      subtitle: 'Select a member under the "Direct Messages" section in the sidebar to start a private conversation.',
    },
  }

  const { title, subtitle } = texts[type] || texts.messages

  return (
    <div className={`flex flex-col items-center justify-center py-16 px-6 text-center ${className}`}>
      <div className="w-16 h-16 rounded-2xl bg-surface-800 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-surface-400 text-surface-500" strokeWidth={1.5} />
      </div>
      <h3 className="text-base font-semibold text-studio-200 mb-1">{title}</h3>
      <p className="text-sm text-surface-400 text-surface-500 max-w-[260px]">{subtitle}</p>
    </div>
  )
}

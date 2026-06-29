import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setReplyingTo } from '../../store/uiSlice'
import Avatar from '../common/Avatar'
import { SmilePlus, Reply, Forward, ListTodo, Bookmark } from 'lucide-react'
import ForwardModal from './ForwardModal'
import client from '../../api/client'
import { saveMessageInState, unsaveMessageInState } from '../../store/messageSlice'

function formatTime(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function MessageBubble({ message, isOwn, userName, onConvertToTask, isGrouped }) {
  const dispatch = useDispatch()
  const [reacted, setReacted] = useState(false)
  const [isForwardOpen, setIsForwardOpen] = useState(false)

  const savedIds = useSelector(state => state.messages.savedIds || [])
  const isSaved = savedIds.includes(message.id)

  const handleBookmark = async () => {
    try {
      if (isSaved) {
        await client.delete(`/messages/${message.id}/unsave`)
        dispatch(unsaveMessageInState(message.id))
      } else {
        await client.post(`/messages/${message.id}/save`)
        dispatch(saveMessageInState(message.id))
      }
    } catch (err) {
      console.error('Failed to toggle bookmark:', err)
    }
  }

  return (
    <div
      className={`group flex px-4 relative transition-colors hover:bg-surface-50 dark:hover:bg-surface-900/50 animate-message-in ${
        isGrouped ? 'py-0.5' : 'py-1.5'
      }`}
    >
      {/* Left side: Avatar or spacing spacer */}
      {isGrouped ? (
        <div className="w-8 flex-shrink-0" />
      ) : (
        <Avatar name={userName} size="sm" className="mt-0.5 flex-shrink-0" />
      )}

      {/* Right side: Message content */}
      <div className="flex flex-col flex-1 min-w-0 pl-2">
        {!isGrouped && (
          <div className="flex items-baseline gap-2 mb-0.5">
            <span className="text-[13px] font-bold text-surface-900 dark:text-white">
              {userName}
            </span>
            <span className="text-[10px] text-surface-400">{formatTime(message.created_at)}</span>
            {isSaved && (
              <Bookmark className="w-3 h-3 text-amber-500 fill-amber-500 ml-1 flex-shrink-0" />
            )}
          </div>
        )}

        <div className="text-[13.5px] leading-relaxed text-surface-800 dark:text-surface-200">
          <div dangerouslySetInnerHTML={{ __html: message.content }} className="message-content" />
          {reacted && (
            <div className="inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded-full bg-surface-100 dark:bg-surface-800 border border-brand-200 dark:border-brand-500/30 text-[11px] select-none cursor-pointer hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors" onClick={() => setReacted(false)}>
              <span className="text-[10px]">👍</span>
              <span className="text-brand-600 dark:text-brand-400 font-medium">1</span>
            </div>
          )}
        </div>
      </div>

      {/* Hover action bar */}
      <div className="absolute right-4 top-0 -translate-y-1/2 flex items-center gap-0.5 bg-white dark:bg-surface-800 rounded-lg shadow-lg border border-surface-200 dark:border-surface-700 p-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 pointer-events-auto">
        <button 
          onClick={() => setReacted(!reacted)}
          className="p-1.5 rounded-md hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 transition-colors" title="React">
          <SmilePlus className="w-3.5 h-3.5" />
        </button>
        <button 
          onClick={() => dispatch(setReplyingTo(message))}
          className="p-1.5 rounded-md hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 transition-colors" title="Reply">
          <Reply className="w-3.5 h-3.5" />
        </button>
        <button 
          onClick={() => setIsForwardOpen(true)}
          className="p-1.5 rounded-md hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 transition-colors" title="Forward">
          <Forward className="w-3.5 h-3.5" />
        </button>
        <button 
          onClick={handleBookmark}
          className={`p-1.5 rounded-md hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors ${isSaved ? 'text-amber-500' : 'text-surface-400 hover:text-surface-600 dark:hover:text-surface-300'}`} title={isSaved ? "Unsave" : "Save"}>
          <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-amber-500' : ''}`} />
        </button>
        <button
          onClick={() => onConvertToTask?.(message.content)}
          className="p-1.5 rounded-md hover:bg-brand-50 dark:hover:bg-brand-950/50 text-surface-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
          title="Convert to Task"
        >
          <ListTodo className="w-3.5 h-3.5" />
        </button>
      </div>

      <ForwardModal isOpen={isForwardOpen} onClose={() => setIsForwardOpen(false)} message={message} />
    </div>
  )
}

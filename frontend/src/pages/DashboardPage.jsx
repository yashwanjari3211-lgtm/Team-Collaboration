import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getMessages, sendMessage } from '../api/messages'
import { getTasks } from '../api/tasks'
import { setMessages } from '../store/messageSlice'
import { setTasks } from '../store/taskSlice'
import { useWebSocket } from '../hooks/useWebSocket'
import { logout } from '../store/authSlice'
import { useNavigate } from 'react-router-dom'

export default function DashboardPage() {
  const [channelId] = useState(1)
  const [messageText, setMessageText] = useState('')
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const messages = useSelector(state => state.messages.items)
  const tasks = useSelector(state => state.tasks)
  
  useWebSocket(channelId)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [msgRes, taskRes] = await Promise.all([
        getMessages(channelId),
        getTasks(channelId)
      ])
      dispatch(setMessages(msgRes.data))
      dispatch(setTasks(taskRes.data))
    } catch (error) {
      console.error(error)
    }
  }

  const handleSend = async () => {
    if (!messageText.trim()) return
    await sendMessage(messageText, channelId)
    setMessageText('')
  }

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  return (
    <div className="flex h-screen">
      <div className="w-64 bg-gray-800 text-white p-4">
        <h2 className="text-xl font-bold mb-4">Channels</h2>
        <div className="bg-gray-700 p-2 rounded mb-2">#general</div>
        <button onClick={handleLogout} className="mt-auto text-sm text-gray-400 hover:text-white">Logout</button>
      </div>
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto p-4">
          {messages.map(msg => (
            <div key={msg.id} className="mb-2 p-2 bg-gray-100 rounded">
              <p>{msg.content}</p>
            </div>
          ))}
        </div>
        <div className="p-4 border-t flex">
          <input value={messageText} onChange={e => setMessageText(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && handleSend()}
            className="flex-1 p-2 border rounded" placeholder="Type a message..." />
          <button onClick={handleSend} className="ml-2 px-4 bg-blue-500 text-white rounded">Send</button>
        </div>
      </div>
      <div className="w-80 bg-gray-50 p-4 border-l">
        <h3 className="font-bold mb-4">Tasks</h3>
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-600">To Do</h4>
          {tasks.todo.map(t => <div key={t.id} className="bg-white p-2 mb-2 rounded shadow-sm">{t.title}</div>)}
        </div>
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-600">In Progress</h4>
          {tasks.inProgress.map(t => <div key={t.id} className="bg-white p-2 mb-2 rounded shadow-sm">{t.title}</div>)}
        </div>
        <div>
          <h4 className="text-sm font-semibold text-gray-600">Done</h4>
          {tasks.done.map(t => <div key={t.id} className="bg-white p-2 mb-2 rounded shadow-sm">{t.title}</div>)}
        </div>
      </div>
    </div>
  )
}

import { createContext, useContext, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { addMessage } from '../store/messageSlice'
import { addTask, updateTaskInState, removeTaskFromState } from '../store/boardSlice'

const WebSocketContext = createContext(null)

export function WebSocketProvider({ children }) {
  const dispatch = useDispatch()
  const user = useSelector(state => state.auth.user)
  const activeOrgId = localStorage.getItem('activeOrganizationId')
  const activeChannelId = useSelector(state => state.channels.activeId)
  
  // We use a ref to store the active channel ID so the WebSocket closure
  // can access the latest value without needing to be recreated on every channel switch.
  const activeChannelRef = useRef(activeChannelId)
  const wsRef = useRef(null)

  useEffect(() => {
    activeChannelRef.current = activeChannelId
  }, [activeChannelId])

  useEffect(() => {
    if (!user || !activeOrgId) return

    // Connect to the organization-wide WebSocket
    const userId = user.id
    const userName = encodeURIComponent(user.full_name || user.email || 'Unknown')
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const host = window.location.hostname
    const ws = new WebSocket(`${protocol}//${host}:8000/api/ws/org_${activeOrgId}?user_id=${userId}&user_name=${userName}`)
    wsRef.current = ws

    ws.onopen = () => {
      console.log(`WebSocket connected to org_${activeOrgId}`)
    }

    const handleMessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        
        // Handle incoming chat messages
        if (data.type === 'message' || (!data.type && data.id)) {
          // Only dispatch if the message belongs to our currently active channel
          if (String(data.channel_id) === String(activeChannelRef.current)) {
            dispatch(addMessage(data))
          }
        }
        
        // Handle Kanban events
        if (data.type === 'task_updated') {
          dispatch(updateTaskInState(data.task));
        }
        
        if (data.type === 'task_created') {
          dispatch(addTask(data.task));
        }
        
        if (data.type === 'task_deleted') {
          dispatch(removeTaskFromState({ taskId: data.task_id, columnId: data.column_id }));
        }
        
      } catch (err) {
        console.error('WebSocket message parse error:', err)
      }
    }

    ws.addEventListener('message', handleMessage)

    ws.onerror = (err) => {
      console.error('WebSocket error:', err)
    }

    ws.onclose = () => {
      console.log(`WebSocket disconnected from org_${activeOrgId}`)
      wsRef.current = null
    }

    return () => {
      ws.close()
    }
  }, [activeOrgId, user, dispatch])

  // We return a function to get the current websocket so consumers always get the latest reference
  const getWs = () => wsRef.current

  return (
    <WebSocketContext.Provider value={{ getWs }}>
      {children}
    </WebSocketContext.Provider>
  )
}

export function useGlobalWebSocket() {
  const ctx = useContext(WebSocketContext)
  if (!ctx) throw new Error('useGlobalWebSocket must be used within WebSocketProvider')
  return ctx
}

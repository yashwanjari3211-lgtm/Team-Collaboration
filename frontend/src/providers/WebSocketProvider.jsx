import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { addMessage, setTyping } from '../store/messageSlice'
import { addTask, updateTaskInState, removeTaskFromState } from '../store/boardSlice'
import { setMemberStatus } from '../store/channelSlice'

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
  const [wsInstance, setWsInstance] = useState(null)

  useEffect(() => {
    activeChannelRef.current = activeChannelId
  }, [activeChannelId])

  const userId = user?.id

  useEffect(() => {
    if (!userId || !activeOrgId) return

    // Connect to the organization-wide WebSocket
    const userName = encodeURIComponent(user.full_name || user.email || 'Unknown')
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const host = window.location.hostname
    const ws = new WebSocket(`${protocol}//${host}:8000/api/ws/org_${activeOrgId}?user_id=${userId}&user_name=${userName}`)
    wsRef.current = ws
    setWsInstance(ws)

    ws.onopen = () => {
      console.log(`WebSocket connected to org_${activeOrgId}`)
    }

    const handleMessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        
        // Handle typing events
        if (data.type === 'typing') {
          dispatch(setTyping({
            channelId: data.channel_id,
            userId: data.user_id,
            userName: data.user_name,
            isTyping: data.is_typing
          }))
        }

        // Handle user status changes
        if (data.type === 'user_status_updated') {
          dispatch(setMemberStatus({
            userId: data.user_id,
            status: data.status
          }))
        }

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
      setWsInstance(null)
    }

    return () => {
      ws.close()
      wsRef.current = null
      setWsInstance(null)
    }
  }, [activeOrgId, userId, dispatch])

  // We return a function to get the current websocket so consumers always get the latest reference
  const getWs = () => wsRef.current

  return (
    <WebSocketContext.Provider value={{ getWs, ws: wsInstance }}>
      {children}
    </WebSocketContext.Provider>
  )
}

export function useGlobalWebSocket() {
  const ctx = useContext(WebSocketContext)
  if (!ctx) throw new Error('useGlobalWebSocket must be used within WebSocketProvider')
  return ctx
}

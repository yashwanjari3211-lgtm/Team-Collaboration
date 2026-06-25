import { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { addMessage } from '../store/messageSlice'

export const useWebSocket = (roomId) => {
  const dispatch = useDispatch()
  const user = useSelector(state => state.auth.user)
  const wsRef = useRef(null)

  useEffect(() => {
    if (!roomId) return

    // Close previous connection
    if (wsRef.current) {
      wsRef.current.close()
    }

    const userId = user?.id || ''
    const userName = encodeURIComponent(user?.full_name || user?.email || 'Unknown')
    const ws = new WebSocket(`ws://127.0.0.1:8000/api/ws/${roomId}?user_id=${userId}&user_name=${userName}`)
    wsRef.current = ws

    ws.onopen = () => {
      console.log(`WebSocket connected to room ${roomId}`)
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        // Only handle chat messages, ignore call signaling
        if (data.type === 'message' || (!data.type && data.id)) {
          dispatch(addMessage(data))
        }
      } catch (err) {
        console.error('WebSocket message parse error:', err)
      }
    }

    ws.onerror = (err) => {
      console.error('WebSocket error:', err)
    }

    ws.onclose = () => {
      console.log(`WebSocket disconnected from room ${roomId}`)
    }

    return () => {
      ws.close()
      wsRef.current = null
    }
  }, [roomId, dispatch, user])
}

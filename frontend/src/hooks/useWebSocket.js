import { useEffect, useRef } from 'react'
import { useDispatch } from 'react-redux'
import { addMessage } from '../store/messageSlice'

export const useWebSocket = (roomId) => {
  const dispatch = useDispatch()
  const wsRef = useRef(null)

  useEffect(() => {
    if (!roomId) return

    // Close previous connection
    if (wsRef.current) {
      wsRef.current.close()
    }

    const token = localStorage.getItem('token')
    const ws = new WebSocket(`ws://127.0.0.1:8000/api/ws/${roomId}`)
    wsRef.current = ws

    ws.onopen = () => {
      console.log(`WebSocket connected to room ${roomId}`)
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        dispatch(addMessage(data))
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
  }, [roomId, dispatch])
}

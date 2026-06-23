import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { addMessage } from '../store/messageSlice'

export const useWebSocket = (roomId) => {
  const dispatch = useDispatch()

  useEffect(() => {
    if (!roomId) return

    const ws = new WebSocket(`ws://localhost:8000/api/ws/${roomId}`)

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      dispatch(addMessage(data))
    }

    return () => ws.close()
  }, [roomId, dispatch])
}

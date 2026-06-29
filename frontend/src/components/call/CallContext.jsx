import { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react'
import { useSelector } from 'react-redux'
import AgoraRTC from 'agora-rtc-sdk-ng'
import { getAgoraToken } from '../../api/agora'
import { useGlobalWebSocket } from '../../providers/WebSocketProvider'

const CallContext = createContext(null)

export function CallProvider({ children }) {
  const user = useSelector(state => state.auth.user)
  const activeChannelId = useSelector(state => state.channels.activeId)

  // Call state
  const [callState, setCallState] = useState('idle') // idle | ringing | incoming | connected | ended
  const [callType, setCallType] = useState('audio') // audio | video
  const [callId, setCallId] = useState(null)
  const [callerInfo, setCallerInfo] = useState(null)
  
  // Agora state
  const [agoraClient, setAgoraClient] = useState(null)
  const [localAudioTrack, setLocalAudioTrack] = useState(null)
  const [localVideoTrack, setLocalVideoTrack] = useState(null)
  const [localScreenTrack, setLocalScreenTrack] = useState(null)
  const [remoteUsers, setRemoteUsers] = useState([])
  
  // UI toggles
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [isScreenSharing, setIsScreenSharing] = useState(false)


  // Initialize Agora Client on mount
  useEffect(() => {
    const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' })
    setAgoraClient(client)

    return () => {
      client.removeAllListeners()
    }
  }, [])

  // Handle remote users joining/leaving/publishing
  useEffect(() => {
    if (!agoraClient) return

    const handleUserPublished = async (user, mediaType) => {
      await agoraClient.subscribe(user, mediaType)
      
      if (mediaType === 'audio') {
        user.audioTrack?.play()
      }
      
      setRemoteUsers(prev => {
        const existing = prev.find(u => u.uid === user.uid)
        if (existing) {
          return prev.map(u => u.uid === user.uid ? user : u)
        }
        return [...prev, user]
      })
    }

    const handleUserUnpublished = (user, mediaType) => {
      if (mediaType === 'audio') {
        user.audioTrack?.stop()
      }
      if (mediaType === 'video') {
        user.videoTrack?.stop()
      }
      setRemoteUsers(prev => prev.map(u => u.uid === user.uid ? user : u))
    }

    const handleUserJoined = (user) => {
      setRemoteUsers(prev => [...prev, user])
    }

    const handleUserLeft = (user) => {
      setRemoteUsers(prev => prev.filter(u => u.uid !== user.uid))
    }

    agoraClient.on('user-published', handleUserPublished)
    agoraClient.on('user-unpublished', handleUserUnpublished)
    agoraClient.on('user-joined', handleUserJoined)
    agoraClient.on('user-left', handleUserLeft)

    return () => {
      agoraClient.off('user-published', handleUserPublished)
      agoraClient.off('user-unpublished', handleUserUnpublished)
      agoraClient.off('user-joined', handleUserJoined)
      agoraClient.off('user-left', handleUserLeft)
    }
  }, [agoraClient])

  // We use the global websocket for call signaling
  const { getWs, ws } = useGlobalWebSocket()

  // Get or create WebSocket for ringing signaling (we still use this to "ring" someone before Agora connects)
  const getCallWs = useCallback(() => {
    return getWs()
  }, [getWs])

  const handleSignalingMessage = useCallback((data) => {
    switch (data.type) {
      case 'incoming_call':
        if (callState !== 'idle') return // Already in a call
        setCallerInfo({ id: data.caller_id, name: data.caller_name })
        setCallType(data.call_type)
        setCallId(data.call_id)
        setCallState('incoming')
        break

      case 'call_accepted':
        // The person we called accepted. We can now join the Agora channel.
        joinAgoraChannel(callId, callType)
        break

      case 'call_rejected':
        console.log(`${data.rejecter_name} rejected the call`)
        break

      case 'call_ended':
        endCall(false) // Don't send end signal back
        break
    }
  }, [callState, callId, callType])

  // Update the message handler when state changes
  useEffect(() => {
    if (!ws) return

    const handleMessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        handleSignalingMessage(data)
      } catch (err) {
        console.error('Call WS parse error:', err)
      }
    }

    ws.addEventListener('message', handleMessage)
    return () => {
      ws.removeEventListener('message', handleMessage)
    }
  }, [handleSignalingMessage, ws])

  // Agora: Join channel and publish tracks
  const joinAgoraChannel = async (channelName, type) => {
    if (!agoraClient || !user) return
    
    try {
      // 1. Fetch token
      const res = await getAgoraToken(channelName)
      const { token, appId, uid } = res.data

      // 2. Join channel
      await agoraClient.join(appId, channelName, token, uid)
      
      // 3. Create local tracks with safe catch
      const tracksToPublish = []
      
      try {
        const audioTrack = await AgoraRTC.createMicrophoneAudioTrack()
        setLocalAudioTrack(audioTrack)
        tracksToPublish.push(audioTrack)
      } catch (audioErr) {
        console.warn('Microphone permission or hardware missing, joining listen-only mode:', audioErr)
      }
      
      if (type === 'video') {
        try {
          const videoTrack = await AgoraRTC.createCameraVideoTrack()
          setLocalVideoTrack(videoTrack)
          tracksToPublish.push(videoTrack)
        } catch (videoErr) {
          console.warn('Camera permission or hardware missing, joining voice-only/no-video mode:', videoErr)
        }
      }

      // 4. Publish tracks
      if (tracksToPublish.length > 0) {
        await agoraClient.publish(tracksToPublish)
      }
      
      setCallState('connected')
    } catch (err) {
      console.error('Failed to join Agora channel:', err)
      alert('Could not join call. Please check internet connection or server configurations.')
      endCall(true)
    }
  }

  // Initiate a call
  const initiateCall = async (type, targetUserIds) => {
    const id = `call_${Date.now()}_${Math.random().toString(36).slice(2)}`
    setCallId(id)
    setCallType(type)
    setCallState('ringing')

    const ws = getCallWs()
    if (!ws) {
      setCallState('idle')
      return
    }

    const sendInitiate = () => {
      ws.send(JSON.stringify({
        type: 'call_initiate',
        call_type: type,
        call_id: id,
        target_user_ids: targetUserIds,
      }))
    }

    if (ws.readyState === WebSocket.OPEN) {
      sendInitiate()
    } else {
      ws.addEventListener('open', sendInitiate, { once: true })
    }
  }

  // Accept an incoming call
  const acceptCall = async () => {
    const ws = getCallWs()
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'call_accept',
        caller_id: callerInfo?.id,
        call_id: callId,
      }))
    }
    
    // Join Agora channel
    await joinAgoraChannel(callId, callType)
  }

  // Reject an incoming call
  const rejectCall = () => {
    const ws = getCallWs()
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'call_reject',
        caller_id: callerInfo?.id,
        call_id: callId,
      }))
    }
    setCallState('idle')
    setCallerInfo(null)
    setCallId(null)
  }

  // End call
  const endCall = async (sendSignal = true) => {
    if (sendSignal) {
      const ws = getCallWs()
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'call_end',
          call_id: callId,
        }))
      }
    }

    // Close local tracks
    localAudioTrack?.close()
    localVideoTrack?.close()
    localScreenTrack?.close()
    
    // Leave Agora channel
    if (agoraClient) {
      try {
        await agoraClient.leave()
      } catch (err) {
        console.error('Error leaving Agora channel:', err)
      }
    }

    setCallState('idle')
    setLocalAudioTrack(null)
    setLocalVideoTrack(null)
    setLocalScreenTrack(null)
    setRemoteUsers([])
    setCallerInfo(null)
    setCallId(null)
    setIsMuted(false)
    setIsVideoOff(false)
    setIsScreenSharing(false)
  }

  // Toggle mute
  const toggleMute = async () => {
    if (localAudioTrack) {
      await localAudioTrack.setMuted(!isMuted)
      setIsMuted(!isMuted)
    }
  }

  // Toggle video
  const toggleVideo = async () => {
    if (localVideoTrack) {
      await localVideoTrack.setMuted(!isVideoOff)
      setIsVideoOff(!isVideoOff)
    }
  }

  // Toggle screen share
  const toggleScreenShare = async () => {
    if (!agoraClient) return

    if (isScreenSharing) {
      // Stop screen sharing: unpublish screen, republish camera
      try {
        if (localScreenTrack) {
          await agoraClient.unpublish(localScreenTrack)
          localScreenTrack.close()
          setLocalScreenTrack(null)
        }
        
        if (localVideoTrack) {
          await agoraClient.publish(localVideoTrack)
        }
        setIsScreenSharing(false)
      } catch (err) {
        console.error('Failed to stop screen share:', err)
      }
    } else {
      // Start screen sharing: unpublish camera, publish screen
      try {
        const screenTrack = await AgoraRTC.createScreenVideoTrack(
          { encoderConfig: '1080p_1', optimizationMode: 'detail' },
          'auto' // Also capture system audio if possible
        )
        
        // Handle stop from browser UI button
        if (Array.isArray(screenTrack)) {
          screenTrack[0].on('track-ended', () => toggleScreenShare())
        } else {
          screenTrack.on('track-ended', () => toggleScreenShare())
        }
        
        // Agora createScreenVideoTrack might return an array if audio is included
        const trackToPublish = Array.isArray(screenTrack) ? screenTrack[0] : screenTrack

        if (localVideoTrack) {
          await agoraClient.unpublish(localVideoTrack)
        }
        
        await agoraClient.publish(trackToPublish)
        setLocalScreenTrack(trackToPublish)
        setIsScreenSharing(true)
      } catch (err) {
        console.error('Failed to share screen:', err)
      }
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      localAudioTrack?.close()
      localVideoTrack?.close()
      localScreenTrack?.close()
      agoraClient?.leave()
    }
  }, [localAudioTrack, localVideoTrack, localScreenTrack, agoraClient])

  const value = {
    callState,
    callType,
    callId,
    callerInfo,
    agoraClient,
    localAudioTrack,
    localVideoTrack,
    localScreenTrack,
    remoteUsers,
    isMuted,
    isVideoOff,
    isScreenSharing,
    initiateCall,
    acceptCall,
    rejectCall,
    endCall,
    toggleMute,
    toggleVideo,
    toggleScreenShare,
  }

  return (
    <CallContext.Provider value={value}>
      {children}
    </CallContext.Provider>
  )
}

export function useCall() {
  const ctx = useContext(CallContext)
  if (!ctx) throw new Error('useCall must be used within CallProvider')
  return ctx
}

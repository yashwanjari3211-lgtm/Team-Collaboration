import { useRef, useEffect, useState } from 'react'
import { useCall } from './CallContext'
import {
  Mic, MicOff, Video, VideoOff, Phone, PhoneOff,
  Monitor, MonitorOff, Maximize2, Minimize2
} from 'lucide-react'

export default function CallModal() {
  const {
    callState, callType, localVideoTrack, localScreenTrack, remoteUsers,
    isMuted, isVideoOff, isScreenSharing,
    endCall, toggleMute, toggleVideo, toggleScreenShare,
  } = useCall()

  const [isFullscreen, setIsFullscreen] = useState(false)
  const localVideoRef = useRef(null)
  const modalRef = useRef(null)

  // Render local video/screen track
  useEffect(() => {
    if (localVideoRef.current) {
      localVideoRef.current.innerHTML = ''
      
      const trackToPlay = isScreenSharing ? localScreenTrack : localVideoTrack
      
      if (trackToPlay && (!isVideoOff || isScreenSharing)) {
        trackToPlay.play(localVideoRef.current)
      }
    }
  }, [localVideoTrack, localScreenTrack, isScreenSharing, isVideoOff])

  if (callState !== 'ringing' && callState !== 'connected') return null

  const hasRemoteVideo = remoteUsers.some(u => u.hasVideo)

  const toggleFullscreen = () => {
    if (!isFullscreen && modalRef.current) {
      modalRef.current.requestFullscreen?.()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen?.()
      setIsFullscreen(false)
    }
  }

  return (
    <div
      ref={modalRef}
      className={`fixed z-[100] bg-surface-950/95 backdrop-blur-xl flex flex-col ${
        isFullscreen ? 'inset-0' : 'bottom-4 right-4 w-[420px] h-[340px] rounded-2xl shadow-2xl border border-surface-800'
      } animate-slide-in-up overflow-hidden`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-surface-800/50">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${callState === 'connected' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500 animate-pulse'}`} />
          <span className="text-sm font-semibold text-white">
            {callState === 'ringing' ? 'Calling...' : `${callType === 'video' ? 'Video' : 'Voice'} Call`}
            {isScreenSharing && ' (Sharing Screen)'}
          </span>
          {callState === 'connected' && <CallTimer />}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg hover:bg-surface-800 text-surface-400 hover:text-white transition-colors"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Video area */}
      <div className="flex-1 relative flex items-center justify-center bg-black/50">
        {/* Remote videos */}
        {remoteUsers.length > 0 ? (
          <div className={`absolute inset-0 grid gap-1 p-2 ${
            remoteUsers.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
          }`}>
            {remoteUsers.map((user) => (
              <RemoteVideo key={user.uid} user={user} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center">
              {callType === 'video'
                ? <Video className="w-8 h-8 text-white" />
                : <Phone className="w-8 h-8 text-white" />
              }
            </div>
            <p className="text-surface-300 text-sm font-medium">
              {callState === 'ringing' ? 'Waiting for answer...' : 'Connected'}
            </p>
            {callState === 'ringing' && (
              <div className="flex gap-1.5">
                <span className="w-2 h-2 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                <span className="w-2 h-2 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                <span className="w-2 h-2 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
              </div>
            )}
          </div>
        )}

        {/* Local video (PiP) */}
        {(localVideoTrack || localScreenTrack) && (!isVideoOff || isScreenSharing) && (
          <div 
            ref={localVideoRef}
            className={`absolute bottom-3 right-3 w-32 h-24 rounded-xl overflow-hidden shadow-2xl border-2 border-surface-700 bg-surface-900 ${
              !isScreenSharing ? 'mirror' : ''
            }`}
          />
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3 px-4 py-4 border-t border-surface-800/50">
        {/* Mute */}
        <button
          onClick={toggleMute}
          className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
            isMuted
              ? 'bg-rose-500 hover:bg-rose-600 text-white'
              : 'bg-surface-800 hover:bg-surface-700 text-white'
          }`}
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        {/* Video toggle (only for video calls) */}
        {callType === 'video' && (
          <button
            onClick={toggleVideo}
            disabled={isScreenSharing}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
              isVideoOff || isScreenSharing
                ? 'bg-rose-500 hover:bg-rose-600 text-white opacity-50'
                : 'bg-surface-800 hover:bg-surface-700 text-white'
            }`}
            title={isVideoOff ? 'Turn on camera' : 'Turn off camera'}
          >
            {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
          </button>
        )}

        {/* Screen share */}
        <button
          onClick={toggleScreenShare}
          className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
            isScreenSharing
              ? 'bg-brand-500 hover:bg-brand-600 text-white'
              : 'bg-surface-800 hover:bg-surface-700 text-white'
          }`}
          title={isScreenSharing ? 'Stop sharing' : 'Share screen'}
        >
          {isScreenSharing ? <MonitorOff className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
        </button>

        {/* End call */}
        <button
          onClick={() => endCall(true)}
          className="w-14 h-11 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center transition-all shadow-lg shadow-rose-600/30"
          title="End call"
        >
          <PhoneOff className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}

function RemoteVideo({ user }) {
  const videoContainerRef = useRef(null)

  useEffect(() => {
    if (user.videoTrack && videoContainerRef.current) {
      user.videoTrack.play(videoContainerRef.current)
    }
  }, [user.videoTrack])

  return (
    <div className="relative rounded-xl overflow-hidden bg-surface-900 flex items-center justify-center border border-surface-800">
      {user.hasVideo ? (
        <div ref={videoContainerRef} className="w-full h-full" />
      ) : (
        <div className="flex flex-col items-center gap-2">
          <div className="w-16 h-16 rounded-full bg-surface-800 flex items-center justify-center text-xl font-bold text-surface-400">
            {user.uid?.toString().charAt(0) || '?'}
          </div>
          {user.hasAudio && (
            <div className="flex items-center gap-1 bg-surface-800/80 px-2 py-1 rounded-full">
              <Mic className="w-3 h-3 text-emerald-500" />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function CallTimer() {
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => setSeconds(s => s + 1), 1000)
    return () => clearInterval(interval)
  }, [])

  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return (
    <span className="text-xs text-surface-400 font-mono ml-2">
      {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
    </span>
  )
}

import { useCall } from './CallContext'
import { Phone, PhoneOff, Video } from 'lucide-react'

export default function IncomingCallOverlay() {
  const { callState, callType, callerInfo, acceptCall, rejectCall } = useCall()

  if (callState !== 'incoming') return null

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="bg-surface-900 rounded-3xl shadow-2xl border border-surface-700 w-full max-w-xs overflow-hidden animate-slide-in-up">
        {/* Ringing animation header */}
        <div className="relative pt-8 pb-4 px-6 text-center">
          {/* Pulse rings */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ top: '20px' }}>
            <div className="w-24 h-24 rounded-full border-2 border-brand-500/20 animate-ping-slow" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ top: '20px' }}>
            <div className="w-32 h-32 rounded-full border border-brand-500/10 animate-ping-slower" />
          </div>

          {/* Caller avatar */}
          <div className="relative z-10 w-20 h-20 rounded-full bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-brand-500/30">
            <span className="text-2xl font-bold text-white">
              {(callerInfo?.name || '?').charAt(0).toUpperCase()}
            </span>
          </div>

          <h3 className="text-lg font-bold text-white mb-1">{callerInfo?.name || 'Unknown'}</h3>
          <p className="text-sm text-surface-400">
            Incoming {callType === 'video' ? 'video' : 'voice'} call...
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-center gap-8 px-6 py-6">
          {/* Reject */}
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={rejectCall}
              className="w-14 h-14 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center transition-all shadow-lg shadow-rose-600/30 ring-4 ring-rose-600/20"
            >
              <PhoneOff className="w-6 h-6" />
            </button>
            <span className="text-[11px] text-surface-400 font-medium">Decline</span>
          </div>

          {/* Accept */}
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={acceptCall}
              className="w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center transition-all shadow-lg shadow-emerald-500/30 ring-4 ring-emerald-500/20 animate-pulse-call"
            >
              {callType === 'video' ? <Video className="w-6 h-6" /> : <Phone className="w-6 h-6" />}
            </button>
            <span className="text-[11px] text-surface-400 font-medium">Accept</span>
          </div>
        </div>
      </div>
    </div>
  )
}

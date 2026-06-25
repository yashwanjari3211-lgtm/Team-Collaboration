import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { acceptInvite } from '../api/invites'
import { Check, AlertCircle, Loader2 } from 'lucide-react'

export default function AcceptInvitePage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')
  const authToken = useSelector(state => state.auth.token)
  const [status, setStatus] = useState('loading') // loading | success | error | no-auth
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('Invalid invite link — no token provided.')
      return
    }

    if (!authToken) {
      setStatus('no-auth')
      setMessage('Please log in to accept this invite.')
      return
    }

    const accept = async () => {
      try {
        const res = await acceptInvite(token)
        setStatus('success')
        setMessage(res.data.message || 'Invite accepted successfully!')
        setTimeout(() => navigate('/dashboard'), 2000)
      } catch (err) {
        setStatus('error')
        setMessage(err.response?.data?.detail || 'Failed to accept invite. It may be invalid or expired.')
      }
    }
    accept()
  }, [token, authToken, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-950 px-4">
      <div className="bg-surface-900 border border-surface-800 rounded-2xl p-8 max-w-md w-full text-center space-y-4 shadow-2xl">
        {status === 'loading' && (
          <>
            <Loader2 className="w-12 h-12 text-brand-500 animate-spin mx-auto" />
            <h2 className="text-xl font-semibold text-white">Accepting Invite...</h2>
            <p className="text-surface-400 text-sm">Please wait while we process your invite.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto">
              <Check className="w-7 h-7 text-emerald-400" />
            </div>
            <h2 className="text-xl font-semibold text-white">Welcome aboard!</h2>
            <p className="text-surface-400 text-sm">{message}</p>
            <p className="text-surface-500 text-xs">Redirecting to dashboard...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-14 h-14 rounded-full bg-rose-500/20 flex items-center justify-center mx-auto">
              <AlertCircle className="w-7 h-7 text-rose-400" />
            </div>
            <h2 className="text-xl font-semibold text-white">Invite Error</h2>
            <p className="text-surface-400 text-sm">{message}</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="mt-2 px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-lg font-medium text-sm transition-colors"
            >
              Go to Dashboard
            </button>
          </>
        )}

        {status === 'no-auth' && (
          <>
            <div className="w-14 h-14 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto">
              <AlertCircle className="w-7 h-7 text-amber-400" />
            </div>
            <h2 className="text-xl font-semibold text-white">Login Required</h2>
            <p className="text-surface-400 text-sm">{message}</p>
            <button
              onClick={() => navigate(`/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`)}
              className="mt-2 px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-lg font-medium text-sm transition-colors"
            >
              Log In
            </button>
          </>
        )}
      </div>
    </div>
  )
}

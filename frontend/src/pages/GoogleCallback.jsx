import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { googleLogin } from '../api/auth'
import { setCredentials } from '../store/authSlice'
import TeamCollabLogo from '../components/common/TeamCollabLogo'

export default function GoogleCallback() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [error, setError] = useState('')

  useEffect(() => {
    const code = searchParams.get('code')

    if (!code) {
      setError('No authorization code received from Google.')
      return
    }

    const authenticate = async () => {
      try {
        const response = await googleLogin(code)
        dispatch(setCredentials({ token: response.data.access_token }))
        navigate('/dashboard')
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to sign in with Google. Please try again.')
      }
    }

    authenticate()
  }, [searchParams, navigate, dispatch])

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-950 px-6">
      <div className="w-full max-w-sm text-center">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-brand-500/30">
          <TeamCollabLogo size={28} />
        </div>

        {error ? (
          <div className="animate-fade-in">
            <h2 className="text-xl font-bold text-white mb-2">Sign-in failed</h2>
            <p className="text-surface-400 mb-6 text-[14px]">{error}</p>
            <button
              onClick={() => navigate('/login')}
              className="w-full px-4 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold text-[14px] transition-all duration-200 shadow-lg shadow-brand-500/25"
            >
              Back to Sign In
            </button>
          </div>
        ) : (
          <div className="animate-fade-in">
            <div className="w-8 h-8 border-3 border-surface-700 border-t-brand-500 rounded-full animate-spin mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-white mb-1">Signing you in...</h2>
            <p className="text-surface-500 text-[13px]">Connecting with Google</p>
          </div>
        )}
      </div>
    </div>
  )
}

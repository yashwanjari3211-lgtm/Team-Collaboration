import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { login, register, forgotPassword, getGoogleAuthUrl } from '../../api/auth'
import { setCredentials } from '../../store/authSlice'
import { ArrowRight, Eye, EyeOff, Mail, CheckCircle } from 'lucide-react'
import TeamCollabLogo from '../common/TeamCollabLogo'

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')

  // Forgot password state
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotLoading, setForgotLoading] = useState(false)
  const [forgotSuccess, setForgotSuccess] = useState(false)
  const [forgotError, setForgotError] = useState('')

  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isLogin) {
        const response = await login(email, password)
        dispatch(setCredentials({ token: response.data.access_token }))
        navigate('/dashboard')
      } else {
        await register(email, password, fullName)
        const response = await login(email, password)
        dispatch(setCredentials({ token: response.data.access_token }))
        navigate('/dashboard')
      }
    } catch (err) {
      setError(err.response?.data?.detail || (isLogin ? 'Invalid credentials' : 'Registration failed'))
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async (e) => {
    e.preventDefault()
    setForgotError('')
    setForgotLoading(true)

    try {
      await forgotPassword(forgotEmail)
      setForgotSuccess(true)
    } catch (err) {
      setForgotError(err.response?.data?.detail || 'Something went wrong. Please try again.')
    } finally {
      setForgotLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true)
    try {
      const response = await getGoogleAuthUrl()
      window.location.href = response.data.url
    } catch (err) {
      setError('Failed to connect to Google. Please try again.')
      setGoogleLoading(false)
    }
  }

  const closeForgotPassword = () => {
    setShowForgotPassword(false)
    setForgotEmail('')
    setForgotSuccess(false)
    setForgotError('')
  }

  // --- Forgot Password Modal ---
  if (showForgotPassword) {
    return (
      <div className="min-h-screen flex bg-surface-950">
        {/* Left side — Hero (same as login) */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-600 via-violet-600 to-brand-800" />
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-400 rounded-full blur-3xl animate-pulse-soft" />
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-brand-400 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '1s' }} />
          </div>
          <div className="relative z-10 flex flex-col justify-between p-12">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <TeamCollabLogo size={22} />
              </div>
              <span className="text-xl font-bold text-white">Team Collab</span>
            </div>
            <div className="max-w-md">
              <h1 className="text-4xl font-bold text-white mb-4 leading-tight text-balance">
                Reset your password<br />and get back to<br />building.
              </h1>
              <p className="text-lg text-white/70 leading-relaxed">
                We'll send you a secure link to create a new password for your account.
              </p>
            </div>
            <p className="text-sm text-white/40">© 2026 Team Collab. All rights reserved.</p>
          </div>
        </div>

        {/* Right side — Forgot Password Form */}
        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">
            {/* Mobile logo */}
            <div className="lg:hidden flex items-center gap-3 mb-10">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center shadow-lg shadow-brand-500/30">
                <TeamCollabLogo size={22} />
              </div>
              <span className="text-xl font-bold text-white">Team Collab</span>
            </div>

            {forgotSuccess ? (
              /* Success state */
              <div className="animate-fade-in">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-6">
                  <CheckCircle className="w-8 h-8 text-emerald-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Check your email</h2>
                <p className="text-surface-400 mb-2 text-[15px]">
                  If an account exists for <span className="text-white font-medium">{forgotEmail}</span>, we've sent a password reset link.
                </p>
                <p className="text-surface-500 mb-8 text-[13px]">
                  💡 <em>Dev mode: Check your backend terminal console for the reset link.</em>
                </p>
                <button
                  onClick={closeForgotPassword}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-surface-800 hover:bg-surface-700 text-white font-semibold text-[14px] transition-all duration-200 border border-surface-700"
                >
                  <ArrowRight className="w-4 h-4 rotate-180" />
                  Back to sign in
                </button>
              </div>
            ) : (
              /* Form state */
              <>
                <div className="w-14 h-14 rounded-2xl bg-brand-500/10 flex items-center justify-center mb-6">
                  <Mail className="w-7 h-7 text-brand-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-1">Forgot your password?</h2>
                <p className="text-surface-400 mb-8 text-[15px]">
                  Enter your email and we'll send you a link to reset it.
                </p>

                {forgotError && (
                  <div className="mb-6 px-4 py-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm animate-fade-in">
                    {forgotError}
                  </div>
                )}

                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div>
                    <label className="block text-[13px] font-medium text-surface-300 mb-1.5">Email address</label>
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={e => setForgotEmail(e.target.value)}
                      placeholder="you@company.com"
                      required
                      className="w-full px-4 py-3 rounded-xl bg-surface-900 border border-surface-700 text-white placeholder:text-surface-500 text-[14px] focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white font-semibold text-[14px] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 mt-2"
                  >
                    {forgotLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        Send reset link
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                <button
                  onClick={closeForgotPassword}
                  className="mt-6 w-full text-center text-sm text-surface-400 hover:text-surface-300 transition-colors"
                >
                  ← Back to sign in
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    )
  }

  // --- Main Login / Register ---
  return (
    <div className="min-h-screen flex bg-surface-950">
      {/* Left side — Hero */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-600 via-violet-600 to-brand-800" />
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-400 rounded-full blur-3xl animate-pulse-soft" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-brand-400 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '1s' }} />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <TeamCollabLogo size={22} />
            </div>
            <span className="text-xl font-bold text-white">Team Collab</span>
          </div>

          <div className="max-w-md">
            <h1 className="text-4xl font-bold text-white mb-4 leading-tight text-balance">
              Where teams build,<br />ship, and iterate<br />— together.
            </h1>
            <p className="text-lg text-white/70 leading-relaxed">
              Real-time messaging, task management, and seamless workspace collaboration — all in one platform.
            </p>
          </div>

          <p className="text-sm text-white/40">© 2026 Team Collab. All rights reserved.</p>
        </div>
      </div>

      {/* Right side — Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center shadow-lg shadow-brand-500/30">
              <TeamCollabLogo size={22} />
            </div>
            <span className="text-xl font-bold text-white">Team Collab</span>
          </div>

          <h2 className="text-2xl font-bold text-white mb-1">
            {isLogin ? 'Welcome back' : 'Create your account'}
          </h2>
          <p className="text-surface-400 mb-8 text-[15px]">
            {isLogin ? 'Sign in to continue to your workspace.' : 'Start collaborating with your team today.'}
          </p>

          {/* Error */}
          {error && (
            <div className="mb-6 px-4 py-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm animate-fade-in">
              {error}
            </div>
          )}

          {/* Google Sign-In Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-surface-900 border border-surface-700 hover:border-surface-600 hover:bg-surface-800 text-white font-medium text-[14px] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mb-6"
          >
            {googleLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                {/* Google "G" icon */}
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                  <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
                  <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                  <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </>
            )}
          </button>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-surface-800" />
            </div>
            <div className="relative flex justify-center text-[12px]">
              <span className="px-3 bg-surface-950 text-surface-500 uppercase tracking-wider">or continue with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name — register only */}
            {!isLogin && (
              <div className="animate-slide-in-up">
                <label className="block text-[13px] font-medium text-surface-300 mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="Yash Wanjari"
                  className="w-full px-4 py-3 rounded-xl bg-surface-900 border border-surface-700 text-white placeholder:text-surface-500 text-[14px] focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
                />
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-[13px] font-medium text-surface-300 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                className="w-full px-4 py-3 rounded-xl bg-surface-900 border border-surface-700 text-white placeholder:text-surface-500 text-[14px] focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[13px] font-medium text-surface-300">Password</label>
                {isLogin && (
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-[12px] text-brand-400 hover:text-brand-300 font-medium transition-colors"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-surface-900 border border-surface-700 text-white placeholder:text-surface-500 text-[14px] focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-surface-500 hover:text-surface-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white font-semibold text-[14px] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {isLogin ? 'Sign in' : 'Create account'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Toggle */}
          <p className="mt-8 text-center text-sm text-surface-400">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              onClick={() => { setIsLogin(!isLogin); setError('') }}
              className="text-brand-400 hover:text-brand-300 font-medium transition-colors"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

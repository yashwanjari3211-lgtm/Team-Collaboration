import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createOrganization } from '../api/organizations'
import { ArrowRight, Building, Plus } from 'lucide-react'
import TeamCollabLogo from '../components/common/TeamCollabLogo'

export default function OnboardingPage() {
  const navigate = useNavigate()
  const [workspaceName, setWorkspaceName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleCreateWorkspace = async (e) => {
    e.preventDefault()
    if (!workspaceName.trim()) return

    setLoading(true)
    setError('')
    try {
      const res = await createOrganization(workspaceName, '')
      // Set the newly created org as active
      localStorage.setItem('activeOrganizationId', res.data.id)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create workspace. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-950 p-6">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center shadow-lg shadow-brand-500/30 mb-6">
            <TeamCollabLogo size={32} />
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">Welcome to Team Collab</h1>
          <p className="text-surface-400 text-lg">Let's get your team set up and ready to work.</p>
        </div>

        <div className="bg-surface-900 border border-surface-800 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-xl font-bold text-white mb-2">Create a new workspace</h2>
          <p className="text-surface-400 text-sm mb-6">
            Your workspace is where your team will collaborate, chat, and manage tasks.
          </p>

          {error && (
            <div className="mb-6 px-4 py-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleCreateWorkspace} className="space-y-4">
            <div>
              <label className="block text-[13px] font-medium text-surface-300 mb-2">Workspace Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Building className="h-5 w-5 text-surface-500" />
                </div>
                <input
                  type="text"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  placeholder="e.g. Acme Corp"
                  required
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-surface-950 border border-surface-700 text-white placeholder:text-surface-600 text-[15px] focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !workspaceName.trim()}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white font-semibold text-[15px] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 mt-6"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  Create Workspace
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-surface-800 text-center">
            <p className="text-surface-400 text-sm">
              Have an invite link? <br/>
              <span className="text-white mt-1 block">Just paste it in your browser address bar to join your team.</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

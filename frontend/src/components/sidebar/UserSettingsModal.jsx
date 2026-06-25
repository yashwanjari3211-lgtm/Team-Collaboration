import { useState, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setCredentials } from '../../store/authSlice'
import { updateProfile, uploadAvatar } from '../../api/users'
import { X, Camera, Check, Loader2, Mail, User, Calendar } from 'lucide-react'
import Avatar from '../common/Avatar'

export default function UserSettingsModal({ isOpen, onClose }) {
  const dispatch = useDispatch()
  const user = useSelector(state => state.auth.user)
  const [fullName, setFullName] = useState(user?.full_name || '')
  const [isEditingName, setIsEditingName] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(null)
  const fileInputRef = useRef(null)

  if (!isOpen || !user) return null

  const handleNameSave = async () => {
    if (!fullName.trim()) return
    setSaving(true)
    try {
      const res = await updateProfile({ full_name: fullName.trim() })
      dispatch(setCredentials({
        token: localStorage.getItem('token'),
        user: res.data,
      }))
      setIsEditingName(false)
    } catch (err) {
      console.error('Failed to update name:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Show preview immediately
    const reader = new FileReader()
    reader.onload = (ev) => setPreviewUrl(ev.target.result)
    reader.readAsDataURL(file)

    setUploading(true)
    try {
      const res = await uploadAvatar(file)
      dispatch(setCredentials({
        token: localStorage.getItem('token'),
        user: res.data,
      }))
    } catch (err) {
      console.error('Failed to upload avatar:', err)
      setPreviewUrl(null)
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const displayName = user.full_name || user.email || 'User'
  const avatarSrc = previewUrl || user.avatar || null
  const joinDate = user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric'
  }) : 'Unknown'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-surface-900 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-surface-200 dark:border-surface-800 animate-slide-in-up">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-surface-200 dark:border-surface-800">
          <h2 className="font-semibold text-surface-900 dark:text-white">Profile Settings</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-lg transition-colors">
            <X className="w-5 h-5 text-surface-500" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Avatar section */}
          <div className="flex flex-col items-center">
            <div className="relative group">
              {avatarSrc ? (
                <img
                  src={avatarSrc}
                  alt={displayName}
                  className="w-20 h-20 rounded-full object-cover ring-4 ring-surface-100 dark:ring-surface-800"
                />
              ) : (
                <Avatar name={displayName} size="lg" className="!w-20 !h-20 !text-2xl !ring-4 !ring-surface-100 dark:!ring-surface-800" />
              )}

              {/* Upload overlay */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                {uploading ? (
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                ) : (
                  <Camera className="w-6 h-6 text-white" />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>
            <p className="mt-2 text-xs text-surface-400">Click to change photo</p>
          </div>

          {/* User info fields */}
          <div className="space-y-3">
            {/* Name */}
            <div className="flex items-center gap-3 p-3 bg-surface-50 dark:bg-surface-950 rounded-xl border border-surface-200 dark:border-surface-800">
              <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-brand-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-surface-400 mb-0.5">Full Name</p>
                {isEditingName ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="flex-1 px-2 py-1 bg-white dark:bg-surface-900 border border-brand-500 rounded text-sm text-surface-900 dark:text-white focus:outline-none"
                      autoFocus
                      onKeyDown={(e) => e.key === 'Enter' && handleNameSave()}
                    />
                    <button
                      onClick={handleNameSave}
                      disabled={saving}
                      className="p-1 rounded bg-brand-500 text-white hover:bg-brand-600 transition-colors"
                    >
                      {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                ) : (
                  <p
                    className="text-sm font-medium text-surface-900 dark:text-white truncate cursor-pointer hover:text-brand-500 transition-colors"
                    onClick={() => setIsEditingName(true)}
                    title="Click to edit"
                  >
                    {displayName}
                  </p>
                )}
              </div>
            </div>

            {/* Email */}
            <div className="flex items-center gap-3 p-3 bg-surface-50 dark:bg-surface-950 rounded-xl border border-surface-200 dark:border-surface-800">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                <Mail className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-surface-400 mb-0.5">Email</p>
                <p className="text-sm font-medium text-surface-900 dark:text-white truncate">
                  {user.email}
                </p>
              </div>
            </div>

            {/* Joined date */}
            <div className="flex items-center gap-3 p-3 bg-surface-50 dark:bg-surface-950 rounded-xl border border-surface-200 dark:border-surface-800">
              <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-4 h-4 text-violet-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-surface-400 mb-0.5">Joined</p>
                <p className="text-sm font-medium text-surface-900 dark:text-white truncate">
                  {joinDate}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-surface-200 dark:border-surface-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700 text-surface-700 dark:text-surface-300 rounded-lg font-medium text-sm transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

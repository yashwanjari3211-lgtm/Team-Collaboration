import { useState, useEffect, useRef } from 'react'
import TeamCollabLogo from '../common/TeamCollabLogo'
import { UserPlus, ChevronDown, Check, Building, Plus } from 'lucide-react'
import InviteModal from './InviteModal'
import { getOrganizations } from '../../api/organizations'
import { useNavigate } from 'react-router-dom'

export default function WorkspaceSwitcher({ collapsed }) {
  const [isInviteOpen, setIsInviteOpen] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [organizations, setOrganizations] = useState([])
  const [activeOrg, setActiveOrg] = useState(null)
  const dropdownRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchOrgs = async () => {
      try {
        const res = await getOrganizations()
        setOrganizations(res.data)
        const activeId = localStorage.getItem('activeOrganizationId')
        if (activeId) {
          const current = res.data.find(org => org.id === parseInt(activeId, 10))
          if (current) setActiveOrg(current)
          else if (res.data.length > 0) setActiveOrg(res.data[0])
        } else if (res.data.length > 0) {
          setActiveOrg(res.data[0])
        }
      } catch (err) {
        console.error('Failed to fetch organizations:', err)
      }
    }
    fetchOrgs()
  }, [])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSwitchOrg = (org) => {
    localStorage.setItem('activeOrganizationId', org.id)
    setActiveOrg(org)
    setIsOpen(false)
    window.location.reload() // Quick way to reset state for the new workspace
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        onClick={() => !collapsed && setIsOpen(!isOpen)}
        className={`shrink-0 flex items-center gap-3 border-b border-surface-100 dark:border-surface-800 cursor-pointer transition-colors duration-150 ${
          collapsed ? 'justify-center px-2 py-4' : 'px-4 py-4 hover:bg-surface-50 dark:hover:bg-surface-850'
        }`}
      >
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-brand-500/20">
          <TeamCollabLogo size={18} />
        </div>
        {!collapsed && (
          <div className="flex-1 min-w-0 flex items-center justify-between">
            <div className="min-w-0">
              <h1 className="text-sm font-bold text-surface-900 dark:text-white truncate">
                {activeOrg?.name || 'Workspace'}
              </h1>
              <p className="text-[11px] text-surface-400 truncate flex items-center gap-1 font-medium mt-0.5">
                Switch Workspace <ChevronDown className="w-3 h-3" />
              </p>
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); setIsInviteOpen(true); }}
              className="p-1.5 rounded-lg hover:bg-surface-200 dark:hover:bg-surface-700 text-surface-500 dark:text-surface-400 transition-colors"
              title="Invite members"
            >
              <UserPlus className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {!collapsed && isOpen && (
        <div className="absolute top-full left-4 w-64 mt-1 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-xl shadow-xl z-50 overflow-hidden">
          <div className="py-2">
            <div className="px-3 py-2 text-xs font-semibold text-surface-500 uppercase tracking-wider">
              Your Workspaces
            </div>
            <div className="max-h-60 overflow-y-auto">
              {organizations.map(org => (
                <button
                  key={org.id}
                  onClick={() => handleSwitchOrg(org)}
                  className="w-full px-3 py-2 flex items-center justify-between hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
                >
                  <div className="flex items-center gap-2 truncate">
                    <div className="w-6 h-6 rounded bg-surface-200 dark:bg-surface-700 flex items-center justify-center flex-shrink-0 text-xs font-bold text-surface-600 dark:text-surface-300">
                      {org.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-surface-700 dark:text-surface-200 truncate">
                      {org.name}
                    </span>
                  </div>
                  {activeOrg?.id === org.id && (
                    <Check className="w-4 h-4 text-brand-500 flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
            <div className="border-t border-surface-100 dark:border-surface-800 mt-1 pt-1">
              <button
                onClick={() => {
                  setIsOpen(false)
                  navigate('/onboarding')
                }}
                className="w-full px-3 py-2 flex items-center gap-2 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors text-sm text-surface-600 dark:text-surface-300"
              >
                <div className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0">
                  <Plus className="w-4 h-4" />
                </div>
                Create a Workspace
              </button>
            </div>
          </div>
        </div>
      )}

      <InviteModal isOpen={isInviteOpen} onClose={() => setIsInviteOpen(false)} />
    </div>
  )
}

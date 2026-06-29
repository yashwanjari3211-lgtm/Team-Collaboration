import { useState, useEffect } from 'react'
import { Search, MessageSquare } from 'lucide-react'
import { useSelector, useDispatch } from 'react-redux'
import { getOrgMembers } from '../../api/organizations'
import { setActiveDm } from '../../store/channelSlice'
import { setFilter } from '../../store/messageSlice'
import Avatar from '../common/Avatar'

export default function DmDashboard() {
  const dispatch = useDispatch()
  const [members, setMembers] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const currentUser = useSelector(state => state.auth.user)
  const memberStatuses = useSelector(state => state.channels.memberStatuses || {})

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoading(true)
        const res = await getOrgMembers()
        // Filter out current user from dashboard listing
        const others = res.data.filter(m => m.id !== currentUser?.id)
        setMembers(others)
      } catch (err) {
        console.error('Failed to load org members for DM dashboard:', err)
      } finally {
        setLoading(false)
      }
    }
    if (currentUser) {
      fetchMembers()
    }
  }, [currentUser])

  const filteredMembers = members.filter(m =>
    (m.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
    m.email.toLowerCase().includes(search.toLowerCase())
  )

  const handleStartDm = (member) => {
    dispatch(setActiveDm({ userId: member.id, user: member }))
    dispatch(setFilter('all'))
  }

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-surface-50 dark:bg-surface-950 overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 h-16 border-b border-surface-200 dark:border-surface-800 px-6 flex items-center justify-between bg-white dark:bg-surface-900">
        <div>
          <h1 className="text-xl font-bold text-surface-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-brand-500" />
            Direct Messages
          </h1>
          <p className="text-xs text-surface-500 dark:text-surface-400">
            Start a direct message conversation with anyone in your workspace.
          </p>
        </div>
      </header>

      {/* Search & Main List */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="max-w-md relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-450" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-surface-900 dark:text-white text-sm transition-all"
            placeholder="Search team members by name or email..."
          />
        </div>

        {loading ? (
          <div className="flex justify-center p-12">
            <div className="w-8 h-8 rounded-full border-4 border-brand-500/20 border-t-brand-500 animate-spin" />
          </div>
        ) : filteredMembers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMembers.map(member => {
              const presence = memberStatuses[member.id] || member.status || 'online'
              return (
                <div
                  key={member.id}
                  onClick={() => handleStartDm(member)}
                  className="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-800 p-4 hover:border-brand-500 dark:hover:border-brand-500 cursor-pointer shadow-sm transition-all hover:shadow-md flex items-center gap-3.5 group"
                >
                  <Avatar name={member.full_name || member.email} src={member.avatar} size="md" presence={presence} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-bold text-surface-900 dark:text-white truncate group-hover:text-brand-500 transition-colors">
                      {member.full_name || member.email}
                    </p>
                    <p className="text-[11px] text-surface-450 dark:text-surface-400 truncate">{member.email}</p>
                    <div className="mt-1 flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        presence === 'online' ? 'bg-[#10B981]' : presence === 'away' ? 'bg-[#F59E0B]' : 'bg-[#6B7280]'
                      }`} />
                      <span className="text-[10px] text-surface-400 font-medium capitalize">{presence}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center p-12 text-surface-450 dark:text-surface-400 italic bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-800">
            No team members found matching your search.
          </div>
        )}
      </div>
    </div>
  )
}

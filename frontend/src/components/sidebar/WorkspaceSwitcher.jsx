import TeamCollabLogo from '../common/TeamCollabLogo'

export default function WorkspaceSwitcher({ collapsed }) {
  return (
    <div
      className={`flex items-center gap-3 border-b border-surface-100 dark:border-surface-800 cursor-pointer transition-colors duration-150 ${
        collapsed ? 'justify-center px-2 py-4' : 'px-4 py-4 hover:bg-surface-50 dark:hover:bg-surface-850'
      }`}
    >
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-brand-500/20">
        <TeamCollabLogo size={18} />
      </div>
      {!collapsed && (
        <div className="min-w-0">
          <h1 className="text-sm font-bold text-surface-900 dark:text-white truncate">Team Collab</h1>
          <p className="text-[11px] text-surface-400 truncate flex items-center gap-1 font-medium mt-0.5">
            Default Workspace <span className="text-[9px] text-surface-400">▼</span>
          </p>
        </div>
      )}
    </div>
  )
}

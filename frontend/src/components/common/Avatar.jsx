const COLORS = [
  'bg-gradient-to-br from-brand-500 to-amber-600',
  'bg-gradient-to-br from-rose-500 to-pink-600',
  'bg-gradient-to-br from-amber-500 to-orange-600',
  'bg-gradient-to-br from-emerald-500 to-teal-600',
  'bg-gradient-to-br from-studio-500 to-violet-600',
  'bg-gradient-to-br from-violet-500 to-purple-600',
  'bg-gradient-to-br from-pink-500 to-rose-600',
  'bg-gradient-to-br from-teal-500 to-emerald-600',
  'bg-gradient-to-br from-orange-500 to-red-600',
  'bg-gradient-to-br from-sky-500 to-indigo-600',
]

function getInitials(name) {
  if (!name) return '?'
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

function getColor(name) {
  if (!name) return COLORS[0]
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return COLORS[Math.abs(hash) % COLORS.length]
}

const SIZES = {
  xxs: 'w-5 h-5 text-[8px]',
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
}

const PRESENCE_SIZES = {
  xs: 'w-2 h-2',
  sm: 'w-2.5 h-2.5',
  md: 'w-3 h-3',
  lg: 'w-3.5 h-3.5',
}

const PRESENCE_COLORS = {
  online: 'bg-emerald-500',
  away: 'bg-amber-500',
  busy: 'bg-rose-500',
  offline: 'bg-surface-400',
}

export default function Avatar({ name, src, size = 'md', presence, className = '' }) {
  const sizeClass = SIZES[size]
  const initials = getInitials(name)
  const colorClass = getColor(name)

  return (
    <div className={`relative inline-flex flex-shrink-0 ${className}`}>
      {src ? (
        <img
          src={src}
          alt={name}
          className={`${sizeClass} rounded-full object-cover ring-2 ring-surface-950`}
        />
      ) : (
        <div className={`${sizeClass} ${colorClass} rounded-full flex items-center justify-center font-semibold text-white ring-2 ring-surface-950`}>
          {initials}
        </div>
      )}
      {presence && (
        <span
          className={`absolute bottom-0 right-0 ${PRESENCE_SIZES[size]} ${PRESENCE_COLORS[presence]} rounded-full ring-2 ring-surface-950`}
        />
      )}
    </div>
  )
}

export default function Badge({ count, className = '' }) {
  if (!count || count <= 0) return null

  const display = count > 99 ? '99+' : count

  return (
    <span className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[11px] font-semibold text-white bg-brand-500 rounded-full ${className}`}>
      {display}
    </span>
  )
}

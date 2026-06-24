export default function MessageSkeleton() {
  return (
    <div className="space-y-5 p-4">
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className="flex gap-3 animate-pulse" style={{ animationDelay: `${i * 100}ms` }}>
          <div className="w-10 h-10 rounded-full skeleton flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-3.5 w-24 rounded skeleton" />
              <div className="h-3 w-16 rounded skeleton" />
            </div>
            <div className="h-3.5 rounded skeleton" style={{ width: `${40 + Math.random() * 50}%` }} />
            {i % 2 === 0 && <div className="h-3.5 rounded skeleton" style={{ width: `${20 + Math.random() * 30}%` }} />}
          </div>
        </div>
      ))}
    </div>
  )
}

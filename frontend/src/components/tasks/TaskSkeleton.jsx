export default function TaskSkeleton() {
  return (
    <div className="px-3 py-4 space-y-4">
      {['To Do', 'In Progress', 'Done'].map((title, i) => (
        <div key={title}>
          <div className="flex items-center gap-2 mb-2 px-1">
            <div className="w-2 h-2 rounded-full skeleton" />
            <div className="h-3 w-16 rounded skeleton" />
          </div>
          <div className="space-y-2">
            {[1, 2].map(j => (
              <div key={j} className="rounded-lg border border-surface-200 dark:border-surface-700 p-3 animate-pulse" style={{ animationDelay: `${(i * 2 + j) * 100}ms` }}>
                <div className="h-3.5 rounded skeleton mb-2" style={{ width: `${50 + Math.random() * 40}%` }} />
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-5 h-5 rounded-full skeleton" />
                  <div className="h-3 w-14 rounded skeleton" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default function ServicesLoading() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <div className="h-7 w-32 bg-gray-200 rounded-lg" />
          <div className="h-4 w-40 bg-gray-100 rounded" />
        </div>
        <div className="h-9 w-32 bg-gray-200 rounded-lg" />
      </div>

      {/* Category pills */}
      <div className="flex gap-2 flex-wrap">
        {['w-28','w-20','w-16','w-20','w-16','w-24'].map((w, i) => (
          <div key={i} className={`h-8 ${w} bg-gray-200 rounded-full`} />
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="p-4 border-b flex gap-4">
          {['w-40','w-24','w-16','w-20','w-12'].map((w, i) => (
            <div key={i} className={`h-4 ${w} bg-gray-200 rounded`} />
          ))}
        </div>
        {/* Section header */}
        <div className="px-4 py-2 bg-gray-50 border-b">
          <div className="h-5 w-24 bg-gray-200 rounded-full" />
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="p-4 border-b flex gap-4 items-center">
            <div className="w-2.5 h-2.5 bg-gray-200 rounded-full shrink-0" />
            <div className="flex-1">
              <div className="h-4 w-44 bg-gray-200 rounded" />
            </div>
            <div className="h-5 w-20 bg-gray-100 rounded-full" />
            <div className="h-4 w-14 bg-gray-200 rounded" />
            <div className="h-4 w-16 bg-gray-100 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}

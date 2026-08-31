export default function ReportsLoading() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="space-y-2">
        <div className="h-7 w-32 bg-gray-200 rounded-lg" />
        <div className="h-4 w-48 bg-gray-100 rounded" />
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl border p-5 space-y-3">
            <div className="h-4 w-24 bg-gray-100 rounded" />
            <div className="h-8 w-28 bg-gray-200 rounded" />
            <div className="h-3 w-20 bg-gray-100 rounded" />
          </div>
        ))}
      </div>

      {/* Chart skeleton */}
      <div className="bg-white rounded-xl border p-5 space-y-4">
        <div className="h-5 w-36 bg-gray-200 rounded" />
        <div className="flex items-end gap-2 h-32">
          {[60,40,80,55,70,45,90,65,50,75,85,60].map((h, i) => (
            <div key={i} className="flex-1 bg-gray-100 rounded-t" style={{ height: `${h}%` }} />
          ))}
        </div>
      </div>

      {/* Table skeleton */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="p-4 border-b">
          <div className="h-5 w-32 bg-gray-200 rounded" />
        </div>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="p-4 border-b flex gap-4 items-center">
            <div className="w-8 h-8 bg-gray-200 rounded-full shrink-0" />
            <div className="flex-1">
              <div className="h-4 w-32 bg-gray-200 rounded" />
            </div>
            <div className="h-4 w-20 bg-gray-100 rounded" />
            <div className="h-4 w-16 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}

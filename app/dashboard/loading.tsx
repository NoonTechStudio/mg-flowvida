export default function DashboardLoading() {
  return (
    <div className="space-y-5 animate-pulse">
      {/* Date header */}
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <div className="h-7 w-56 bg-gray-200 rounded-lg" />
          <div className="h-4 w-40 bg-gray-100 rounded" />
        </div>
        <div className="h-9 w-28 bg-gray-200 rounded-lg" />
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl border p-4 space-y-3">
            <div className="h-4 w-24 bg-gray-100 rounded" />
            <div className="h-7 w-16 bg-gray-200 rounded" />
          </div>
        ))}
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-xl border p-5 space-y-4">
        <div className="h-5 w-32 bg-gray-200 rounded" />
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex gap-3">
            <div className="h-10 w-10 bg-gray-100 rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-48 bg-gray-200 rounded" />
              <div className="h-3 w-32 bg-gray-100 rounded" />
            </div>
            <div className="h-6 w-20 bg-gray-100 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  )
}

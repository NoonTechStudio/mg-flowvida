export default function StaffLoading() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <div className="h-7 w-32 bg-gray-200 rounded-lg" />
          <div className="h-4 w-36 bg-gray-100 rounded" />
        </div>
        <div className="h-9 w-32 bg-gray-200 rounded-lg" />
      </div>

      {/* Staff cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl border p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-200 rounded-full shrink-0" />
              <div className="space-y-1.5 flex-1">
                <div className="h-5 w-28 bg-gray-200 rounded" />
                <div className="h-4 w-16 bg-gray-100 rounded-full" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-3 w-full bg-gray-100 rounded" />
              <div className="h-3 w-3/4 bg-gray-100 rounded" />
            </div>
            <div className="flex gap-2">
              <div className="h-8 flex-1 bg-gray-100 rounded-lg" />
              <div className="h-8 w-8 bg-gray-100 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

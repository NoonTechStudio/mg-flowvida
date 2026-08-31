export default function CustomersLoading() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <div className="h-7 w-36 bg-gray-200 rounded-lg" />
          <div className="h-4 w-24 bg-gray-100 rounded" />
        </div>
        <div className="h-9 w-36 bg-gray-200 rounded-lg" />
      </div>

      {/* Search bar */}
      <div className="h-10 w-full bg-gray-100 rounded-lg" />

      {/* Table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="p-4 border-b flex gap-4">
          {['w-32','w-24','w-20','w-28','w-16'].map((w, i) => (
            <div key={i} className={`h-4 ${w} bg-gray-200 rounded`} />
          ))}
        </div>
        {[...Array(6)].map((_, i) => (
          <div key={i} className="p-4 border-b flex gap-4 items-center">
            <div className="w-9 h-9 bg-gray-200 rounded-full shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-4 w-36 bg-gray-200 rounded" />
              <div className="h-3 w-28 bg-gray-100 rounded" />
            </div>
            <div className="h-4 w-16 bg-gray-100 rounded" />
            <div className="h-4 w-20 bg-gray-100 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}

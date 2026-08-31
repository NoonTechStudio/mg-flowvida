export default function AppointmentsLoading() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <div className="h-7 w-40 bg-gray-200 rounded-lg" />
          <div className="h-4 w-28 bg-gray-100 rounded" />
        </div>
        <div className="h-9 w-36 bg-gray-200 rounded-lg" />
      </div>

      {/* Tab bar */}
      <div className="flex gap-2">
        <div className="h-9 w-24 bg-gray-200 rounded-full" />
        <div className="h-9 w-28 bg-gray-100 rounded-full" />
      </div>

      {/* Appointment cards */}
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl border p-4 flex gap-4">
            <div className="w-14 space-y-1 shrink-0">
              <div className="h-4 w-12 bg-gray-200 rounded" />
              <div className="h-3 w-10 bg-gray-100 rounded" />
            </div>
            <div className="flex-1 space-y-2">
              <div className="h-5 w-36 bg-gray-200 rounded" />
              <div className="h-3 w-48 bg-gray-100 rounded" />
            </div>
            <div className="h-6 w-20 bg-gray-100 rounded-full shrink-0" />
          </div>
        ))}
      </div>
    </div>
  )
}

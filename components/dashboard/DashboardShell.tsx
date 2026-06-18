'use client'

import { useState } from 'react'
import { DashboardSidebar } from './DashboardSidebar'
import { DashboardHeader } from './DashboardHeader'

interface DashboardShellProps {
  userRole: string
  user: {
    name?: string | null
    role?: string
    tenantId?: string
  }
  businessName: string
  children: React.ReactNode
}

export function DashboardShell({ userRole, user, businessName, children }: DashboardShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <DashboardSidebar
        userRole={userRole}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <DashboardHeader
          user={user}
          businessName={businessName}
          onMobileMenuToggle={() => setMobileOpen(true)}
        />
        {/* pb-20 on mobile for bottom nav bar spacing */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6">
          {children}
        </main>
      </div>
    </div>
  )
}

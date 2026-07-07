'use client'

import { useState } from 'react'
import { DashboardSidebar } from './DashboardSidebar'
import { DashboardHeader } from './DashboardHeader'
import { TrialBanner } from '@/components/TrialBanner'

interface DashboardShellProps {
  userRole: string
  user: {
    name?: string | null
    role?: string
    tenantId?: string
  }
  businessName: string
  children: React.ReactNode
  subscriptionStatus?: 'trial' | 'active' | 'expired'
  trialDaysRemaining?: number
}

export function DashboardShell({ userRole, user, businessName, children, subscriptionStatus, trialDaysRemaining }: DashboardShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex h-screen bg-[#F8F6F1] overflow-hidden">
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
        <TrialBanner
          status={subscriptionStatus ?? 'active'}
          daysRemaining={trialDaysRemaining ?? 0}
        />
        {/* pb-20 on mobile for bottom nav bar spacing */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6">
          {children}
        </main>
      </div>
    </div>
  )
}

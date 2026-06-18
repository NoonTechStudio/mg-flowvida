'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { WalkInModal } from '@/components/dashboard/WalkInModal'
import { UserPlus } from 'lucide-react'

interface WalkInButtonProps {
  services: any[]
  staff: any[]
  tenantId: string
  userId: string
}

export function WalkInButton({ services, staff, tenantId, userId }: WalkInButtonProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setOpen(true)} className="gap-2">
        <UserPlus className="w-4 h-4" />
        Walk-in
      </Button>

      <WalkInModal
        open={open}
        onClose={() => setOpen(false)}
        services={services}
        staff={staff}
        tenantId={tenantId}
        userId={userId}
      />
    </>
  )
}

'use client'

import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/components/auth-provider'
import type { Permission } from '@/components/auth-provider'
import { cn } from '@/lib/utils'

// Renders an action button only for Admins. Viewers see a disabled,
// tooltip-style hint that the action is read-only.
export function AdminAction({
  permission,
  label,
  icon: Icon = Plus,
  size = 'sm',
  variant = 'default',
  className,
  onAction,
}: {
  permission: Permission
  label: string
  icon?: React.ComponentType<{ className?: string }>
  size?: 'sm' | 'default'
  variant?: 'default' | 'outline' | 'ghost'
  className?: string
  onAction?: () => void
}) {
  const { can } = useAuth()
  const allowed = can(permission)

  return (
    <Button
      size={size}
      variant={allowed ? variant : 'outline'}
      disabled={!allowed}
      className={cn(className)}
      onClick={() => allowed && onAction?.()}
      title={allowed ? undefined : 'Viewers have read-only access'}
    >
      <Icon className="size-4" />
      {label}
    </Button>
  )
}

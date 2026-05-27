import { cn } from '@/lib/utils'
import { CheckCircle, Clock, AlertTriangle } from 'lucide-react'
import type { ClientStatus } from '@/types'
import type { LucideIcon } from 'lucide-react'

const config: Record<ClientStatus, { label: string; icon: LucideIcon; className: string }> = {
  updated: {
    label: 'Actualizado',
    icon: CheckCircle,
    className: 'text-success border-success/30 bg-success/5',
  },
  pending: {
    label: 'Pendiente',
    icon: Clock,
    className: 'text-warning border-warning/30 bg-warning/5',
  },
  error: {
    label: 'Error',
    icon: AlertTriangle,
    className: 'text-destructive border-destructive/30 bg-destructive/5',
  },
}

interface StatusBadgeProps {
  status: ClientStatus
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const { label, icon: Icon, className: statusClass } = config[status]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium',
        statusClass,
        className,
      )}
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
    </span>
  )
}

import { cn } from '@/lib/utils'
import type { ClientStatus } from '@/types'

const config: Record<ClientStatus, { label: string; className: string }> = {
  updated: {
    label: 'Actualizado',
    className: 'bg-green-100 text-green-800 border-green-200',
  },
  pending: {
    label: 'Pendiente',
    className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  },
  error: {
    label: 'Error',
    className: 'bg-red-100 text-red-800 border-red-200',
  },
}

interface StatusBadgeProps {
  status: ClientStatus
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const { label, className: statusClass } = config[status]
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold',
        statusClass,
        className,
      )}
    >
      {label}
    </span>
  )
}

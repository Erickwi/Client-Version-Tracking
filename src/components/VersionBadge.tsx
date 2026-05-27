import { cn } from '@/lib/utils'
import type { SystemVersion } from '@/types'

interface VersionBadgeProps {
  version: SystemVersion | { version_number: string }
  isLatest?: boolean
  className?: string
}

export function VersionBadge({ version, isLatest, className }: VersionBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-md border px-2.5 py-1 font-mono text-xs font-medium',
        isLatest
          ? 'border-primary/30 bg-primary/5 text-primary'
          : 'border-border bg-secondary/30 text-muted-foreground',
        className,
      )}
    >
      <span className={cn(isLatest && 'text-primary')}>v{version.version_number}</span>
      {isLatest && (
        <span className="rounded bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground leading-none tracking-wider">
          LATEST
        </span>
      )}
    </span>
  )
}

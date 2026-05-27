import { cn } from '@/lib/utils'
import type { SystemVersion } from '@/types'

interface VersionBadgeProps {
  version: SystemVersion
  isLatest?: boolean
  className?: string
}

export function VersionBadge({ version, isLatest, className }: VersionBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md border px-2 py-0.5 font-mono text-xs',
        isLatest
          ? 'border-blue-300 bg-blue-50 text-blue-700'
          : 'border-gray-200 bg-gray-50 text-gray-600',
        className,
      )}
    >
      v{version.version_number}
      {isLatest && (
        <span className="rounded bg-blue-600 px-1 py-0.5 text-[10px] font-semibold text-white leading-none">
          LATEST
        </span>
      )}
    </span>
  )
}

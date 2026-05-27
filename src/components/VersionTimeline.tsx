import { useStore } from '@nanostores/react'
import { $latestVersion } from '@/stores/versions'
import { VersionBadge } from '@/components/VersionBadge'
import type { ClientVersionHistory } from '@/types'

interface VersionTimelineProps {
  history: ClientVersionHistory[]
}

export function VersionTimeline({ history }: VersionTimelineProps) {
  const latestVersion = useStore($latestVersion)

  if (history.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">
        Sin historial de versiones registrado.
      </p>
    )
  }

  return (
    <ol className="relative border-l-2 border-border space-y-8 ml-4">
      {history.map((entry, index) => {
        const version = entry.system_versions
        const isLatest = version?.is_latest ?? false
        const isCurrent = index === 0
        return (
          <li key={entry.id} className="ml-8">
            <span
              className={`absolute -left-[11px] flex h-5 w-5 items-center justify-center rounded-full ring-[5px] ring-card ${
                isCurrent ? 'bg-primary' : 'bg-secondary'
              }`}
            />
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {version ? (
                <VersionBadge version={version} isLatest={isLatest} />
              ) : (
                <span className="text-xs text-muted-foreground font-mono">Versión desconocida</span>
              )}
              {isCurrent && (
                <span className="text-[11px] font-medium text-primary tracking-wider uppercase">
                  — Actual
                </span>
              )}
            </div>
            <time className="block text-xs text-muted-foreground font-mono">
              {new Date(entry.installed_at).toLocaleDateString('es-MX', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                timeZone: 'UTC',
              })}
            </time>
            {entry.notes && (
              <p className="mt-2 text-sm text-muted-foreground/80 leading-relaxed">{entry.notes}</p>
            )}
          </li>
        )
      })}
    </ol>
  )
}

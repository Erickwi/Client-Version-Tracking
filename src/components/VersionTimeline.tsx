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
      <p className="text-sm text-gray-400 py-4">
        Sin historial de versiones registrado.
      </p>
    )
  }

  return (
    <ol className="relative border-l border-gray-200 space-y-6 ml-3">
      {history.map((entry, index) => {
        const version = entry.system_versions
        const isLatest = version?.is_latest ?? false
        const isCurrent = index === 0
        return (
          <li key={entry.id} className="ml-6">
            <span
              className={`absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full ring-8 ring-white ${
                isCurrent ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <svg className="h-2.5 w-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a8 8 0 100 16A8 8 0 0010 2z" />
              </svg>
            </span>
            <div className="flex items-center gap-2 mb-1">
              {version ? (
                <VersionBadge version={version} isLatest={isLatest} />
              ) : (
                <span className="text-xs text-gray-400">Versión desconocida</span>
              )}
              {isCurrent && (
                <span className="text-xs font-medium text-blue-600">Versión actual</span>
              )}
            </div>
            <time className="block text-xs text-gray-500">
              {new Date(entry.installed_at).toLocaleDateString('es-MX', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                timeZone: 'UTC',
              })}
            </time>
            {entry.notes && (
              <p className="mt-1 text-sm text-gray-600">{entry.notes}</p>
            )}
          </li>
        )
      })}
    </ol>
  )
}

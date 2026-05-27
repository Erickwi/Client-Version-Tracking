import { useEffect } from 'react'
import { useStore } from '@nanostores/react'
import { $stats, fetchClients } from '@/stores/clients'
import { $versions, $latestVersion, fetchVersions } from '@/stores/versions'
import { Users, CheckCircle, Clock, AlertCircle, ArrowUpRight } from 'lucide-react'
import { VersionBadge } from '@/components/VersionBadge'

export function Dashboard() {
  const stats = useStore($stats)
  const versions = useStore($versions)
  const latestVersion = useStore($latestVersion)

  useEffect(() => {
    fetchClients()
    fetchVersions()
  }, [])

  const progress = stats.total > 0 ? Math.round((stats.updated / stats.total) * 100) : 0

  const statCards = [
    {
      label: 'Total Clientes',
      value: stats.total,
      icon: Users,
      color: 'text-foreground',
      bgAccent: 'bg-secondary/50',
    },
    {
      label: 'Actualizados',
      value: stats.updated,
      icon: CheckCircle,
      color: 'text-success',
      bgAccent: 'bg-success/10',
    },
    {
      label: 'Pendientes',
      value: stats.pending,
      icon: Clock,
      color: 'text-warning',
      bgAccent: 'bg-warning/10',
    },
    {
      label: 'Con Error',
      value: stats.error,
      icon: AlertCircle,
      color: 'text-destructive',
      bgAccent: 'bg-destructive/10',
    },
  ]

  const today = new Date().toLocaleDateString('es-MX', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-4xl sm:text-5xl tracking-[0.05em] text-foreground leading-none">
            PANEL DE CONTROL
          </h1>
          <p className="text-muted-foreground font-body text-sm mt-2 capitalize">
            {today}
          </p>
        </div>
        {latestVersion && (
          <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-lg px-4 py-2.5 shrink-0">
            <ArrowUpRight className="w-4 h-4 text-primary" />
            <span className="text-xs font-medium text-muted-foreground">Última versión:</span>
            <VersionBadge version={latestVersion} isLatest />
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="relative overflow-hidden rounded-xl border border-border bg-card p-5 transition-all duration-300 hover:border-primary/30 group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-2 rounded-lg ${card.bgAccent}`}>
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </div>
            </div>
            <div className={`font-heading text-3xl sm:text-4xl tracking-wider ${card.color}`}>
              {card.value}
            </div>
            <p className="text-muted-foreground text-xs font-medium mt-1 uppercase tracking-wider">
              {card.label}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="rounded-xl border border-border bg-card p-6 lg:col-span-1">
          <h2 className="font-heading text-xl tracking-[0.08em] text-foreground mb-6">
            PROGRESO
          </h2>
          <div className="flex flex-col items-center justify-center py-4">
            <div className="relative w-32 h-32 mb-4">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle
                  cx="18" cy="18" r="15.5"
                  fill="none"
                  stroke="hsl(var(--secondary))"
                  strokeWidth="3"
                />
                <circle
                  cx="18" cy="18" r="15.5"
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="3"
                  strokeDasharray={`${progress * 0.979} 100`}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-heading text-3xl text-primary">{progress}%</span>
              </div>
            </div>
            <p className="text-muted-foreground text-xs font-medium">de clientes actualizados</p>
          </div>
          <div className="space-y-3 mt-2">
            <div className="flex justify-between text-xs">
              <span className="text-success font-medium">{stats.updated} actualizados</span>
              <span className="text-muted-foreground">{stats.total - stats.updated} restantes</span>
            </div>
            <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-success rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-heading text-xl tracking-[0.08em] text-foreground">
              VERSIONES DEL SISTEMA
            </h2>
            <span className="text-xs text-muted-foreground font-mono">
              {versions.length} registradas
            </span>
          </div>
          {versions.length > 0 ? (
            <div className="space-y-2">
              {versions.slice(0, 6).map((v, i) => (
                <div
                  key={v.id}
                  className="flex items-center justify-between px-4 py-3 rounded-lg bg-secondary/20 hover:bg-secondary/40 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-muted-foreground font-mono text-xs tabular-nums w-5 shrink-0">
                      {String(versions.length - i).padStart(2, '0')}
                    </span>
                    <VersionBadge version={v} isLatest={v.is_latest} />
                    {v.changelog && (
                      <span className="text-sm text-muted-foreground truncate hidden sm:block max-w-[280px]">
                        {v.changelog}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground font-mono shrink-0">
                    {new Date(v.release_date).toLocaleDateString('es-MX', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      timeZone: 'UTC',
                    })}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm text-center py-8">
              No hay versiones registradas
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

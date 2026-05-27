import { useEffect } from 'react'
import { useStore } from '@nanostores/react'
import { $stats, fetchClients } from '@/stores/clients'
import { $versions, $latestVersion, fetchVersions } from '@/stores/versions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, CheckCircle, Clock, AlertCircle } from 'lucide-react'

export function Dashboard() {
  const stats = useStore($stats)
  const versions = useStore($versions)
  const latestVersion = useStore($latestVersion)

  useEffect(() => {
    fetchClients()
    fetchVersions()
  }, [])

  const updatedPct = stats.total > 0 ? Math.round((stats.updated / stats.total) * 100) : 0

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">
          Resumen del estado de actualización de clientes
          {latestVersion && (
            <> — versión actual del sistema: <strong>v{latestVersion.version_number}</strong></>
          )}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total clientes"
          value={stats.total}
          icon={<Users className="h-4 w-4 text-gray-500" />}
        />
        <StatCard
          title="Actualizados"
          value={stats.updated}
          icon={<CheckCircle className="h-4 w-4 text-green-500" />}
          valueClass="text-green-600"
        />
        <StatCard
          title="Pendientes"
          value={stats.pending}
          icon={<Clock className="h-4 w-4 text-yellow-500" />}
          valueClass="text-yellow-600"
        />
        <StatCard
          title="Con error"
          value={stats.error}
          icon={<AlertCircle className="h-4 w-4 text-red-500" />}
          valueClass="text-red-600"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Progreso de actualización</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">{stats.updated} de {stats.total} clientes actualizados</span>
            <span className="font-semibold">{updatedPct}%</span>
          </div>
          <div className="h-3 w-full rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-green-500 transition-all duration-500"
              style={{ width: `${updatedPct}%` }}
            />
          </div>
          {stats.pending > 0 && (
            <p className="text-xs text-yellow-600">
              {stats.pending} cliente{stats.pending > 1 ? 's' : ''} aún pendiente{stats.pending > 1 ? 's' : ''} de actualizar
            </p>
          )}
        </CardContent>
      </Card>

      {versions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Versiones del sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {versions.map((v) => (
                <div key={v.id} className="flex items-center justify-between text-sm py-1 border-b last:border-0">
                  <span className="font-mono font-medium">v{v.version_number}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400">
                      {new Date(v.release_date).toLocaleDateString('es-MX', { timeZone: 'UTC' })}
                    </span>
                    {v.is_latest && (
                      <span className="rounded bg-blue-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                        LATEST
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function StatCard({
  title,
  value,
  icon,
  valueClass = '',
}: {
  title: string
  value: number
  icon: React.ReactNode
  valueClass?: string
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-500">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className={`text-3xl font-bold ${valueClass}`}>{value}</div>
      </CardContent>
    </Card>
  )
}

import { Link } from 'react-router-dom'
import { useStore } from '@nanostores/react'
import { $filteredClients, $filters } from '@/stores/clients'
import { $latestVersion } from '@/stores/versions'
import { StatusBadge } from '@/components/StatusBadge'
import { VersionBadge } from '@/components/VersionBadge'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { ClientStatus } from '@/types'

export function ClientTable() {
  const clients = useStore($filteredClients)
  const filters = useStore($filters)
  const latestVersion = useStore($latestVersion)

  return (
    <div className="space-y-4">
      <div className="flex gap-3 flex-wrap">
        <Input
          placeholder="Buscar cliente..."
          value={filters.search}
          onChange={(e) => $filters.set({ ...filters, search: e.target.value })}
          className="max-w-xs"
        />
        <Select
          value={filters.status}
          onChange={(e) =>
            $filters.set({ ...filters, status: e.target.value as ClientStatus | 'all' })
          }
          className="w-40"
        >
          <option value="all">Todos los estados</option>
          <option value="updated">Actualizados</option>
          <option value="pending">Pendientes</option>
          <option value="error">Con error</option>
        </Select>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Versión actual</TableHead>
              <TableHead>Última actualización</TableHead>
              <TableHead>Notas</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-gray-400 py-8">
                  No se encontraron clientes
                </TableCell>
              </TableRow>
            ) : (
              clients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">
                    <Link
                      to={`/clients/${client.id}`}
                      className="hover:underline text-blue-600"
                    >
                      {client.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={client.status} />
                  </TableCell>
                  <TableCell>
                    {latestVersion ? (
                      <VersionBadge
                        version={latestVersion}
                        isLatest={client.status === 'updated'}
                      />
                    ) : (
                      <span className="text-gray-400 text-xs">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {client.latest_installed_at
                      ? new Date(client.latest_installed_at).toLocaleDateString('es-MX', { timeZone: 'UTC' })
                      : '—'}
                  </TableCell>
                  <TableCell className="text-sm text-gray-500 max-w-xs truncate">
                    {client.notes ?? '—'}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

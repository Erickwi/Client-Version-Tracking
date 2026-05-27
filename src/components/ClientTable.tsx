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
import { Search } from 'lucide-react'
import type { ClientStatus } from '@/types'

export function ClientTable() {
  const clients = useStore($filteredClients)
  const filters = useStore($filters)
  const latestVersion = useStore($latestVersion)

  return (
    <div className="space-y-4">
      <div className="flex gap-3 flex-wrap items-center">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar cliente..."
            value={filters.search}
            onChange={(e) => $filters.set({ ...filters, search: e.target.value })}
            className="pl-9"
          />
        </div>
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

      <div className="rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/30">
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Cliente
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Estado
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Versión actual
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden md:table-cell">
                Última actualización
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden lg:table-cell">
                Notas
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-12 text-sm">
                  No se encontraron clientes
                </TableCell>
              </TableRow>
            ) : (
              clients.map((client) => (
                <TableRow
                  key={client.id}
                  className="hover:bg-secondary/20 transition-colors"
                >
                  <TableCell>
                    <Link
                      to={`/clients/${client.id}`}
                      className="font-medium text-foreground hover:text-primary transition-colors"
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
                      <span className="text-muted-foreground text-xs font-mono">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground font-mono hidden md:table-cell">
                    {client.latest_installed_at
                      ? new Date(client.latest_installed_at).toLocaleDateString('es-MX', { timeZone: 'UTC' })
                      : '—'}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate hidden lg:table-cell">
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

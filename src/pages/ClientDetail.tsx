import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useStore } from '@nanostores/react'
import { $versions, fetchVersions } from '@/stores/versions'
import { updateClient, deleteClient, addVersionToClient } from '@/stores/clients'
import type { ClientWithHistory, ClientStatus } from '@/types'
import { fetchClientWithHistory } from '@/stores/clients'
import { StatusBadge } from '@/components/StatusBadge'
import { VersionTimeline } from '@/components/VersionTimeline'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Pencil, Trash2, Plus } from 'lucide-react'

export function ClientDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const versions = useStore($versions)

  const [client, setClient] = useState<ClientWithHistory | null>(null)
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [name, setName] = useState('')
  const [notes, setNotes] = useState('')
  const [status, setStatus] = useState<ClientStatus>('pending')
  const [saving, setSaving] = useState(false)

  const [showAddVersion, setShowAddVersion] = useState(false)
  const [selectedVersionId, setSelectedVersionId] = useState('')
  const [versionNotes, setVersionNotes] = useState('')
  const [addingVersion, setAddingVersion] = useState(false)

  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchVersions()
    load()
  }, [id])

  async function load() {
    if (!id) return
    setLoading(true)
    try {
      const data = await fetchClientWithHistory(id)
      if (data) {
        setClient(data)
        setName(data.name)
        setNotes(data.notes ?? '')
        setStatus(data.status)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar')
    } finally {
      setLoading(false)
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!id) return
    setSaving(true)
    setError(null)
    try {
      await updateClient(id, { name, notes: notes || undefined, status })
      await load()
      setEditMode(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!id || !confirm(`¿Eliminar a "${client?.name}"? Esta acción no se puede deshacer.`)) return
    await deleteClient(id)
    navigate('/clients')
  }

  async function handleAddVersion(e: React.FormEvent) {
    e.preventDefault()
    if (!id || !selectedVersionId) return
    setAddingVersion(true)
    setError(null)
    try {
      await addVersionToClient(id, selectedVersionId, versionNotes || undefined)
      // Auto-update status to updated if latest version selected
      const ver = versions.find((v) => v.id === selectedVersionId)
      if (ver?.is_latest) {
        await updateClient(id, { status: 'updated' })
      }
      setSelectedVersionId('')
      setVersionNotes('')
      setShowAddVersion(false)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrar versión')
    } finally {
      setAddingVersion(false)
    }
  }

  if (loading) {
    return <div className="text-gray-400 py-12 text-center">Cargando...</div>
  }
  if (!client) {
    return <div className="text-red-500 py-12 text-center">Cliente no encontrado</div>
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/clients')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">{client.name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <StatusBadge status={client.status} />
            <span className="text-xs text-gray-400">
              Actualizado {new Date(
                client.client_version_history[0]?.installed_at ?? client.updated_at
              ).toLocaleDateString('es-MX', { timeZone: 'UTC' })}
            </span>
          </div>
        </div>
        <Button variant="outline" size="icon" onClick={() => setEditMode((v) => !v)}>
          <Pencil className="h-4 w-4" />
        </Button>
        <Button variant="destructive" size="icon" onClick={handleDelete}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {editMode && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Editar cliente</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">Nombre</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Estado</label>
                <Select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ClientStatus)}
                >
                  <option value="updated">Actualizado</option>
                  <option value="pending">Pendiente</option>
                  <option value="error">Error</option>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Notas</label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <div className="flex gap-2">
                <Button type="submit" disabled={saving}>
                  {saving ? 'Guardando...' : 'Guardar cambios'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setEditMode(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Historial de versiones</CardTitle>
          <Button size="sm" variant="outline" onClick={() => setShowAddVersion((v) => !v)}>
            <Plus className="h-3 w-3" />
            Registrar versión
          </Button>
        </CardHeader>
        <CardContent>
          {showAddVersion && (
            <form onSubmit={handleAddVersion} className="mb-6 space-y-3 p-4 bg-gray-50 rounded-lg border">
              <div className="space-y-1">
                <label className="text-sm font-medium">Versión instalada</label>
                <Select
                  value={selectedVersionId}
                  onChange={(e) => setSelectedVersionId(e.target.value)}
                  required
                >
                  <option value="">Seleccionar versión...</option>
                  {versions.map((v) => (
                    <option key={v.id} value={v.id}>
                      v{v.version_number}{v.is_latest ? ' (latest)' : ''}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Notas</label>
                <Input
                  value={versionNotes}
                  onChange={(e) => setVersionNotes(e.target.value)}
                  placeholder="Ej: Actualización sin incidencias"
                />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <div className="flex gap-2">
                <Button type="submit" size="sm" disabled={addingVersion || !selectedVersionId}>
                  {addingVersion ? 'Registrando...' : 'Registrar'}
                </Button>
                <Button type="button" size="sm" variant="outline" onClick={() => setShowAddVersion(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          )}
          <VersionTimeline history={client.client_version_history} />
        </CardContent>
      </Card>

      {client.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Notas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 whitespace-pre-wrap">{client.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

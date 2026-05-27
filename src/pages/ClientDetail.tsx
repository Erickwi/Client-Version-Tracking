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
import { ArrowLeft, Pencil, Trash2, Plus, History } from 'lucide-react'

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
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <p className="text-destructive font-medium">Cliente no encontrado</p>
        <Button variant="outline" onClick={() => navigate('/clients')}>
          <ArrowLeft className="w-4 h-4" />
          Volver a clientes
        </Button>
      </div>
    )
  }

  const lastUpdate = client.client_version_history[0]?.installed_at ?? client.updated_at

  return (
    <div className="space-y-8 max-w-3xl">
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/clients')} className="mt-1 shrink-0 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h1 className="font-heading text-3xl sm:text-4xl tracking-[0.03em] text-foreground leading-none truncate">
                {client.name}
              </h1>
              <div className="flex items-center gap-3 mt-3 flex-wrap">
                <StatusBadge status={client.status} />
                <span className="text-xs text-muted-foreground font-mono">
                  Actualizado el{' '}
                  {new Date(lastUpdate).toLocaleDateString('es-MX', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    timeZone: 'UTC',
                  })}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setEditMode((v) => !v)}
                className={editMode ? 'border-primary text-primary' : ''}
              >
                <Pencil className="w-4 h-4" />
              </Button>
              <Button variant="destructive" size="icon" onClick={handleDelete}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {editMode && (
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="font-heading text-lg tracking-[0.08em] text-foreground mb-5">
            EDITAR CLIENTE
          </h2>
          <form onSubmit={handleSave} className="space-y-4 max-w-lg">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Nombre</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Estado</label>
              <Select
                value={status}
                onChange={(e) => setStatus(e.target.value as ClientStatus)}
              >
                <option value="updated">Actualizado</option>
                <option value="pending">Pendiente</option>
                <option value="error">Error</option>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Notas</label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex gap-2">
              <Button type="submit" disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setEditMode(false)}>
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-muted-foreground" />
            <h2 className="font-heading text-lg tracking-[0.08em] text-foreground">
              HISTORIAL DE VERSIONES
            </h2>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowAddVersion((v) => !v)}
            className={showAddVersion ? 'border-primary text-primary' : ''}
          >
            <Plus className="w-3.5 h-3.5" />
            Registrar versión
          </Button>
        </div>

        {showAddVersion && (
          <form onSubmit={handleAddVersion} className="mb-6 p-5 rounded-lg bg-secondary/20 border border-border space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Nueva instalación</h3>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Versión instalada</label>
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
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Notas</label>
              <Input
                value={versionNotes}
                onChange={(e) => setVersionNotes(e.target.value)}
                placeholder="Ej: Actualización sin incidencias"
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex gap-2">
              <Button type="submit" size="sm" disabled={addingVersion || !selectedVersionId}>
                {addingVersion ? 'Registrando...' : 'Registrar'}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setShowAddVersion(false)}
              >
                Cancelar
              </Button>
            </div>
          </form>
        )}

        <VersionTimeline history={client.client_version_history} />
      </div>

      {client.notes && (
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="font-heading text-lg tracking-[0.08em] text-foreground mb-4">
            NOTAS
          </h2>
          <p className="text-sm text-muted-foreground/80 whitespace-pre-wrap leading-relaxed">
            {client.notes}
          </p>
        </div>
      )}
    </div>
  )
}

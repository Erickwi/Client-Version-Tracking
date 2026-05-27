import { useEffect, useState } from 'react'
import { useStore } from '@nanostores/react'
import { $clients, fetchClients, createClient } from '@/stores/clients'
import { fetchVersions } from '@/stores/versions'
import { ClientTable } from '@/components/ClientTable'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Plus, X, Users } from 'lucide-react'

export function ClientList() {
  const clients = useStore($clients)
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchClients()
    fetchVersions()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    setError(null)
    try {
      await createClient({ name: name.trim(), notes: notes.trim() || undefined })
      setName('')
      setNotes('')
      setShowForm(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-4xl sm:text-5xl tracking-[0.05em] text-foreground leading-none">
            CLIENTES
          </h1>
          <p className="text-muted-foreground font-body text-sm mt-2 flex items-center gap-2">
            <Users className="w-4 h-4" />
            {clients.length} clientes registrados
          </p>
        </div>
        <Button
          onClick={() => setShowForm((v) => !v)}
          variant={showForm ? 'outline' : 'default'}
          size="sm"
        >
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? 'Cancelar' : 'Nuevo cliente'}
        </Button>
      </div>

      {showForm && (
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="font-heading text-lg tracking-[0.08em] text-foreground mb-5">
            AGREGAR CLIENTE
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Nombre *</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nombre del cliente"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Notas</label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Observaciones opcionales..."
                rows={3}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex gap-2">
              <Button type="submit" disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      )}

      <ClientTable />
    </div>
  )
}

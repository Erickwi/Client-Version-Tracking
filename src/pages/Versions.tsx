import { useEffect, useState } from 'react'
import { useStore } from '@nanostores/react'
import { $versions, $versionsLoading, fetchVersions, createVersion, setLatestVersion } from '@/stores/versions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Layers, Star } from 'lucide-react'

export function Versions() {
  const versions = useStore($versions)
  const loading = useStore($versionsLoading)

  const [showForm, setShowForm] = useState(false)
  const [versionNumber, setVersionNumber] = useState('')
  const [releaseDate, setReleaseDate] = useState('')
  const [changelog, setChangelog] = useState('')
  const [saving, setSaving] = useState(false)
  const [settingLatest, setSettingLatest] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchVersions()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!versionNumber.trim() || !releaseDate) return
    setSaving(true)
    setError(null)
    try {
      await createVersion({
        version_number: versionNumber.trim(),
        release_date: releaseDate,
        changelog: changelog.trim() || undefined,
      })
      setVersionNumber('')
      setReleaseDate('')
      setChangelog('')
      setShowForm(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  async function handleSetLatest(id: string) {
    setSettingLatest(id)
    try {
      await setLatestVersion(id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar')
    } finally {
      setSettingLatest(null)
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-4xl sm:text-5xl tracking-[0.05em] text-foreground leading-none">
            VERSIONES
          </h1>
          <p className="text-muted-foreground font-body text-sm mt-2 flex items-center gap-2">
            <Layers className="w-4 h-4" />
            {versions.length} versiones registradas
          </p>
        </div>
        <Button
          onClick={() => setShowForm((v) => !v)}
          variant={showForm ? 'outline' : 'default'}
          size="sm"
        >
          {showForm ? null : <Plus className="h-4 w-4" />}
          {showForm ? 'Cancelar' : 'Nueva versión'}
        </Button>
      </div>

      {showForm && (
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="font-heading text-lg tracking-[0.08em] text-foreground mb-5">
            REGISTRAR VERSIÓN
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Número de versión *</label>
              <Input
                value={versionNumber}
                onChange={(e) => setVersionNumber(e.target.value)}
                placeholder="Ej: 2.3.1"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Fecha de lanzamiento *</label>
              <Input
                type="date"
                value={releaseDate}
                onChange={(e) => setReleaseDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Changelog</label>
              <Textarea
                value={changelog}
                onChange={(e) => setChangelog(e.target.value)}
                placeholder="Cambios incluidos en esta versión..."
                rows={4}
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

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            <p className="text-sm text-muted-foreground">Cargando versiones...</p>
          </div>
        </div>
      ) : versions.length === 0 ? (
        <div className="text-center py-12">
          <Layers className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">No hay versiones registradas aún.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {versions.map((v) => (
            <div
              key={v.id}
              className={`rounded-xl border p-5 transition-all duration-200 hover:border-primary/30 ${
                v.is_latest ? 'border-primary/40 bg-primary/[0.02]' : 'border-border bg-card'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2 min-w-0 flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className={`font-heading text-2xl tracking-wider ${v.is_latest ? 'text-primary' : 'text-foreground'}`}>
                      v{v.version_number}
                    </span>
                    {v.is_latest && (
                      <span className="rounded bg-primary px-2.5 py-0.5 text-[10px] font-semibold text-primary-foreground tracking-wider uppercase">
                        Latest
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground font-mono">
                    Lanzado el{' '}
                    {new Date(v.release_date).toLocaleDateString('es-MX', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      timeZone: 'UTC',
                    })}
                  </p>
                  {v.changelog && (
                    <p className="text-sm text-muted-foreground/80 mt-2 whitespace-pre-wrap leading-relaxed">
                      {v.changelog}
                    </p>
                  )}
                </div>
                {!v.is_latest && (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={settingLatest === v.id}
                    onClick={() => handleSetLatest(v.id)}
                    className="shrink-0"
                  >
                    <Star className="w-3 h-3" />
                    {settingLatest === v.id ? 'Aplicando...' : 'Marcar latest'}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

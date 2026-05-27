import { useEffect, useState } from 'react'
import { useStore } from '@nanostores/react'
import { $versions, $versionsLoading, fetchVersions, createVersion, setLatestVersion } from '@/stores/versions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Star } from 'lucide-react'

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
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Versiones del sistema</h1>
          <p className="text-gray-500 text-sm mt-1">{versions.length} versiones registradas</p>
        </div>
        <Button onClick={() => setShowForm((v) => !v)} size="sm">
          <Plus className="h-4 w-4" />
          Nueva versión
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Registrar versión</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">Número de versión *</label>
                <Input
                  value={versionNumber}
                  onChange={(e) => setVersionNumber(e.target.value)}
                  placeholder="Ej: 2.3.1"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Fecha de lanzamiento *</label>
                <Input
                  type="date"
                  value={releaseDate}
                  onChange={(e) => setReleaseDate(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Changelog</label>
                <Textarea
                  value={changelog}
                  onChange={(e) => setChangelog(e.target.value)}
                  placeholder="Cambios incluidos en esta versión..."
                  rows={4}
                />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <div className="flex gap-2">
                <Button type="submit" disabled={saving}>
                  {saving ? 'Guardando...' : 'Guardar'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <p className="text-gray-400 text-sm">Cargando versiones...</p>
      ) : versions.length === 0 ? (
        <p className="text-gray-400 text-sm">No hay versiones registradas aún.</p>
      ) : (
        <div className="space-y-3">
          {versions.map((v) => (
            <Card key={v.id} className={v.is_latest ? 'border-blue-300' : ''}>
              <CardContent className="p-4 flex items-start justify-between gap-4">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold">v{v.version_number}</span>
                    {v.is_latest && (
                      <span className="rounded bg-blue-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                        LATEST
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    Lanzado el {new Date(v.release_date).toLocaleDateString('es-MX', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      timeZone: 'UTC',
                    })}
                  </p>
                  {v.changelog && (
                    <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">{v.changelog}</p>
                  )}
                </div>
                {!v.is_latest && (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={settingLatest === v.id}
                    onClick={() => handleSetLatest(v.id)}
                  >
                    <Star className="h-3 w-3" />
                    {settingLatest === v.id ? 'Aplicando...' : 'Marcar como latest'}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

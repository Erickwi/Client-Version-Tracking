import { atom, computed } from 'nanostores'
import type { Client, ClientStatus, ClientWithHistory } from '@/types'
import { supabase } from '@/lib/supabase'

export interface ClientFilters {
  search: string
  status: ClientStatus | 'all'
  versionId: string | 'all'
}

export const $clients = atom<Client[]>([])
export const $clientsLoading = atom(false)
export const $clientsError = atom<string | null>(null)

export const $filters = atom<ClientFilters>({
  search: '',
  status: 'all',
  versionId: 'all',
})

export const $filteredClients = computed([$clients, $filters], (clients, filters) => {
  return clients.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(filters.search.toLowerCase())
    const matchStatus = filters.status === 'all' || c.status === filters.status
    return matchSearch && matchStatus
  })
})

export const $stats = computed($clients, (clients) => ({
  total: clients.length,
  updated: clients.filter((c) => c.status === 'updated').length,
  pending: clients.filter((c) => c.status === 'pending').length,
  error: clients.filter((c) => c.status === 'error').length,
}))

export async function fetchClients() {
  $clientsLoading.set(true)
  $clientsError.set(null)
  const { data, error } = await supabase
    .from('clients')
    .select('*, client_version_history(installed_at)')
    .order('name', { ascending: true })
  if (error) {
    $clientsError.set(error.message)
  } else {
    const mapped = (data ?? []).map((c: typeof data[number]) => {
      const history: { installed_at: string }[] = (c as any).client_version_history ?? []
      const latest = history
        .map((h) => h.installed_at)
        .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0] ?? null
      const { client_version_history: _h, ...rest } = c as any
      return { ...rest, latest_installed_at: latest }
    })
    $clients.set(mapped)
  }
  $clientsLoading.set(false)
}

export async function fetchClientWithHistory(id: string): Promise<ClientWithHistory | null> {
  const { data, error } = await supabase
    .from('clients')
    .select(`
      *,
      client_version_history (
        *,
        system_versions (*)
      )
    `)
    .eq('id', id)
    .single()
  if (error) throw new Error(error.message)
  const history = (data.client_version_history ?? []).sort(
    (a: { installed_at: string }, b: { installed_at: string }) =>
      new Date(b.installed_at).getTime() - new Date(a.installed_at).getTime(),
  )
  return {
    ...data,
    client_version_history: history,
    current_version: history[0]?.system_versions ?? undefined,
  }
}

export async function createClient(payload: { name: string; notes?: string }) {
  const { error } = await supabase.from('clients').insert({
    ...payload,
    status: 'pending',
  })
  if (error) throw new Error(error.message)
  await fetchClients()
}

export async function updateClient(
  id: string,
  payload: Partial<Pick<Client, 'name' | 'notes' | 'status'>>,
) {
  const { error } = await supabase.from('clients').update(payload).eq('id', id)
  if (error) throw new Error(error.message)
  await fetchClients()
}

export async function deleteClient(id: string) {
  const { error } = await supabase.from('clients').delete().eq('id', id)
  if (error) throw new Error(error.message)
  await fetchClients()
}

export async function addVersionToClient(
  clientId: string,
  versionId: string,
  notes?: string,
) {
  const { error } = await supabase.from('client_version_history').insert({
    client_id: clientId,
    version_id: versionId,
    notes: notes ?? null,
  })
  if (error) throw new Error(error.message)
}

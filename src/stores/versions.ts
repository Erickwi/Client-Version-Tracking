import { atom, computed } from 'nanostores'
import type { SystemVersion } from '@/types'
import { supabase } from '@/lib/supabase'

export const $versions = atom<SystemVersion[]>([])
export const $versionsLoading = atom(false)
export const $versionsError = atom<string | null>(null)

export const $latestVersion = computed($versions, (versions) =>
  versions.find((v) => v.is_latest) ?? null,
)

export async function fetchVersions() {
  $versionsLoading.set(true)
  $versionsError.set(null)
  const { data, error } = await supabase
    .from('system_versions')
    .select('*')
    .order('release_date', { ascending: false })
  if (error) {
    $versionsError.set(error.message)
  } else {
    $versions.set(data ?? [])
  }
  $versionsLoading.set(false)
}

export async function createVersion(
  payload: { version_number: string; release_date: string; changelog?: string },
) {
  const { error } = await supabase.from('system_versions').insert(payload)
  if (error) throw new Error(error.message)
  await fetchVersions()
}

export async function setLatestVersion(id: string) {
  // Unset all, then set the selected one
  await supabase
    .from('system_versions')
    .update({ is_latest: false })
    .neq('id', id)
  const { error } = await supabase
    .from('system_versions')
    .update({ is_latest: true })
    .eq('id', id)
  if (error) throw new Error(error.message)
  await fetchVersions()
}

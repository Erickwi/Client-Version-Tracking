export type ClientStatus = 'updated' | 'pending' | 'error'

export interface SystemVersion {
  id: string
  version_number: string
  release_date: string
  is_latest: boolean
  changelog: string | null
  created_at: string
}

export interface Client {
  id: string
  name: string
  notes: string | null
  status: ClientStatus
  created_at: string
  updated_at: string
  latest_installed_at?: string | null
}

export interface ClientVersionHistory {
  id: string
  client_id: string
  version_id: string
  installed_at: string
  notes: string | null
  system_versions?: SystemVersion
}

export interface ClientWithHistory extends Client {
  client_version_history: ClientVersionHistory[]
  current_version?: SystemVersion
}

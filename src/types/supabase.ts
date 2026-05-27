export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export interface Database {
  public: {
    Tables: {
      system_versions: {
        Row: {
          id: string
          version_number: string
          release_date: string
          is_latest: boolean
          changelog: string | null
          created_at: string
        }
        Insert: {
          id?: string
          version_number: string
          release_date: string
          is_latest?: boolean
          changelog?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          version_number?: string
          release_date?: string
          is_latest?: boolean
          changelog?: string | null
          created_at?: string
        }
      }
      clients: {
        Row: {
          id: string
          name: string
          notes: string | null
          status: 'updated' | 'pending' | 'error'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          notes?: string | null
          status?: 'updated' | 'pending' | 'error'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          notes?: string | null
          status?: 'updated' | 'pending' | 'error'
          created_at?: string
          updated_at?: string
        }
      }
      client_version_history: {
        Row: {
          id: string
          client_id: string
          version_id: string
          installed_at: string
          notes: string | null
        }
        Insert: {
          id?: string
          client_id: string
          version_id: string
          installed_at?: string
          notes?: string | null
        }
        Update: {
          id?: string
          client_id?: string
          version_id?: string
          installed_at?: string
          notes?: string | null
        }
      }
    }
  }
}

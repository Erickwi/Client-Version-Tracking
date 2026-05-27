import { describe, it, expect } from 'vitest'
import type { Client } from '@/types'

// --- Helpers under test (mirrored from stores/clients.ts logic) ---

function filterClients(
  clients: Client[],
  search: string,
  status: 'all' | 'updated' | 'pending' | 'error',
): Client[] {
  return clients.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase())
    const matchStatus = status === 'all' || c.status === status
    return matchSearch && matchStatus
  })
}

function computeStats(clients: Client[]) {
  return {
    total: clients.length,
    updated: clients.filter((c) => c.status === 'updated').length,
    pending: clients.filter((c) => c.status === 'pending').length,
    error: clients.filter((c) => c.status === 'error').length,
  }
}

// --- Mock data ---

const mockClients: Client[] = [
  { id: '1', name: 'Acme Corp', notes: null, status: 'updated', created_at: '', updated_at: '' },
  { id: '2', name: 'Beta SA', notes: null, status: 'pending', created_at: '', updated_at: '' },
  { id: '3', name: 'Gamma Inc', notes: null, status: 'error', created_at: '', updated_at: '' },
  { id: '4', name: 'Delta LLC', notes: null, status: 'updated', created_at: '', updated_at: '' },
]

// --- Tests ---

describe('filterClients', () => {
  it('returns all clients when filter is "all" and search is empty', () => {
    expect(filterClients(mockClients, '', 'all')).toHaveLength(4)
  })

  it('filters by name search (case-insensitive)', () => {
    const result = filterClients(mockClients, 'acme', 'all')
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('Acme Corp')
  })

  it('filters by status', () => {
    const updated = filterClients(mockClients, '', 'updated')
    expect(updated).toHaveLength(2)
    updated.forEach((c) => expect(c.status).toBe('updated'))
  })

  it('combines search and status filter', () => {
    const result = filterClients(mockClients, 'delta', 'updated')
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('Delta LLC')
  })

  it('returns empty when no match', () => {
    expect(filterClients(mockClients, 'xyz', 'all')).toHaveLength(0)
  })
})

describe('computeStats', () => {
  it('counts correctly', () => {
    const stats = computeStats(mockClients)
    expect(stats.total).toBe(4)
    expect(stats.updated).toBe(2)
    expect(stats.pending).toBe(1)
    expect(stats.error).toBe(1)
  })

  it('returns zeros for empty list', () => {
    const stats = computeStats([])
    expect(stats.total).toBe(0)
    expect(stats.updated).toBe(0)
    expect(stats.pending).toBe(0)
    expect(stats.error).toBe(0)
  })
})

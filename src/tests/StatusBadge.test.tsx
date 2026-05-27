import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { StatusBadge } from '@/components/StatusBadge'

describe('StatusBadge', () => {
  it('renders "Actualizado" for updated status', () => {
    render(<StatusBadge status="updated" />)
    expect(screen.getByText('Actualizado')).toBeInTheDocument()
  })

  it('renders "Pendiente" for pending status', () => {
    render(<StatusBadge status="pending" />)
    expect(screen.getByText('Pendiente')).toBeInTheDocument()
  })

  it('renders "Error" for error status', () => {
    render(<StatusBadge status="error" />)
    expect(screen.getByText('Error')).toBeInTheDocument()
  })
})

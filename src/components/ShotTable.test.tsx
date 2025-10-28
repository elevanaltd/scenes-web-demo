import { describe, it, expect, vi, beforeEach } from 'vitest'
import React from 'react'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ShotTable } from './ShotTable'
import type { ScriptComponent, Shot } from '../types'

const mockUseShots = vi.fn()
const mockUseDropdownOptions = vi.fn()
const mockShotMutations = vi.fn()
const mockRecordSave = vi.fn()

vi.mock('../hooks/useShots', () => ({
  useShots: (id: string | undefined) => mockUseShots(id),
}))

vi.mock('../hooks/useDropdownOptions', () => ({
  useDropdownOptions: (field?: string, _client?: unknown) => mockUseDropdownOptions(field),
}))

vi.mock('../hooks/useShotMutations', () => ({
  useShotMutations: () => mockShotMutations(),
}))

vi.mock('../contexts/LastSavedContext', () => ({
  useLastSaved: () => ({
    recordSave: mockRecordSave,
    lastSaved: null,
    formattedLastSaved: 'Never',
  }),
}))

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
})

const wrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(QueryClientProvider, { client: queryClient }, children)

describe('ShotTable', () => {
  const mockComponent: ScriptComponent = {
    id: 'comp1',
    script_id: 'script1',
    component_number: 1,
    content: 'Test component content',
    word_count: 50,
    created_at: '2025-01-01',
  }

  const mockShots: Shot[] = [
    {
      id: '1',
      script_component_id: 'scene1',
      shot_number: 1,
      shot_type: 'WS',
      location_start_point: 'Standard',
      location_other: null,
      movement_type: 'Establishing',
      subject: 'Standard',
      subject_other: null,
      variant: null,
      action: 'Demo',
      completed: false,
      owner_user_id: null,
      created_at: '2025-01-01',
      updated_at: '2025-01-01',
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should display loading state when shots are loading', () => {
    mockUseShots.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    })

    mockUseDropdownOptions.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    })

    mockShotMutations.mockReturnValue({
      insertShot: { mutate: vi.fn() },
      updateShot: { mutate: vi.fn() },
      deleteShot: { mutate: vi.fn() },
    })

    render(<ShotTable component={mockComponent} />, { wrapper })

    expect(screen.getByText('Loading shots...')).toBeInTheDocument()
  })

  it('should display shots table when data loaded', () => {
    mockUseShots.mockReturnValue({
      data: mockShots,
      isLoading: false,
      error: null,
    })

    mockUseDropdownOptions.mockReturnValue({
      data: [
        {
          id: '1',
          field_name: 'status' as const,
          option_value: 'not_started',
          option_label: 'Not Started',
          sort_order: 1,
          created_at: '2025-01-01',
        },
      ],
      isLoading: false,
      error: null,
    })

    mockShotMutations.mockReturnValue({
      insertShot: { mutate: vi.fn() },
      updateShot: { mutate: vi.fn() },
      deleteShot: { mutate: vi.fn() },
    })

    render(<ShotTable component={mockComponent} />, { wrapper })

    // Verify shot table header is rendered
    expect(screen.getByText(/Shots for Component/)).toBeInTheDocument()
    // Verify shot number is displayed
    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('should display empty state when no shots', () => {
    mockUseShots.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    })

    mockUseDropdownOptions.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    })

    mockShotMutations.mockReturnValue({
      insertShot: { mutate: vi.fn() },
      updateShot: { mutate: vi.fn() },
      deleteShot: { mutate: vi.fn() },
    })

    render(<ShotTable component={mockComponent} />, { wrapper })

    expect(screen.getByText(/No shots yet/)).toBeInTheDocument()
  })
})

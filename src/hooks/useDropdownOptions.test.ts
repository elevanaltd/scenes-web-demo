import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { useDropdownOptions } from './useDropdownOptions'
import * as supabaseLib from '../lib/supabase'

const mockSupabase = {
  from: vi.fn(),
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
vi.spyOn(supabaseLib, 'getSupabaseClient').mockReturnValue(mockSupabase as any)

const wrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return React.createElement(QueryClientProvider, { client: queryClient }, children)
}

describe('useDropdownOptions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch dropdown options for specific field', async () => {
    const mockOptions = [
      { id: '1', field_name: 'status' as const, option_value: 'not_started', option_label: 'Not Started', sort_order: 1, created_at: '2025-01-01' },
      { id: '2', field_name: 'status' as const, option_value: 'in_progress', option_label: 'In Progress', sort_order: 2, created_at: '2025-01-01' },
    ]

    const mockOrder = vi.fn().mockResolvedValue({
      data: mockOptions,
      error: null,
    })

    const mockEq = vi.fn().mockReturnValue({
      order: mockOrder,
    })

    const mockSelect = vi.fn().mockReturnValue({
      eq: mockEq,
    })

    mockSupabase.from.mockReturnValue({
      select: mockSelect,
    })

    const { result } = renderHook(() => useDropdownOptions('status'), { wrapper })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data).toEqual(mockOptions)
  })

  it('should fetch all field types when no field specified', async () => {
    const mockOptions = [
      { id: '1', field_name: 'status' as const, option_value: 'not_started', option_label: 'Not Started', sort_order: 1, created_at: '2025-01-01' },
      { id: '2', field_name: 'location' as const, option_value: 'ext_building', option_label: 'EXT-BUILDING', sort_order: 1, created_at: '2025-01-01' },
    ]

    const mockOrder = vi.fn().mockResolvedValue({
      data: mockOptions,
      error: null,
    })

    const mockSelect = vi.fn().mockReturnValue({
      order: mockOrder,
    })

    mockSupabase.from.mockReturnValue({
      select: mockSelect,
    })

    const { result } = renderHook(() => useDropdownOptions(), { wrapper })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data).toEqual(mockOptions)
  })
})

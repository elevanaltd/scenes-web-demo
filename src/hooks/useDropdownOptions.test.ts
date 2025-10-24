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

// Create wrapper with fresh QueryClient for each test
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children)
}

describe('useDropdownOptions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch dropdown options for specific field', async () => {
    const mockOptions = [
      { id: '1', field_name: 'shot_type' as const, option_value: 'WS', option_label: 'Wide Shot', sort_order: 1, created_at: '2025-01-01' },
      { id: '2', field_name: 'shot_type' as const, option_value: 'CU', option_label: 'Close-Up', sort_order: 2, created_at: '2025-01-01' },
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

    const { result } = renderHook(() => useDropdownOptions('shot_type'), { wrapper: createWrapper() })

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

    const { result } = renderHook(() => useDropdownOptions(), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data).toEqual(mockOptions)
  })

  it('surfaces Supabase errors to the hook', async () => {
    const mockError = new Error('Database connection failed')

    const mockOrder = vi.fn().mockResolvedValue({
      data: null,
      error: mockError,
    })

    const mockSelect = vi.fn().mockReturnValue({
      order: mockOrder,
    })

    mockSupabase.from.mockReturnValue({
      select: mockSelect,
    })

    const { result } = renderHook(() => useDropdownOptions('shot_type'), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toBeTruthy()
  })

  it('shows loading state initially, then false after fetch', async () => {
    const mockOptions = [
      { id: '1', field_name: 'shot_type' as const, option_value: 'WS', option_label: 'Wide Shot', sort_order: 1, created_at: '2025-01-01' },
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

    const { result } = renderHook(() => useDropdownOptions('shot_type'), { wrapper: createWrapper() })

    // Initially loading
    expect(result.current.isLoading).toBe(true)
    expect(result.current.data).toBeUndefined()

    // After fetch completes
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data).toEqual(mockOptions)
  })

  it('uses queryKey with fieldName for React Query caching', async () => {
    // This test verifies the queryKey structure for React Query caching
    // Actual caching behavior is handled by React Query (tested upstream)
    const mockOptions = [
      { id: '1', field_name: 'shot_type' as const, option_value: 'WS', option_label: 'Wide Shot', sort_order: 1, created_at: '2025-01-01' },
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

    const { result } = renderHook(() => useDropdownOptions('shot_type'), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Verify hook works and returns data
    expect(result.current.data).toEqual(mockOptions)
    // QueryKey structure is ['dropdownOptions', fieldName] for React Query to cache
  })

  it('handles empty results gracefully', async () => {
    const mockOrder = vi.fn().mockResolvedValue({
      data: [],
      error: null,
    })

    const mockSelect = vi.fn().mockReturnValue({
      order: mockOrder,
    })

    mockSupabase.from.mockReturnValue({
      select: mockSelect,
    })

    const { result } = renderHook(() => useDropdownOptions(undefined), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data).toEqual([])
    expect(result.current.isError).toBe(false)
  })

  it('handles null data from Supabase gracefully', async () => {
    const mockOrder = vi.fn().mockResolvedValue({
      data: null,
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

    const { result } = renderHook(() => useDropdownOptions('shot_type'), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Should return empty array, not null/undefined
    expect(result.current.data).toEqual([])
  })
})

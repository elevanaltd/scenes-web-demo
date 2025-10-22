import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { useScene } from './useScene'

// Mock supabase client
vi.mock('../lib/supabase', () => ({
  getSupabaseClient: vi.fn(),
}))

describe('useScene', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockSupabase: any
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    })

    mockSupabase = {
      from: vi.fn(),
    }
  })

  const wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children)

  it('returns undefined when scriptComponentId is undefined', async () => {
    const { result } = renderHook(() => useScene(undefined), { wrapper })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data).toBeUndefined()
  })

  it('fetches existing scene for a component', async () => {
    const componentId = 'comp-123'
    const existingScene = {
      id: 'scene-123',
      script_component_id: componentId,
      created_at: '2025-10-22T00:00:00Z',
      updated_at: '2025-10-22T00:00:00Z',
    }

    const { getSupabaseClient } = await import('../lib/supabase')
    vi.mocked(getSupabaseClient).mockReturnValue(mockSupabase)

    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: existingScene, error: null }),
    })

    const { result } = renderHook(() => useScene(componentId), { wrapper })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toEqual(existingScene)
  })

  it('creates a new scene if none exists', async () => {
    const componentId = 'comp-123'
    const newScene = {
      id: 'scene-456',
      script_component_id: componentId,
      created_at: '2025-10-22T00:00:00Z',
      updated_at: '2025-10-22T00:00:00Z',
    }

    const { getSupabaseClient } = await import('../lib/supabase')
    vi.mocked(getSupabaseClient).mockReturnValue(mockSupabase)

    // First call returns no existing scene, second call creates new one
    mockSupabase.from
      .mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      })
      .mockReturnValueOnce({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: newScene, error: null }),
      })

    const { result } = renderHook(() => useScene(componentId), { wrapper })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toEqual(newScene)
  })

  it('throws error if fetch fails', async () => {
    const componentId = 'comp-123'
    const error = new Error('Database error')

    const { getSupabaseClient } = await import('../lib/supabase')
    vi.mocked(getSupabaseClient).mockReturnValue(mockSupabase)

    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error }),
    })

    const { result } = renderHook(() => useScene(componentId), { wrapper })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toEqual(error)
  })
})

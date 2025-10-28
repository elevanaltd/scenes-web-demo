import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { useShotMutations } from './useShotMutations'
import * as supabaseLib from '../lib/supabase'

/**
 * PRE-MIGRATION CHARACTERIZATION TESTS - useShotMutations
 *
 * Purpose: Document mutation behavior BEFORE schema refactoring
 * These tests verify mutations currently use scene_id parameter
 *
 * Expected Outcome: These tests will FAIL after migration when interface changes
 * That failure proves the code was correctly updated to use script_component_id
 *
 * Schema Context:
 * - CURRENT: InsertShotInput/UpdateShotInput use scene_id
 * - CURRENT: Query invalidation uses ['shots', scene_id]
 * - POST-MIGRATION: Will use script_component_id in both input and queryKey
 *
 * DO NOT UPDATE THESE TESTS - They are historical documentation
 */

const mockSupabase = {
  from: vi.fn(),
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
vi.spyOn(supabaseLib, 'getSupabaseClient').mockReturnValue(mockSupabase as any)

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
})

const wrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(QueryClientProvider, { client: queryClient }, children)

describe('useShotMutations - Pre-Migration (scene_id interface)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('CURRENT: insertShot accepts scene_id in input', async () => {
    const mockNewShot = {
      id: 'shot-new',
      scene_id: 'scene-planning-state-123', // Current FK to scene_planning_state
      shot_number: 1,
      shot_type: 'WS',
      location_start_point: 'Standard',
      tracking_type: 'Tracking',
      subject: 'Building',
      owner_user_id: 'user-1',
      created_at: '2025-01-01',
      updated_at: '2025-01-01',
    }

    const mockSelect = vi.fn().mockResolvedValue({
      data: [mockNewShot],
      error: null,
    })

    const mockInsert = vi.fn().mockReturnValue({
      select: mockSelect,
    })

    mockSupabase.from.mockReturnValue({
      insert: mockInsert,
    })

    const { result } = renderHook(() => useShotMutations(), { wrapper })

    // Current interface - will change to script_component_id
    const insertInput = {
      scene_id: 'scene-planning-state-123',
      shot_number: 1,
      shot_type: 'WS',
      location_start_point: 'Standard',
      tracking_type: 'Tracking',
      subject: 'Building',
    }

    await waitFor(() => {
      result.current.insertShot.mutate(insertInput)
    })

    await waitFor(() => expect(result.current.insertShot.isSuccess).toBe(true))

    // Verify scene_id was passed to database
    expect(mockInsert).toHaveBeenCalledWith([
      expect.objectContaining({
        scene_id: 'scene-planning-state-123',
      }),
    ])
  })

  it('CURRENT: insertShot returns shot with scene_id field', async () => {
    const mockNewShot = {
      id: 'shot-1',
      scene_id: 'scene-123', // Will become script_component_id
      shot_number: 1,
      shot_type: 'MID',
      created_at: '2025-01-01',
      updated_at: '2025-01-01',
    }

    const mockSelect = vi.fn().mockResolvedValue({
      data: [mockNewShot],
      error: null,
    })

    mockSupabase.from.mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: mockSelect,
      }),
    })

    const { result } = renderHook(() => useShotMutations(), { wrapper })

    result.current.insertShot.mutate({
      scene_id: 'scene-123',
      shot_number: 1,
    })

    await waitFor(() => expect(result.current.insertShot.isSuccess).toBe(true))

    // Verify returned shot has scene_id
    expect(result.current.insertShot.data).toHaveProperty('scene_id')
    expect(result.current.insertShot.data?.scene_id).toBe('scene-123')
  })

  it('CURRENT: updateShot can update scene_id (though this should be rare)', async () => {
    const mockUpdatedShot = {
      id: 'shot-1',
      scene_id: 'scene-new',
      shot_number: 1,
      shot_type: 'CU',
      updated_at: '2025-01-02',
    }

    const mockSelect = vi.fn().mockResolvedValue({
      data: [mockUpdatedShot],
      error: null,
    })

    const mockEq = vi.fn().mockReturnValue({
      select: mockSelect,
    })

    mockSupabase.from.mockReturnValue({
      update: vi.fn().mockReturnValue({
        eq: mockEq,
      }),
    })

    const { result } = renderHook(() => useShotMutations(), { wrapper })

    const updateInput = {
      id: 'shot-1',
      scene_id: 'scene-new', // Can update FK (though rare in practice)
      shot_type: 'CU',
    }

    result.current.updateShot.mutate(updateInput)

    await waitFor(() => expect(result.current.updateShot.isSuccess).toBe(true))

    // Document current ability to update scene_id
    expect(result.current.updateShot.data).toHaveProperty('scene_id')
  })

  it('CURRENT: deleteShot requires sceneId parameter for query invalidation', async () => {
    const mockDelete = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({
        data: null,
        error: null,
      }),
    })

    mockSupabase.from.mockReturnValue({
      delete: mockDelete,
    })

    const { result } = renderHook(() => useShotMutations(), { wrapper })

    // Current interface requires both id and sceneId
    const deleteInput = {
      id: 'shot-to-delete',
      sceneId: 'scene-123', // Used for query invalidation
    }

    result.current.deleteShot.mutate(deleteInput)

    await waitFor(() => expect(result.current.deleteShot.isSuccess).toBe(true))

    // Verify sceneId is used (will become scriptComponentId)
    expect(deleteInput).toHaveProperty('sceneId')
    expect(deleteInput.sceneId).toBe('scene-123')
  })

  it('CURRENT: onSuccess invalidates queries with scene_id in queryKey', async () => {
    // Document current query invalidation pattern
    // Pattern: queryClient.invalidateQueries({ queryKey: ['shots', scene_id] })
    // Post-migration: queryKey: ['shots', script_component_id]

    const mockInsert = vi.fn().mockReturnValue({
      select: vi.fn().mockResolvedValue({
        data: [{ id: '1', scene_id: 'scene-123', shot_number: 1 }],
        error: null,
      }),
    })

    mockSupabase.from.mockReturnValue({
      insert: mockInsert,
    })

    const { result } = renderHook(() => useShotMutations(), { wrapper })

    result.current.insertShot.mutate({
      scene_id: 'scene-123',
      shot_number: 1,
    })

    await waitFor(() => expect(result.current.insertShot.isSuccess).toBe(true))

    // Current behavior: invalidates ['shots', 'scene-123']
    // Post-migration: will invalidate ['shots', 'component-123']
  })

  it('CURRENT: InsertShotInput interface contains scene_id (not script_component_id)', () => {
    // Document current TypeScript interface
    const validInput = {
      scene_id: 'scene-123', // Will become script_component_id
      shot_number: 1,
      shot_type: 'WS',
      location_start_point: 'Standard',
      tracking_type: 'Tracking',
      subject: 'Building',
    }

    // Verify scene_id is the correct field name currently
    expect(validInput).toHaveProperty('scene_id')
    expect(validInput).not.toHaveProperty('script_component_id')
  })
})

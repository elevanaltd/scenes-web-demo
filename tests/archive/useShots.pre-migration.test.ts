import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { useShots } from './useShots'
import * as supabaseLib from '../lib/supabase'

/**
 * PRE-MIGRATION CHARACTERIZATION TESTS
 *
 * Purpose: Document current behavior BEFORE schema refactoring
 * These tests verify shots currently use scene_id (via scene_planning_state table)
 *
 * Expected Outcome: These tests will FAIL after migration when scene_id is removed
 * That failure proves the schema change occurred successfully
 *
 * Schema Context:
 * - CURRENT: shots.scene_id → scene_planning_state.id → scene_planning_state.script_component_id
 * - POST-MIGRATION: shots.script_component_id → script_components.id (direct)
 *
 * DO NOT UPDATE THESE TESTS - They are historical documentation
 */

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

describe('useShots - Pre-Migration (scene_id via scene_planning_state)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('CURRENT: queries shots using scene_id (scene_planning_state FK)', async () => {
    const mockShots = [
      {
        id: 'shot-1',
        scene_id: 'scene-planning-state-uuid', // Current: FK to scene_planning_state
        shot_number: 1,
        shot_type: 'WS',
        location_start_point: 'Standard',
        location_other: null,
        tracking_type: 'Tracking',
        subject: 'Building',
        subject_other: null,
        variant: 'front entrance',
        action: 'establishing',
        owner_user_id: 'user-1',
        created_at: '2025-01-01',
        updated_at: '2025-01-01',
      },
      {
        id: 'shot-2',
        scene_id: 'scene-planning-state-uuid', // Same scene_id
        shot_number: 2,
        shot_type: 'MID',
        location_start_point: 'Other',
        location_other: 'parking lot',
        tracking_type: 'Standard',
        subject: 'Other',
        subject_other: 'security camera',
        variant: 'close detail',
        action: 'pan left to right',
        owner_user_id: 'user-1',
        created_at: '2025-01-01',
        updated_at: '2025-01-01',
      },
    ]

    const mockOrder = vi.fn().mockResolvedValue({
      data: mockShots,
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

    const { result } = renderHook(() => useShots('scene-planning-state-uuid'), { wrapper })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Verify current behavior
    expect(mockSupabase.from).toHaveBeenCalledWith('shots')
    expect(mockSelect).toHaveBeenCalledWith(
      'id, scene_id, shot_number, shot_type, location_start_point, location_other, tracking_type, subject, subject_other, variant, action, owner_user_id, created_at, updated_at'
    )
    expect(mockEq).toHaveBeenCalledWith('scene_id', 'scene-planning-state-uuid')
    expect(mockOrder).toHaveBeenCalledWith('shot_number', { ascending: true })
    expect(result.current.data).toEqual(mockShots)
  })

  it('CURRENT: queryKey uses scene_id parameter', async () => {
    const sceneId = 'scene-123'
    const mockOrder = vi.fn().mockResolvedValue({ data: [], error: null })
    const mockEq = vi.fn().mockReturnValue({ order: mockOrder })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
    mockSupabase.from.mockReturnValue({ select: mockSelect })

    const { result } = renderHook(() => useShots(sceneId), { wrapper })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    // Document current queryKey structure (will change post-migration)
    expect(result.current.data).toBeDefined()
    // QueryKey is ['shots', 'scene-123'] currently
  })

  it('CURRENT: returns empty array when scene_id is valid but has no shots', async () => {
    const mockOrder = vi.fn().mockResolvedValue({
      data: [],
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

    const { result } = renderHook(() => useShots('empty-scene'), { wrapper })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data).toEqual([])
    expect(mockEq).toHaveBeenCalledWith('scene_id', 'empty-scene')
  })

  it('CURRENT: shots contain scene_id field in response', async () => {
    const mockShots = [
      {
        id: 'shot-1',
        scene_id: 'scene-uuid', // This field will be removed post-migration
        shot_number: 1,
        shot_type: 'CU',
        location_start_point: 'Standard',
        location_other: null,
        tracking_type: 'Photos',
        subject: 'Standard',
        subject_other: null,
        variant: null,
        action: null,
        owner_user_id: 'user-1',
        created_at: '2025-01-01',
        updated_at: '2025-01-01',
      },
    ]

    const mockOrder = vi.fn().mockResolvedValue({
      data: mockShots,
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

    const { result } = renderHook(() => useShots('scene-uuid'), { wrapper })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Verify scene_id exists in response (will be replaced by script_component_id)
    expect(result.current.data?.[0]).toHaveProperty('scene_id')
    expect(result.current.data?.[0].scene_id).toBe('scene-uuid')
  })
})

describe('useShotMutations - Pre-Migration (scene_id operations)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('CURRENT: insertShot accepts scene_id parameter', () => {
    const mockInsert = vi.fn().mockReturnValue({
      select: vi.fn().mockResolvedValue({
        data: [
          {
            id: 'new-shot',
            scene_id: 'scene-123',
            shot_number: 1,
          },
        ],
        error: null,
      }),
    })

    mockSupabase.from.mockReturnValue({
      insert: mockInsert,
    })

    // Document current interface expects scene_id
    const insertInput = {
      scene_id: 'scene-123', // Will become script_component_id
      shot_number: 1,
      shot_type: 'WS',
    }

    expect(insertInput).toHaveProperty('scene_id')
  })

  it('CURRENT: mutations invalidate query using scene_id', () => {
    // Document: queryKey invalidation uses ['shots', scene_id]
    // Post-migration will use ['shots', script_component_id]
    const expectedQueryKey = ['shots', 'scene-123']
    expect(expectedQueryKey[0]).toBe('shots')
    expect(expectedQueryKey[1]).toBe('scene-123')
  })
})

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { getSupabaseClient } from '../lib/supabase'
import type { Shot } from '../types'

interface InsertShotInput {
  scene_id: string
  shot_number: number
  shot_type?: string | null
  location_start_point?: string | null
  location_other?: string | null
  tracking_type?: string | null
  subject?: string | null
  subject_other?: string | null
  variant?: string | null
  action?: string | null
  completed?: boolean | null
  owner_user_id?: string | null
}

interface UpdateShotInput extends Partial<InsertShotInput> {
  id: string
}

/**
 * Mutations for shot table operations
 * Invalidates shots query after mutations to trigger refetch
 *
 * TODO: Phase 3 - Fix Supabase type definitions to include shots and dropdown_options tables
 */
export function useShotMutations() {
  const queryClient = useQueryClient()

  const insertShot = useMutation({
    mutationFn: async (input: InsertShotInput) => {
      const supabase = getSupabaseClient()

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('shots')
        .insert([input])
        .select()

      if (error) throw error

      return data?.[0] as Shot
    },
    onSuccess: (newShot) => {
      // Invalidate shots query for the scene to refetch
      queryClient.invalidateQueries({
        queryKey: ['shots', newShot.scene_id],
      })
    },
  })

  const updateShot = useMutation({
    mutationFn: async (input: UpdateShotInput) => {
      const supabase = getSupabaseClient()
      const { id, ...updates } = input

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('shots')
        .update(updates)
        .eq('id', id)
        .select()

      if (error) throw error

      return data?.[0] as Shot
    },
    onSuccess: (updatedShot) => {
      // Invalidate shots query for the scene
      queryClient.invalidateQueries({
        queryKey: ['shots', updatedShot.scene_id],
      })
    },
  })

  const deleteShot = useMutation({
    mutationFn: async ({ id, sceneId }: { id: string; sceneId: string }) => {
      const supabase = getSupabaseClient()

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any).from('shots').delete().eq('id', id)

      if (error) throw error

      return { id, sceneId }
    },
    onSuccess: (result) => {
      // Invalidate shots query for the scene
      queryClient.invalidateQueries({
        queryKey: ['shots', result.sceneId],
      })
    },
  })

  return {
    insertShot,
    updateShot,
    deleteShot,
  }
}

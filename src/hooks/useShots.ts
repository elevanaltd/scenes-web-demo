import { useQuery } from '@tanstack/react-query'
import { getSupabaseClient } from '../lib/supabase'
import type { Shot } from '../types'

/**
 * Fetch shots for a specific scene (which maps to a script_component)
 * Ordered by shot_number for sequential display
 *
 * TODO: Phase 3 - Fix Supabase type definitions to include shots and dropdown_options tables
 */
export function useShots(sceneId: string | undefined) {
  return useQuery({
    queryKey: ['shots', sceneId],
    queryFn: async () => {
      if (!sceneId) return []

      const supabase = getSupabaseClient()

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('shots')
        .select(
          'id, scene_id, shot_number, status, location, subject, action, shot_type, int_ext, requires_actor, props, variant, plot_notes, created_at, updated_at'
        )
        .eq('scene_id', sceneId)
        .order('shot_number', { ascending: true })

      if (error) throw error

      return (data || []) as Shot[]
    },
    enabled: !!sceneId,
  })
}

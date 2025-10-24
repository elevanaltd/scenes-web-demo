import { useQuery } from '@tanstack/react-query'
import { getSupabaseClient } from '../lib/supabase'
import type { Scene } from '../types'

/**
 * Get or create a scene_planning_state record for a script_component
 *
 * The shots table references scene_planning_state via foreign key,
 * so we need a scene record to exist before we can add shots.
 *
 * This hook ensures the scene exists and returns its ID for use with shots.
 */
export function useScene(scriptComponentId: string | undefined) {
  return useQuery({
    queryKey: ['scene', scriptComponentId],
    queryFn: async () => {
      if (!scriptComponentId) return null

      const supabase = getSupabaseClient()

      // First try to find existing scene for this component
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: existingScene, error: findError } = await (supabase as any)
        .from('scene_planning_state')
        .select('id, script_component_id, created_at, updated_at')
        .eq('script_component_id', scriptComponentId)
        .maybeSingle()

      if (findError) {
        console.error('[useScene] Find error:', findError.message, findError.details, findError.hint)
        throw findError
      }

      // If scene exists, return it
      if (existingScene) {
        return existingScene as Scene
      }

      // Otherwise, create a new scene record
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: newScene, error: createError } = await (supabase as any)
        .from('scene_planning_state')
        .insert({
          script_component_id: scriptComponentId,
        })
        .select('id, script_component_id, created_at, updated_at')
        .single()

      if (createError) {
        console.error('[useScene] Create error:', createError.message, createError.details, createError.hint)
        throw createError
      }

      return newScene as Scene
    },
    enabled: !!scriptComponentId,
  })
}

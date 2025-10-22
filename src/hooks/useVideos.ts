import { useQuery } from '@tanstack/react-query'
import { getSupabaseClient } from '../lib/supabase'
import type { Video } from '../types'

/**
 * Fetch videos for a specific project
 */
export function useVideos(projectId: string | undefined) {
  return useQuery({
    queryKey: ['videos', projectId],
    queryFn: async () => {
      if (!projectId) return []

      const supabase = getSupabaseClient()

      const { data, error } = await supabase
        .from('videos')
        .select('id, title, eav_code, created_at')
        .eq('project_id', projectId)

      if (error) throw error

      return (data || []) as Video[]
    },
    enabled: !!projectId,
  })
}

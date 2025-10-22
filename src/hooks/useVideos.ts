import { useQuery } from '@tanstack/react-query'
import { getSupabaseClient } from '../lib/supabase'
import type { Video } from '../types'

/**
 * Fetch videos for a specific project (via eav_code)
 * Videos link to projects through eav_code, not direct foreign key
 */
export function useVideos(projectEavCode: string | undefined) {
  return useQuery({
    queryKey: ['videos', projectEavCode],
    queryFn: async () => {
      if (!projectEavCode) return []

      const supabase = getSupabaseClient()

      console.log('[useVideos] Fetching videos for eav_code:', projectEavCode)

      const { data, error } = await supabase
        .from('videos')
        .select('id, title, eav_code, created_at')
        .eq('eav_code', projectEavCode)

      console.log('[useVideos] Response:', { data, error })

      if (error) {
        console.error('[useVideos] Query error:', error)
        throw error
      }

      console.log('[useVideos] Returning', (data || []).length, 'videos')
      return (data || []) as Video[]
    },
    enabled: !!projectEavCode,
  })
}

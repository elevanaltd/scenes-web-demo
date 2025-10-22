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

      const { data, error } = await supabase
        .from('videos')
        .select('id, title, eav_code, created_at')
        .eq('eav_code', projectEavCode)

      if (error) throw error

      return (data || []) as Video[]
    },
    enabled: !!projectEavCode,
  })
}

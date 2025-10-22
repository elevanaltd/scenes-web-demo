import { useQuery } from '@tanstack/react-query'
import { getSupabaseClient } from '../lib/supabase'
import type { Project } from '../types'

/**
 * Fetch projects accessible to current user via user_clients RLS
 *
 * North Star I2: Multi-client data isolation
 * RLS ensures users see only their authorized projects
 */
export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const supabase = getSupabaseClient()

      const { data, error } = await supabase
        .from('projects')
        .select('id, title, eav_code, created_at')

      if (error) throw error

      return (data || []) as Project[]
    },
  })
}

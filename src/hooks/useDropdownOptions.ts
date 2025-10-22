import { useQuery } from '@tanstack/react-query'
import { getSupabaseClient } from '../lib/supabase'
import type { DropdownOption } from '../types'

/**
 * Fetch dropdown options for shot fields
 * Can filter by specific field_name or fetch all options
 *
 * TODO: Phase 3 - Fix Supabase type definitions to include shots and dropdown_options tables
 */
export function useDropdownOptions(fieldName?: DropdownOption['field_name']) {
  return useQuery({
    queryKey: ['dropdownOptions', fieldName],
    queryFn: async () => {
      const supabase = getSupabaseClient()

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let query = (supabase as any)
        .from('dropdown_options')
        .select('id, field_name, option_value, option_label, sort_order, created_at')

      if (fieldName) {
        query = query.eq('field_name', fieldName)
      }

      const { data, error } = await query.order('sort_order', { ascending: true })

      if (error) throw error

      return (data || []) as DropdownOption[]
    },
  })
}

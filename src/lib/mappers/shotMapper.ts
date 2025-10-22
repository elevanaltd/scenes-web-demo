/**
 * Shot Mapper
 *
 * Converts database rows to domain types.
 * Ensures type safety and null→undefined conversion for UI compatibility.
 */

import { Shot } from '../../types'

interface ShotRow {
  id: string
  scene_id: string
  shot_number: number
  status?: string | null
  location?: string | null
  subject?: string | null
  action?: string | null
  shot_type?: string | null
  int_ext?: string | null
  requires_actor?: boolean | null
  props?: string | null
  variant?: string | null
  plot_notes?: string | null
  created_at: string
  updated_at: string
}

export function mapShotRowToShot(row: ShotRow): Shot {
  return {
    id: row.id,
    scene_id: row.scene_id,
    shot_number: row.shot_number,
    status: row.status ?? null,
    location: row.location ?? null,
    subject: row.subject ?? null,
    action: row.action ?? null,
    shot_type: row.shot_type ?? null,
    int_ext: (row.int_ext as 'interior' | 'exterior' | null) ?? null,
    requires_actor: row.requires_actor ?? null,
    props: row.props ?? null,
    variant: row.variant ?? null,
    plot_notes: row.plot_notes ?? null,
    created_at: row.created_at,
    updated_at: row.updated_at
  }
}

export function mapShotRowsToShots(rows: ShotRow[]): Shot[] {
  return rows.map(mapShotRowToShot)
}

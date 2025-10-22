import { describe, it, expect } from 'vitest'
import { mapShotRowToShot } from './shotMapper'

describe('shotMapper', () => {
  it('should convert database row to Shot domain type', () => {
    const row = {
      id: 'shot-1',
      scene_id: 'scene-1',
      shot_number: 1,
      status: 'not_started',
      location: 'interior',
      subject: 'building',
      action: 'establishing',
      shot_type: 'wide',
      int_ext: 'interior',
      requires_actor: false,
      props: 'none',
      variant: null,
      plot_notes: null,
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z'
    }

    const shot = mapShotRowToShot(row)

    expect(shot.id).toBe('shot-1')
    expect(shot.scene_id).toBe('scene-1')
    expect(shot.shot_number).toBe(1)
    expect(shot.status).toBe('not_started')
  })

  it('should convert null fields to undefined', () => {
    const row = {
      id: 'shot-1',
      scene_id: 'scene-1',
      shot_number: 1,
      status: undefined,
      location: undefined,
      subject: undefined,
      action: undefined,
      shot_type: undefined,
      int_ext: undefined,
      requires_actor: undefined,
      props: undefined,
      variant: undefined,
      plot_notes: undefined,
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z'
    }

    const shot = mapShotRowToShot(row)

    expect(shot.status).toBeUndefined()
    expect(shot.location).toBeUndefined()
    expect(shot.int_ext).toBeUndefined()
  })
})

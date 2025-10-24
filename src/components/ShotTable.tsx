import React, { useState, useEffect, useRef } from 'react'
import { useScene } from '../hooks/useScene'
import { useShots } from '../hooks/useShots'
import { useDropdownOptions } from '../hooks/useDropdownOptions'
import { useShotMutations } from '../hooks/useShotMutations'
import { DropdownProvider } from '../contexts/DropdownContext'
import { useLastSaved } from '../contexts/LastSavedContext'
import { supabase } from '../lib/supabase'
import type { ScriptComponent, Shot } from '../types'
import { AutocompleteField } from './AutocompleteField'
import './ShotTable.css'

interface ShotTableProps {
  component: ScriptComponent
}

/**
 * Shot Table Component (Rebuilt)
 *
 * Displays shots for a script component with autocomplete fields for each user-facing column.
 * Uses new clean schema:
 * - 8 user-facing fields: shot_type, location_start_point, location_other, tracking_type, subject, subject_other, variant, action
 * - 2 hidden fields: completed, owner_user_id
 *
 * Auto-saves on blur (via AutocompleteField component).
 * "Other" text fields (location_other, subject_other) render inline below dropdown when value = "Other".
 *
 * North Star I6: Independent shots table (scene_planning_state association)
 *
 * Performance optimization: Text fields use local state + debounced blur saves.
 * This prevents character loss from rapid mutations interfering with input rendering.
 */
export function ShotTable({ component }: ShotTableProps) {
  const sceneQuery = useScene(component.id)
  const sceneId = sceneQuery.data?.id

  const shotsQuery = useShots(sceneId)
  const dropdownsQuery = useDropdownOptions(undefined, supabase)
  const mutations = useShotMutations()
  const { recordSave } = useLastSaved()

  // Track pending mutations per shot to show optimistic UI
  const [pendingMutations, setPendingMutations] = useState<Record<string, string>>({})
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const debounceTimerRef = useRef<Record<string, any>>({})

  // Group dropdown options by field_name for easy access
  const dropdownMap = React.useMemo(() => {
    const map: Record<string, string[]> = {}
    if (dropdownsQuery.data) {
      dropdownsQuery.data.forEach((option) => {
        if (!map[option.field_name]) {
          map[option.field_name] = []
        }
        map[option.field_name].push(option.option_label)
      })
    }
    return map
  }, [dropdownsQuery.data])

  const handleAddShot = () => {
    if (!sceneId) return
    const nextShotNumber = (shotsQuery.data?.length || 0) + 1

    mutations.insertShot.mutate({
      scene_id: sceneId,
      shot_number: nextShotNumber,
    }, {
      onSuccess: () => recordSave(),
    })
  }

  const handleDeleteShot = (id: string) => {
    if (!sceneId) return
    if (confirm('Delete this shot?')) {
      mutations.deleteShot.mutate({ id, sceneId }, {
        onSuccess: () => recordSave(),
      })
    }
  }

  // Handle dropdown/autocomplete field updates (immediate save via mutation)
  const handleAutocompleteChange = (shotId: string, field: keyof Shot, value: string | null) => {
    // Prepare update object
    const updates: Partial<Shot> = {
      [field]: value,
    }

    // Clear corresponding "_other" field when switching away from "Other"
    if (field === 'location_start_point' && value !== 'Other') {
      updates.location_other = null
    }
    if (field === 'subject' && value !== 'Other') {
      updates.subject_other = null
    }

    mutations.updateShot.mutate({
      id: shotId,
      ...updates,
    }, {
      onSuccess: () => recordSave(),
    })
  }

  // Handle text field changes with debounced save
  // This allows local state to update immediately without waiting for mutations
  const handleTextFieldChange = (shotId: string, field: keyof Shot, value: string) => {
    // Track this change as pending for optimistic UI
    setPendingMutations((prev) => ({
      ...prev,
      [`${shotId}-${field}`]: value,
    }))

    // Clear existing timer for this field
    const timerKey = `${shotId}-${field}`
    if (debounceTimerRef.current[timerKey]) {
      clearTimeout(debounceTimerRef.current[timerKey])
    }

    // Set new timer to save after user stops typing
    debounceTimerRef.current[timerKey] = setTimeout(() => {
      mutations.updateShot.mutate({
        id: shotId,
        [field]: value || null,
      }, {
        onSuccess: () => recordSave(),
      })
      delete debounceTimerRef.current[timerKey]
    }, 500) // Wait 500ms after user stops typing
  }

  // Cleanup timers on unmount
  useEffect(() => {
    const timersToClean = debounceTimerRef.current
    return () => {
      Object.values(timersToClean).forEach(clearTimeout)
    }
  }, [])

  if (sceneQuery.isLoading || shotsQuery.isLoading) {
    return <div className="shot-table-loading">Loading shots...</div>
  }

  if (sceneQuery.error) {
    return <div className="shot-table-error">Error creating/loading scene</div>
  }

  if (shotsQuery.error) {
    const errorMessage = shotsQuery.error instanceof Error ? shotsQuery.error.message : 'Unknown error'
    console.error('[ShotTable] shotsQuery.error:', shotsQuery.error)
    return <div className="shot-table-error">Error loading shots: {errorMessage}</div>
  }

  const shots = shotsQuery.data || []

  return (
    <DropdownProvider>
      <div className="shot-table-container">
        <div className="shot-table-header">
        <h3>Shots for Component {component.component_number}</h3>
        <button className="btn btn-primary" onClick={handleAddShot}>
          + Add Shot
        </button>
      </div>

      {shots.length === 0 ? (
        <div className="shot-table-empty">No shots yet • Click "Add Shot" to create one</div>
      ) : (
        <div className="shot-table-wrapper">
          <table className="shot-table">
            <thead>
              <tr>
                <th className="col-number">#</th>
                <th className="col-shot-type">Shot Type</th>
                <th className="col-location">Location</th>
                <th className="col-tracking">Tracking</th>
                <th className="col-subject">Subject</th>
                <th className="col-variant">Variant</th>
                <th className="col-action">Action</th>
                <th className="col-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {shots.map((shot: Shot) => (
                <React.Fragment key={shot.id}>
                  <tr>
                    {/* Shot Number (read-only) */}
                    <td className="col-number">{shot.shot_number}</td>

                    {/* shot_type - Fixed list autocomplete (no "Other") */}
                    <td className="col-shot-type">
                      <AutocompleteField
                        value={shot.shot_type || null}
                        onChange={(value) => handleAutocompleteChange(shot.id, 'shot_type', value)}
                        options={dropdownMap['shot_type'] || []}
                        allowOther={false}
                        placeholder="Select..."
                        isLoading={dropdownsQuery.isLoading}
                      />
                    </td>

                    {/* location_start_point - Flexible list with "Other" */}
                    <td className="col-location">
                      <AutocompleteField
                        value={shot.location_start_point || null}
                        onChange={(value) => handleAutocompleteChange(shot.id, 'location_start_point', value)}
                        onOtherChange={(value) => handleAutocompleteChange(shot.id, 'location_other', value)}
                        options={dropdownMap['location_start_point'] || []}
                        allowOther={true}
                        placeholder="Select..."
                        isLoading={dropdownsQuery.isLoading}
                        showOtherText={shot.location_start_point === 'Other'}
                        otherValue={shot.location_other}
                      />
                    </td>

                    {/* tracking_type - Fixed list autocomplete (no "Other") */}
                    <td className="col-tracking">
                      <AutocompleteField
                        value={shot.tracking_type || null}
                        onChange={(value) => handleAutocompleteChange(shot.id, 'tracking_type', value)}
                        options={dropdownMap['tracking_type'] || []}
                        allowOther={false}
                        placeholder="Select..."
                        isLoading={dropdownsQuery.isLoading}
                      />
                    </td>

                    {/* subject - Flexible list with "Other" */}
                    <td className="col-subject">
                      <AutocompleteField
                        value={shot.subject || null}
                        onChange={(value) => handleAutocompleteChange(shot.id, 'subject', value)}
                        onOtherChange={(value) => handleAutocompleteChange(shot.id, 'subject_other', value)}
                        options={dropdownMap['subject'] || []}
                        allowOther={true}
                        placeholder="Select..."
                        isLoading={dropdownsQuery.isLoading}
                        showOtherText={shot.subject === 'Other'}
                        otherValue={shot.subject_other}
                      />
                    </td>

                    {/* variant - Free text with debounced save */}
                    <td className="col-variant">
                      <input
                        type="text"
                        value={pendingMutations[`${shot.id}-variant`] ?? shot.variant ?? ''}
                        onChange={(e) => handleTextFieldChange(shot.id, 'variant', e.target.value)}
                        placeholder="e.g., front door, siemens"
                        className="form-control form-control-text"
                      />
                    </td>

                    {/* action - Free text with debounced save */}
                    <td className="col-action">
                      <input
                        type="text"
                        value={pendingMutations[`${shot.id}-action`] ?? shot.action ?? ''}
                        onChange={(e) => handleTextFieldChange(shot.id, 'action', e.target.value)}
                        placeholder="e.g., demo, movement"
                        className="form-control form-control-text"
                      />
                    </td>

                    {/* Actions - Delete button */}
                    <td className="col-actions">
                      <button
                        className="btn btn-danger btn-small"
                        onClick={() => handleDeleteShot(shot.id)}
                        title="Delete shot"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
      </div>
    </DropdownProvider>
  )
}

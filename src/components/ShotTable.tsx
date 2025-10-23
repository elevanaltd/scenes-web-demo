import React from 'react'
import { useScene } from '../hooks/useScene'
import { useShots } from '../hooks/useShots'
import { useDropdownOptions } from '../hooks/useDropdownOptions'
import { useShotMutations } from '../hooks/useShotMutations'
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
 * Conditional rendering of location_other and subject_other when parent is set to "Other".
 *
 * North Star I6: Independent shots table (scene_planning_state association)
 */
export function ShotTable({ component }: ShotTableProps) {
  const sceneQuery = useScene(component.id)
  const sceneId = sceneQuery.data?.id

  const shotsQuery = useShots(sceneId)
  const dropdownsQuery = useDropdownOptions()
  const mutations = useShotMutations()

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
    })
  }

  const handleDeleteShot = (id: string) => {
    if (!sceneId) return
    if (confirm('Delete this shot?')) {
      mutations.deleteShot.mutate({ id, sceneId })
    }
  }

  // Handle field update with auto-save on blur
  const handleFieldChange = (shotId: string, field: keyof Shot, value: string | null) => {
    mutations.updateShot.mutate({
      id: shotId,
      [field]: value,
    })
  }

  if (sceneQuery.isLoading || shotsQuery.isLoading) {
    return <div className="shot-table-loading">Loading shots...</div>
  }

  if (sceneQuery.error) {
    return <div className="shot-table-error">Error creating/loading scene</div>
  }

  if (shotsQuery.error) {
    return <div className="shot-table-error">Error loading shots</div>
  }

  const shots = shotsQuery.data || []

  return (
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
                        onChange={(value) => handleFieldChange(shot.id, 'shot_type', value)}
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
                        onChange={(value) => handleFieldChange(shot.id, 'location_start_point', value)}
                        onOtherChange={(value) => handleFieldChange(shot.id, 'location_other', value)}
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
                        onChange={(value) => handleFieldChange(shot.id, 'tracking_type', value)}
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
                        onChange={(value) => handleFieldChange(shot.id, 'subject', value)}
                        onOtherChange={(value) => handleFieldChange(shot.id, 'subject_other', value)}
                        options={dropdownMap['subject'] || []}
                        allowOther={true}
                        placeholder="Select..."
                        isLoading={dropdownsQuery.isLoading}
                        showOtherText={shot.subject === 'Other'}
                        otherValue={shot.subject_other}
                      />
                    </td>

                    {/* variant - Free text */}
                    <td className="col-variant">
                      <input
                        type="text"
                        value={shot.variant || ''}
                        onChange={(e) => handleFieldChange(shot.id, 'variant', e.target.value || null)}
                        onBlur={(e) => {
                          // Ensure value is saved on blur
                          const finalValue = e.target.value || null
                          handleFieldChange(shot.id, 'variant', finalValue)
                        }}
                        placeholder="e.g., front door, siemens"
                        className="form-control form-control-text"
                      />
                    </td>

                    {/* action - Free text */}
                    <td className="col-action">
                      <input
                        type="text"
                        value={shot.action || ''}
                        onChange={(e) => handleFieldChange(shot.id, 'action', e.target.value || null)}
                        onBlur={(e) => {
                          // Ensure value is saved on blur
                          const finalValue = e.target.value || null
                          handleFieldChange(shot.id, 'action', finalValue)
                        }}
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

                  {/* Conditional row for location_other (shown when location_start_point = "Other") */}
                  {shot.location_start_point === 'Other' && (
                    <tr className="conditional-row">
                      <td colSpan={1}></td>
                      <td colSpan={1}>
                        <span className="conditional-label">Location (Other):</span>
                      </td>
                      <td colSpan={6}>
                        <input
                          type="text"
                          value={shot.location_other || ''}
                          onChange={(e) => handleFieldChange(shot.id, 'location_other', e.target.value || null)}
                          onBlur={(e) => {
                            const finalValue = e.target.value || null
                            handleFieldChange(shot.id, 'location_other', finalValue)
                          }}
                          placeholder="Enter custom location..."
                          className="form-control form-control-text conditional-input"
                        />
                      </td>
                    </tr>
                  )}

                  {/* Conditional row for subject_other (shown when subject = "Other") */}
                  {shot.subject === 'Other' && (
                    <tr className="conditional-row">
                      <td colSpan={1}></td>
                      <td colSpan={1}>
                        <span className="conditional-label">Subject (Other):</span>
                      </td>
                      <td colSpan={6}>
                        <input
                          type="text"
                          value={shot.subject_other || ''}
                          onChange={(e) => handleFieldChange(shot.id, 'subject_other', e.target.value || null)}
                          onBlur={(e) => {
                            const finalValue = e.target.value || null
                            handleFieldChange(shot.id, 'subject_other', finalValue)
                          }}
                          placeholder="Enter custom subject..."
                          className="form-control form-control-text conditional-input"
                        />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

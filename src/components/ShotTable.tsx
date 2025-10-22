import React from 'react'
import { useScene } from '../hooks/useScene'
import { useShots } from '../hooks/useShots'
import { useDropdownOptions } from '../hooks/useDropdownOptions'
import { useShotMutations } from '../hooks/useShotMutations'
import type { ScriptComponent, DropdownOption } from '../types'
import './ShotTable.css'

interface ShotTableProps {
  component: ScriptComponent
}

/**
 * Shot Table Component
 *
 * Displays shots for a script component with editable fields.
 * Supports add/edit/delete operations with dropdown fields for common options.
 *
 * North Star I6: Independent shots table (scene_planning_state association)
 */
export function ShotTable({ component }: ShotTableProps) {
  // Get or create scene_planning_state record for this component
  const sceneQuery = useScene(component.id)
  const sceneId = sceneQuery.data?.id

  const shotsQuery = useShots(sceneId)
  const dropdownsQuery = useDropdownOptions()
  const mutations = useShotMutations()

  // Group dropdown options by field for easy access
  const dropdownMap = React.useMemo(() => {
    const map: Record<string, DropdownOption[]> = {}
    if (dropdownsQuery.data) {
      dropdownsQuery.data.forEach((option) => {
        if (!map[option.field_name]) {
          map[option.field_name] = []
        }
        map[option.field_name].push(option)
      })
    }
    return map
  }, [dropdownsQuery.data])

  const handleAddShot = () => {
    const nextShotNumber = (shotsQuery.data?.length || 0) + 1

    mutations.insertShot.mutate({
      scene_id: sceneId,
      shot_number: nextShotNumber,
      status: 'Not Started',
    })
  }

  const handleDeleteShot = (id: string) => {
    if (confirm('Delete this shot?')) {
      mutations.deleteShot.mutate({ id, sceneId })
    }
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
                <th className="col-status">Status</th>
                <th className="col-location">Location</th>
                <th className="col-subject">Subject</th>
                <th className="col-action">Action</th>
                <th className="col-type">Shot Type</th>
                <th className="col-intext">Int/Ext</th>
                <th className="col-actor">Actor?</th>
                <th className="col-props">Props</th>
                <th className="col-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {shots.map((shot) => (
                <tr key={shot.id}>
                  <td className="col-number">{shot.shot_number}</td>
                  <td className="col-status">
                    <select
                      value={shot.status || ''}
                      onChange={(e) =>
                        mutations.updateShot.mutate({
                          id: shot.id,
                          status: e.target.value,
                        })
                      }
                      className="form-control"
                    >
                      <option value="">Select status</option>
                      {(dropdownMap['status'] || []).map((opt) => (
                        <option key={opt.id} value={opt.option_value}>
                          {opt.option_label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="col-location">
                    <select
                      value={shot.location || ''}
                      onChange={(e) =>
                        mutations.updateShot.mutate({
                          id: shot.id,
                          location: e.target.value,
                        })
                      }
                      className="form-control"
                    >
                      <option value="">Select location</option>
                      {(dropdownMap['location'] || []).map((opt) => (
                        <option key={opt.id} value={opt.option_value}>
                          {opt.option_label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="col-subject">
                    <select
                      value={shot.subject || ''}
                      onChange={(e) =>
                        mutations.updateShot.mutate({
                          id: shot.id,
                          subject: e.target.value,
                        })
                      }
                      className="form-control"
                    >
                      <option value="">Select subject</option>
                      {(dropdownMap['subject'] || []).map((opt) => (
                        <option key={opt.id} value={opt.option_value}>
                          {opt.option_label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="col-action">
                    <select
                      value={shot.action || ''}
                      onChange={(e) =>
                        mutations.updateShot.mutate({
                          id: shot.id,
                          action: e.target.value,
                        })
                      }
                      className="form-control"
                    >
                      <option value="">Select action</option>
                      {(dropdownMap['action'] || []).map((opt) => (
                        <option key={opt.id} value={opt.option_value}>
                          {opt.option_label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="col-type">
                    <select
                      value={shot.shot_type || ''}
                      onChange={(e) =>
                        mutations.updateShot.mutate({
                          id: shot.id,
                          shot_type: e.target.value,
                        })
                      }
                      className="form-control"
                    >
                      <option value="">Select type</option>
                      {(dropdownMap['shot_type'] || []).map((opt) => (
                        <option key={opt.id} value={opt.option_value}>
                          {opt.option_label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="col-intext">
                    <select
                      value={shot.int_ext || ''}
                      onChange={(e) =>
                        mutations.updateShot.mutate({
                          id: shot.id,
                          int_ext: e.target.value as 'interior' | 'exterior',
                        })
                      }
                      className="form-control"
                    >
                      <option value="">—</option>
                      <option value="interior">Interior</option>
                      <option value="exterior">Exterior</option>
                    </select>
                  </td>
                  <td className="col-actor">
                    <input
                      type="checkbox"
                      checked={shot.requires_actor || false}
                      onChange={(e) =>
                        mutations.updateShot.mutate({
                          id: shot.id,
                          requires_actor: e.target.checked,
                        })
                      }
                    />
                  </td>
                  <td className="col-props">
                    <input
                      type="text"
                      value={shot.props || ''}
                      onChange={(e) =>
                        mutations.updateShot.mutate({
                          id: shot.id,
                          props: (e.target.value || null) as string | null,
                        })
                      }
                      placeholder="Props"
                      className="form-control"
                    />
                  </td>
                  <td className="col-actions">
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDeleteShot(shot.id)}
                      title="Delete shot"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

/**
 * Application Domain Types
 *
 * Type-safe representations of core entities.
 * Separate from database schema to allow transformation/validation.
 */

export interface Project {
  id: string
  title: string
  eav_code: string
  created_at: string
}

export interface Video {
  id: string
  title: string
  eav_code: string
  created_at: string
}

export interface Script {
  id: string
  video_id: string
  status: 'pend_start' | 'draft' | 'in_review' | 'rework' | 'approved' | 'reuse'
  plain_text: string
  component_count: number
  created_at: string
}

export interface ScriptComponent {
  id: string
  script_id: string
  component_number: number
  content: string
  word_count?: number
  created_at: string
}

export interface Scene {
  id: string
  script_component_id: string
  created_at: string
  updated_at: string
}

export interface Shot {
  id: string
  scene_id: string
  shot_number: number
  status?: string
  location?: string
  subject?: string
  action?: string
  shot_type?: string
  int_ext?: 'interior' | 'exterior'
  requires_actor?: boolean
  props?: string
  variant?: string
  plot_notes?: string
  created_at: string
  updated_at: string
}

export interface ProductionNote {
  id: string
  shot_id: string
  author_id: string
  content: string
  parent_id?: string
  created_at: string
  updated_at: string
}

export interface DropdownOption {
  id: string
  field_name: 'status' | 'location' | 'action' | 'shot_type' | 'subject'
  option_value: string
  option_label: string
  sort_order: number
  created_at: string
}

export interface UserProfile {
  id: string
  email: string
  display_name: string
  role: 'admin' | 'client' | 'employee'
  created_at: string
}

export interface NavigationState {
  selectedProject?: Project
  selectedVideo?: Video
  selectedScript?: Script
  selectedComponent?: ScriptComponent
}

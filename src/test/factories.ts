/**
 * Test Data Factories
 *
 * Generates deterministic test objects with sensible defaults.
 * Enables clean, readable tests without boilerplate.
 */

let nextId = 1000

export function resetFactoryIds(): void {
  nextId = 1000
}

export function createId(): string {
  return `id-${nextId++}`
}

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
  status: 'draft' | 'in_review' | 'approved'
  plain_text: string
  created_at: string
}

export interface ScriptComponent {
  id: string
  script_id: string
  component_number: number
  content: string
  created_at: string
}

export interface Scene {
  id: string
  script_component_id: string
  created_at: string
}

export interface Shot {
  id: string
  scene_id: string
  shot_number: number
  status?: string
  location?: string
  shot_type?: string
  int_ext?: 'interior' | 'exterior'
  requires_actor?: boolean
  props?: string
  created_at: string
}

export interface UserProfile {
  id: string
  email: string
  display_name: string
  role: 'admin' | 'client' | 'employee'
  created_at: string
}

export function createProject(overrides?: Partial<Project>): Project {
  const id = createId()
  return {
    id,
    title: `Test Project ${id}`,
    eav_code: `EAV${Math.floor(Math.random() * 100)}`,
    created_at: new Date().toISOString(),
    ...overrides
  }
}

export function createVideo(overrides?: Partial<Video>): Video {
  const id = createId()
  return {
    id,
    title: `Test Video ${id}`,
    eav_code: `EAV${Math.floor(Math.random() * 100)}`,
    created_at: new Date().toISOString(),
    ...overrides
  }
}

export function createScript(videoId?: string, overrides?: Partial<Script>): Script {
  const id = createId()
  return {
    id,
    video_id: videoId || createId(),
    status: 'approved',
    plain_text: 'Test script content',
    created_at: new Date().toISOString(),
    ...overrides
  }
}

export function createScriptComponent(scriptId?: string, overrides?: Partial<ScriptComponent>): ScriptComponent {
  const id = createId()
  return {
    id,
    script_id: scriptId || createId(),
    component_number: Math.floor(Math.random() * 100),
    content: 'Test component content',
    created_at: new Date().toISOString(),
    ...overrides
  }
}

export function createScene(componentId?: string, overrides?: Partial<Scene>): Scene {
  const id = createId()
  return {
    id,
    script_component_id: componentId || createId(),
    created_at: new Date().toISOString(),
    ...overrides
  }
}

export function createShot(sceneId?: string, overrides?: Partial<Shot>): Shot {
  const id = createId()
  return {
    id,
    scene_id: sceneId || createId(),
    shot_number: Math.floor(Math.random() * 100),
    status: 'not_started',
    location: 'interior',
    shot_type: 'wide',
    int_ext: 'interior',
    requires_actor: false,
    props: '',
    created_at: new Date().toISOString(),
    ...overrides
  }
}

export function createUserProfile(overrides?: Partial<UserProfile>): UserProfile {
  const id = createId()
  return {
    id,
    email: `user-${id}@test.local`,
    display_name: `Test User ${id}`,
    role: 'admin',
    created_at: new Date().toISOString(),
    ...overrides
  }
}

// Hierarchy builders for common test scenarios
export function createProjectHierarchy(overrides?: {
  projectOverrides?: Partial<Project>
  videoOverrides?: Partial<Video>
  scriptOverrides?: Partial<Script>
  componentOverrides?: Partial<ScriptComponent>
}) {
  const project = createProject(overrides?.projectOverrides)
  const video = createVideo({
    eav_code: project.eav_code,
    ...overrides?.videoOverrides
  })
  const script = createScript(video.id, overrides?.scriptOverrides)
  const component = createScriptComponent(script.id, overrides?.componentOverrides)

  return { project, video, script, component }
}

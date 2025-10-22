import React, { createContext, useContext, useState } from 'react'
import type { Project, Video, Script, ScriptComponent } from '../types'

interface NavigationState {
  selectedProject: Project | undefined
  selectedVideo: Video | undefined
  selectedScript: Script | undefined
  selectedComponent: ScriptComponent | undefined
}

interface NavigationContextValue extends NavigationState {
  setSelectedProject: (project: Project | undefined) => void
  setSelectedVideo: (video: Video | undefined) => void
  setSelectedScript: (script: Script | undefined) => void
  setSelectedComponent: (component: ScriptComponent | undefined) => void
}

const NavigationContext = createContext<NavigationContextValue | undefined>(undefined)

/**
 * Navigation Context Provider
 *
 * Manages hierarchical navigation state: Project → Video → Script → Component
 * When parent selection changes, child selections are cleared to prevent invalid states
 */
export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const [selectedProject, setSelectedProjectState] = useState<Project | undefined>()
  const [selectedVideo, setSelectedVideoState] = useState<Video | undefined>()
  const [selectedScript, setSelectedScriptState] = useState<Script | undefined>()
  const [selectedComponent, setSelectedComponentState] = useState<ScriptComponent | undefined>()

  const setSelectedProject = (project: Project | undefined) => {
    setSelectedProjectState(project)
    // Clear children when parent changes
    setSelectedVideoState(undefined)
    setSelectedScriptState(undefined)
    setSelectedComponentState(undefined)
  }

  const setSelectedVideo = (video: Video | undefined) => {
    setSelectedVideoState(video)
    // Clear children when parent changes
    setSelectedScriptState(undefined)
    setSelectedComponentState(undefined)
  }

  const setSelectedScript = (script: Script | undefined) => {
    setSelectedScriptState(script)
    // Clear children when parent changes
    setSelectedComponentState(undefined)
  }

  const setSelectedComponent = (component: ScriptComponent | undefined) => {
    setSelectedComponentState(component)
  }

  const value: NavigationContextValue = {
    selectedProject,
    selectedVideo,
    selectedScript,
    selectedComponent,
    setSelectedProject,
    setSelectedVideo,
    setSelectedScript,
    setSelectedComponent,
  }

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  )
}

// Hook must be in separate to avoid React refresh warning
// eslint-disable-next-line react-refresh/only-export-components
export function useNavigation(): NavigationContextValue {
  const context = useContext(NavigationContext)
  if (!context) {
    throw new Error('useNavigation must be used within NavigationProvider')
  }
  return context
}

import { useState } from 'react'
import { HierarchicalNavigationSidebar, type Video } from '@elevanaltd/ui'
import { useProjects } from '../hooks/useProjects'
import { useVideos } from '../hooks/useVideos'
import { useNavigation } from '@elevanaltd/shared-lib'

interface ScenesNavigationContainerProps {
  onComponentSelected?: (componentId: string) => void
}

/**
 * Scenes Navigation Container
 *
 * Wrapper around HierarchicalNavigationSidebar with scenes-web specific logic
 * - Fetches projects, videos, scripts, components
 * - Handles navigation state through NavigationContext
 * - Passes data to shared UI component
 *
 * North Star I1: Component spine is immutable in scenes-web
 */
export function ScenesNavigationContainer({ onComponentSelected: _onComponentSelected }: ScenesNavigationContainerProps) {
  const projectsQuery = useProjects()
  const { selectedProject } = useNavigation()
  const videosQuery = useVideos(selectedProject?.eav_code)

  // Track expanded projects locally
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set())

  const handleProjectExpand = (projectId: string) => {
    const newExpanded = new Set(expandedProjects)
    if (newExpanded.has(projectId)) {
      newExpanded.delete(projectId)
    } else {
      newExpanded.add(projectId)
    }
    setExpandedProjects(newExpanded)
  }

  // Transform videos data into the format HierarchicalNavigationSidebar expects
  const videosMap: Record<string, Video[]> = {}
  if (videosQuery.data) {
    const selectedEavCode = selectedProject?.eav_code
    if (selectedEavCode) {
      videosMap[selectedEavCode] = videosQuery.data as Video[]
    }
  }

  return (
    <HierarchicalNavigationSidebar
      projects={projectsQuery.data || []}
      videos={videosMap}
      loading={projectsQuery.isLoading || videosQuery.isLoading}
      error={projectsQuery.error?.message || videosQuery.error?.message}
      expandedProjects={expandedProjects}
      onProjectExpand={handleProjectExpand}
    />
  )
}

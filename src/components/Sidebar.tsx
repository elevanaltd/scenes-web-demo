import React from 'react'
import { useProjects } from '../hooks/useProjects'
import { useVideos } from '../hooks/useVideos'
import { useScripts } from '../hooks/useScripts'
import { useScriptComponents } from '../hooks/useScriptComponents'
import type { Project, Video, Script, ScriptComponent } from '../types'
import './Sidebar.css'

interface SidebarProps {
  selectedProject: Project | undefined
  selectedVideo: Video | undefined
  selectedScript: Script | undefined
  selectedComponent: ScriptComponent | undefined
  onSelectProject: (project: Project) => void
  onSelectVideo: (video: Video) => void
  onSelectScript: (script: Script) => void
  onSelectComponent: (component: ScriptComponent) => void
}

/**
 * Navigation Sidebar
 *
 * Hierarchical drill-down: Projects → Videos → Scripts → Components
 * Components are read-only (displayed but not editable in this app)
 *
 * North Star I1: Component spine is immutable in scenes-web
 */
export function Sidebar({
  selectedProject,
  selectedVideo,
  selectedScript,
  selectedComponent,
  onSelectProject,
  onSelectVideo,
  onSelectScript,
  onSelectComponent,
}: SidebarProps) {
  const projectsQuery = useProjects()
  const videosQuery = useVideos(selectedProject?.id)
  const scriptsQuery = useScripts(selectedVideo?.id)
  const componentsQuery = useScriptComponents(selectedScript?.id)

  return (
    <div className="sidebar">
      {/* Projects Section */}
      <div className="sidebar-section">
        <h3 className="sidebar-title">Projects</h3>
        {projectsQuery.isLoading && <div className="sidebar-loading">Loading...</div>}
        {projectsQuery.error && (
          <div className="sidebar-error">Error loading projects</div>
        )}
        <div className="sidebar-list">
          {projectsQuery.data?.map((project) => (
            <button
              key={project.id}
              className={`sidebar-item ${selectedProject?.id === project.id ? 'active' : ''}`}
              onClick={() => onSelectProject(project)}
            >
              <span className="sidebar-item-title">{project.title}</span>
              <span className="sidebar-item-code">{project.eav_code}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Videos Section */}
      {selectedProject && (
        <div className="sidebar-section">
          <h3 className="sidebar-title">Videos</h3>
          {videosQuery.isLoading && <div className="sidebar-loading">Loading...</div>}
          {videosQuery.error && (
            <div className="sidebar-error">Error loading videos</div>
          )}
          <div className="sidebar-list">
            {videosQuery.data?.map((video) => (
              <button
                key={video.id}
                className={`sidebar-item ${selectedVideo?.id === video.id ? 'active' : ''}`}
                onClick={() => onSelectVideo(video)}
              >
                <span className="sidebar-item-title">{video.title}</span>
                <span className="sidebar-item-code">{video.eav_code}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Scripts Section */}
      {selectedVideo && (
        <div className="sidebar-section">
          <h3 className="sidebar-title">Scripts</h3>
          {scriptsQuery.isLoading && <div className="sidebar-loading">Loading...</div>}
          {scriptsQuery.error && (
            <div className="sidebar-error">Error loading scripts</div>
          )}
          <div className="sidebar-list">
            {scriptsQuery.data?.map((script) => (
              <button
                key={script.id}
                className={`sidebar-item ${selectedScript?.id === script.id ? 'active' : ''}`}
                onClick={() => onSelectScript(script)}
              >
                <span className="sidebar-item-title">
                  {script.plain_text.substring(0, 30)}...
                </span>
                <span className="sidebar-item-meta">
                  Status: {script.status} | {script.component_count} components
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Components Section (Read-Only) */}
      {selectedScript && (
        <div className="sidebar-section">
          <h3 className="sidebar-title">Components (Read-Only)</h3>
          {componentsQuery.isLoading && <div className="sidebar-loading">Loading...</div>}
          {componentsQuery.error && (
            <div className="sidebar-error">Error loading components</div>
          )}
          <div className="sidebar-list">
            {componentsQuery.data?.map((component) => (
              <button
                key={component.id}
                className={`sidebar-item read-only ${selectedComponent?.id === component.id ? 'active' : ''}`}
                onClick={() => onSelectComponent(component)}
              >
                <span className="sidebar-item-title">
                  Component {component.component_number}
                </span>
                <span className="sidebar-item-preview">
                  {component.content.substring(0, 40)}...
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

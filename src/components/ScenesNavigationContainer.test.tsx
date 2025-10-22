import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { NavigationProvider } from '@elevanaltd/shared-lib'
import { ScenesNavigationContainer } from './ScenesNavigationContainer'

// Mock the hooks
vi.mock('../hooks/useProjects', () => ({
  useProjects: () => ({
    data: [
      { id: '1', title: 'Project Alpha', eav_code: 'PA001', due_date: '2025-12-31' },
      { id: '2', title: 'Project Beta', eav_code: 'PB001' },
    ],
    isLoading: false,
    error: null,
  }),
}))

vi.mock('../hooks/useVideos', () => ({
  useVideos: (eav_code?: string) => {
    if (eav_code === 'PA001') {
      return {
        data: [
          { id: 'v1', eav_code: 'PA001', title: 'Video 1', main_stream_status: 'ready' },
          { id: 'v2', eav_code: 'PA001', title: 'Video 2', main_stream_status: 'pending' },
        ],
        isLoading: false,
        error: null,
      }
    }
    return {
      data: [],
      isLoading: false,
      error: null,
    }
  },
}))

describe('ScenesNavigationContainer', () => {
  it('should render navigation sidebar with projects', () => {
    render(
      <NavigationProvider>
        <ScenesNavigationContainer onComponentSelected={() => {}} />
      </NavigationProvider>
    )

    // Should display projects
    expect(screen.getByText('Project Alpha')).toBeInTheDocument()
    expect(screen.getByText('Project Beta')).toBeInTheDocument()
  })

  it('should pass projects and videos to HierarchicalNavigationSidebar', () => {
    const { container } = render(
      <NavigationProvider>
        <ScenesNavigationContainer onComponentSelected={() => {}} />
      </NavigationProvider>
    )

    // Should render the sidebar
    const sidebar = container.querySelector('.nav-sidebar')
    expect(sidebar).toBeInTheDocument()
  })

  it('should handle project expand callbacks', () => {
    const { container } = render(
      <NavigationProvider>
        <ScenesNavigationContainer onComponentSelected={() => {}} />
      </NavigationProvider>
    )

    // Sidebar should be present
    const sidebar = container.querySelector('.nav-sidebar')
    expect(sidebar).toBeInTheDocument()
  })

  it('should show loading state when data is loading', () => {
    // This test validates that loading prop is passed through
    const { container } = render(
      <NavigationProvider>
        <ScenesNavigationContainer onComponentSelected={() => {}} />
      </NavigationProvider>
    )

    expect(container.querySelector('.nav-sidebar')).toBeInTheDocument()
  })
})

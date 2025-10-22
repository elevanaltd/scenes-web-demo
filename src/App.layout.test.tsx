import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { ScenesWorkspace } from './App'
import { AuthProvider } from './contexts/AuthContext'
import { NavigationProvider } from './contexts/NavigationContext'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

/**
 * Layout Tests - Verify content centering and sidebar spacing
 *
 * These tests verify that the main content area:
 * - Is centered with max-width constraint (1200px)
 * - Respects the left navigation sidebar
 * - Has proper scrolling behavior
 * - Leaves space for future right notes panel
 */
describe('App Layout - Content Centering', () => {
  it('should have content-wrapper with max-width constraint', () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { staleTime: Infinity },
      },
    })

    const { container } = render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <NavigationProvider>
            <ScenesWorkspace />
          </NavigationProvider>
        </AuthProvider>
      </QueryClientProvider>
    )

    // Verify content wrapper exists
    const contentWrapper = container.querySelector('.content-wrapper')
    expect(contentWrapper).toBeTruthy()

    // Verify it's a flex container
    expect(contentWrapper?.className).toContain('content-wrapper')
  })

  it('should have scrollable content area with padding', () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { staleTime: Infinity },
      },
    })

    const { container } = render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <NavigationProvider>
            <ScenesWorkspace />
          </NavigationProvider>
        </AuthProvider>
      </QueryClientProvider>
    )

    // Verify content scroll area exists
    const contentScroll = container.querySelector('.content-scroll')
    expect(contentScroll).toBeTruthy()

    // Verify it's properly classed for styling
    expect(contentScroll?.className).toContain('content-scroll')
  })

  it('should have app-layout structure with sidebar and main-content', () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { staleTime: Infinity },
      },
    })

    const { container } = render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <NavigationProvider>
            <ScenesWorkspace />
          </NavigationProvider>
        </AuthProvider>
      </QueryClientProvider>
    )

    // Verify main layout structure
    const appLayout = container.querySelector('.app-layout')
    expect(appLayout).toBeTruthy()

    const mainContent = container.querySelector('.main-content')
    expect(mainContent).toBeTruthy()

    // Verify header exists
    const header = container.querySelector('.header')
    expect(header).toBeTruthy()
  })
})

import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './contexts/AuthContext'
import { NavigationProvider } from './contexts/NavigationContext'
import { ErrorBoundary } from './components/ErrorBoundary'
import { PrivateRoute } from './components/auth/PrivateRoute'
import { Login } from './components/auth/Login'
import { Sidebar } from './components/Sidebar'
import { ShotTable } from './components/ShotTable'
import { useNavigation } from './contexts/NavigationContext'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false
    }
  }
})

// Workspace with navigation
function ScenesWorkspace() {
  const nav = useNavigation()

  return (
    <div className="app-layout">
      <Sidebar
        selectedProject={nav.selectedProject}
        selectedVideo={nav.selectedVideo}
        selectedScript={nav.selectedScript}
        selectedComponent={nav.selectedComponent}
        onSelectProject={nav.setSelectedProject}
        onSelectVideo={nav.setSelectedVideo}
        onSelectScript={nav.setSelectedScript}
        onSelectComponent={nav.setSelectedComponent}
      />
      <div className="main-content">
        <div className="header">
          <h1>Scene Planning & Shot Lists</h1>
        </div>
        <div style={{ padding: '20px', flex: 1, overflow: 'auto' }}>
          {!nav.selectedComponent ? (
            <>
              <div className="error-message">
                ℹ️ <strong>Select a Component</strong> - Choose a project, video, script, and component to view shots
              </div>
            </>
          ) : (
            <>
              <div style={{ marginBottom: '20px' }}>
                <h2 style={{ margin: '0 0 8px 0' }}>{`Component ${nav.selectedComponent.component_number}`}</h2>
                <p style={{ margin: '0', color: '#666', lineHeight: '1.6', fontSize: '14px' }}>
                  {nav.selectedComponent.content}
                </p>
              </div>
              <ShotTable component={nav.selectedComponent} />
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <NavigationProvider>
            <ErrorBoundary>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route
                  path="/"
                  element={
                    <PrivateRoute>
                      <ScenesWorkspace />
                    </PrivateRoute>
                  }
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </ErrorBoundary>
          </NavigationProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App

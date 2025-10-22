import React, { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import '@elevanaltd/ui/dist/index.css'
import { AuthProvider } from './contexts/AuthContext'
import { NavigationProvider } from './contexts/NavigationContext'
import { ErrorBoundary } from './components/ErrorBoundary'
import { PrivateRoute } from './components/auth/PrivateRoute'
import { Login } from './components/auth/Login'
import { ScenesNavigationContainer } from './components/ScenesNavigationContainer'
import { ShotTable } from './components/ShotTable'
import { useNavigation } from './contexts/NavigationContext'
import { useScriptComponents } from './hooks/useScriptComponents'
import type { ScriptComponent } from './types'

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
export function ScenesWorkspace() {
  const nav = useNavigation()
  const componentsQuery = useScriptComponents(nav.selectedScript?.id)
  const [expandedComponents, setExpandedComponents] = useState<Set<string>>(new Set())

  const toggleComponent = (componentId: string) => {
    setExpandedComponents(prev => {
      const newSet = new Set(prev)
      if (newSet.has(componentId)) {
        newSet.delete(componentId)
      } else {
        newSet.add(componentId)
      }
      return newSet
    })
  }

  return (
    <div className="app-layout">
      <ScenesNavigationContainer
        onComponentSelected={(componentId) => {
          const component = componentsQuery.data?.find(c => c.id === componentId)
          if (component) {
            nav.setSelectedComponent(component)
          }
        }}
      />
      <div className="main-content">
        <div className="header">
          <h1>Scene Planning & Shot Lists</h1>
        </div>
        <div className="content-wrapper">
          <div className="content-scroll">
            {!nav.selectedScript ? (
              <>
                <div className="error-message">
                  ℹ️ <strong>Select a Script</strong> - Choose a project, video, and script to view all components and shots
                </div>
              </>
            ) : (
              <>
                {componentsQuery.isLoading && <div className="error-message">Loading components...</div>}
                {componentsQuery.error && (
                  <div className="error-message" style={{ background: '#fee', borderColor: '#fcc', color: '#c33' }}>
                    Error loading components: {componentsQuery.error?.message}
                  </div>
                )}
                {componentsQuery.data && componentsQuery.data.length === 0 && (
                  <div className="error-message">No components found for this script</div>
                )}
                {componentsQuery.data && componentsQuery.data.map((component: ScriptComponent) => (
                  <div
                    key={component.id}
                    style={{
                      marginBottom: '20px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      overflow: 'hidden',
                      background: 'white',
                    }}
                  >
                    <button
                      onClick={() => toggleComponent(component.id)}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        background: '#f5f5f5',
                        border: 'none',
                        borderBottom: expandedComponents.has(component.id) ? '1px solid #ddd' : 'none',
                        cursor: 'pointer',
                        textAlign: 'left',
                        fontWeight: 500,
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span>Scene {component.component_number}: {component.content.substring(0, 50)}...</span>
                      <span>{expandedComponents.has(component.id) ? '▼' : '▶'}</span>
                    </button>
                    {expandedComponents.has(component.id) && (
                      <div style={{ padding: '16px' }}>
                        <div style={{ marginBottom: '16px' }}>
                          <h3 style={{ margin: '0 0 8px 0' }}>{`Scene ${component.component_number}`}</h3>
                          <p style={{ margin: '0', color: '#666', lineHeight: '1.6', fontSize: '14px' }}>
                            {component.content}
                          </p>
                        </div>
                        <ShotTable component={component} />
                      </div>
                    )}
                  </div>
                ))}
              </>
            )}
          </div>
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

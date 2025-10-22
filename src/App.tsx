import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './contexts/AuthContext'
import { ErrorBoundary } from './components/ErrorBoundary'
import { PrivateRoute } from './components/auth/PrivateRoute'
import { Login } from './components/auth/Login'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false
    }
  }
})

// Placeholder component for now
function ScenesWorkspace() {
  return (
    <div className="app-layout">
      <div className="sidebar">
        <div style={{ padding: '16px', borderBottom: '1px solid #ddd' }}>
          <h2>Navigation</h2>
          <p style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
            Coming soon: Projects &gt; Videos &gt; Scripts &gt; Components
          </p>
        </div>
      </div>
      <div className="main-content">
        <div className="header">
          <h1>Scene Planning & Shot Lists</h1>
        </div>
        <div style={{ padding: '20px', flex: 1, overflow: 'auto' }}>
          <div className="error-message">
            ℹ️ <strong>Beta Version</strong> - Infrastructure ready, features being built
          </div>
          <p style={{ marginTop: '16px', color: '#666' }}>
            This application provides scene planning and shot list management for production workflows.
          </p>
          <p style={{ marginTop: '12px', color: '#666' }}>
            Connected to: scene_planning_state, shots, dropdown_options, production_notes tables
          </p>
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
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App

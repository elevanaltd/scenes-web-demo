import React from 'react'
import { useAuth } from '../hooks/useAuth'
import './HeaderMockup.css'

/**
 * MOCKUP: Shared Header Component Pattern
 *
 * This demonstrates the design for extraction to @elevanaltd/ui
 * Shows the BUTTONS APPROACH (recommended for simplicity)
 *
 * Layout is ALWAYS:
 * [Title] [SavedStatus - Time] [UserEmail] [Settings] [Logout]
 *
 * Styling: Identical across all apps
 * Logic: App-specific props configure behavior
 *
 * Props:
 * - title: string (per-app title, e.g. "EAV Orchestrator", "Script Editor", "Scene Planning")
 * - lastSaved?: Date (app passes save timestamp, UI just formats)
 * - onLogout: () => void (app handles auth)
 * - onSettings?: () => void (optional: app can open modal/drawer for settings)
 */

interface HeaderProps {
  title: string
  lastSaved?: Date
  onLogout: () => void
  onSettings: () => void  // Always required - all apps have settings
}

export function Header({ title, lastSaved, onLogout, onSettings }: HeaderProps) {
  const { user: currentUser } = useAuth()

  const formatSaveTime = (date: Date): string => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)

    if (seconds < 60) return `${seconds}s ago`
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return date.toLocaleDateString()
  }

  return (
    <header className="app-header-mockup">
      {/* LEFT: Title (App-configurable) */}
      <div className="header-left">
        <h1 className="header-title">{title}</h1>
      </div>

      {/* CENTER: Save Status (Identical styling, app configures logic) */}
      <div className="header-center">
        {lastSaved && (
          <div className="save-status">
            <span className="save-label">Saved</span>
            <span className="save-time">{formatSaveTime(lastSaved)}</span>
          </div>
        )}
      </div>

      {/* RIGHT: User Controls */}
      <div className="header-right">
        {/* Auth Display - IDENTICAL across apps */}
        <div className="user-info">
          <span className="user-email">{currentUser?.email}</span>
        </div>

        {/* Settings Button - ALWAYS shown, STYLE identical, content app-specific */}
        <button
          className="settings-button-plain"
          onClick={onSettings}
          type="button"
          aria-label="Settings"
          title="Settings"
        >
          ⚙️
        </button>
      </div>
    </header>
  )
}

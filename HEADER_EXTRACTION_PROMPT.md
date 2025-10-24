# Extract Header Component to @elevanaltd/ui

**Status:** Ready for Implementation
**North Star:** I2-I6 (multi-app ecosystem, identical UI across apps)
**Phase:** B3 (new app bootstrap)
**Priority:** High - Unblocks scripts-web and scenes-web integration

---

## Objective

Extract a reusable `<Header>` component that works identically across **ALL 7 EAV apps** (scripts-web, scenes-web, vo-web, cam-op-pwa, edit-web, translations-web, data-entry-web) while allowing app-specific customization of title, save status display, and settings panel content.

---

## What We're Solving

**Current State:**
- ❌ scripts-web has inline `Header.tsx` component with ScriptStatus display
- ❌ scenes-web has inline header in `App.tsx` markup
- ❌ Future apps (vo-web, etc.) will copy/paste code duplication

**Desired State:**
- ✅ Single Header component in @elevanaltd/ui
- ✅ Identical layout and styling across all apps
- ✅ App-specific customization points (title, save status logic, settings content)

---

## Design Pattern: Header with Settings Drawer

```
┌──────────────────────────────────────────────────┐
│ [Title] [SaveStatus] [Email] [Settings ⚙️] │
└──────────────────────────────────────────────────┘
   left      center    right

Settings panel (app-specific, opens when ⚙️ clicked):
- App-specific settings UI
- Logout button at bottom
```

**Key Insight:** Styling is identical. Logic is app-specific.

- **Settings button** opens a drawer/modal/panel in the **app** (not in Header)
- **Settings button** is **ALWAYS visible** (required on all apps)
- **Logout button** lives **INSIDE** the settings panel (app controls where/how)
- **Save status** formatting is identical, but data comes from app

---

## Component Signature

```typescript
interface HeaderProps {
  /** App-specific title (e.g., "Script Editor", "Scene Planning", "Voice Over Manager") */
  title: string

  /** Save status timestamp - UI formats as "Saved 5s ago" or "Saved 3m ago" */
  lastSaved?: Date

  /** Callback when onLogout is triggered (app handles auth state) */
  onLogout: () => void

  /** Required: Callback when settings button clicked (app opens drawer/modal) */
  onSettings: () => void
}

export function Header(props: HeaderProps): JSX.Element
```

---

## Implementation Details

### Component Structure

```jsx
<header className="app-header">
  {/* LEFT: Title (app-configurable) */}
  <div className="header-left">
    <h1 className="header-title">{title}</h1>
  </div>

  {/* CENTER: Save Status (identical styling, app configures logic) */}
  <div className="header-center">
    {lastSaved && (
      <div className="save-status">
        <span className="save-label">Saved</span>
        <span className="save-time">{formatTime(lastSaved)}</span>
      </div>
    )}
  </div>

  {/* RIGHT: User Controls (identical buttons, app configures actions) */}
  <div className="header-right">
    <div className="user-info">
      <span className="user-email">{currentUser?.email}</span>
    </div>
    <button className="settings-button" onClick={onSettings} aria-label="Settings">
      ⚙️
    </button>
  </div>
</header>
```

### Time Formatting Logic

Implement in component:
- "Saved" + formatted time display
- Format: "5s ago", "3m ago", "2h ago", or full date
- Reference implementation: `/Volumes/HestAI-Projects/eav-ops/eav-app-demos/scenes-web-demo-1/src/components/HeaderMockup.tsx`

### Styling Requirements

**Key Specifications:**
- Fixed positioning: `position: fixed; top: 0; left: 0; right: 0; z-index: 1000`
- Height: `64px` (consistent with app layout spacing)
- Layout: 3-column grid `grid-template-columns: 1fr auto 1fr`
- Background: `white` with subtle bottom border and shadow
- Responsive: Hide save status on mobile, always show settings button

**Color Scheme:**
- Title text: `#1f2937` (dark gray)
- User email: `#6b7280` (medium gray)
- Save status background: `#f9fafb` with `#e5e7eb` border
- Settings button: Transparent with hover state `#f3f4f6`
- All text and button sizing per scripts-web Header.css reference

**Mobile Breakpoints:**
- Tablet (< 768px): Reduce padding, hide save status label
- Mobile (< 480px): Hide entire save status, reduce font sizes

---

## Acceptance Criteria

### Functionality
- [ ] Component renders with all prop combinations
- [ ] Settings button always visible (no conditional rendering)
- [ ] User email pulled from `useAuth()` from @elevanaltd/shared-lib
- [ ] Save time formats correctly (5s/3m/2h ago or full date)
- [ ] Responsive layout works on desktop/tablet/mobile
- [ ] All buttons have proper accessibility attributes

### Code Quality
- [ ] Co-located test file: `Header.test.tsx`
- [ ] Test coverage: ≥80% (minimum 8 test cases)
- [ ] TypeScript strict mode: Zero errors
- [ ] `npm run validate` passes (lint + typecheck + test)
- [ ] No PropTypes, no console warnings

### Integration
- [ ] Export in barrel: `src/index.ts`
- [ ] No breaking changes to existing exports
- [ ] Existing scripts-web Header can be replaced (single import)
- [ ] Type definitions exported with component

### Testing

Required test cases:
```typescript
describe('Header', () => {
  describe('Rendering', () => {
    it('renders title from props')
    it('renders user email from useAuth()')
    it('renders save status when lastSaved provided')
    it('always renders settings button')
  })

  describe('Interactions', () => {
    it('calls onSettings when settings button clicked')
    it('calls onLogout when passed (verify props accepted)')
  })

  describe('Formatting', () => {
    it('formats save time: "Saved 5s ago"')
    it('formats save time: "Saved 3m ago"')
    it('formats save time: "Saved 2h ago"')
    it('formats save time: full date after 24 hours')
  })

  describe('Responsive Design', () => {
    it('hides save status label on tablet')
    it('hides save status entirely on mobile')
    it('keeps settings button visible on all sizes')
  })
})
```

### Build & Publication
- [ ] Package builds without errors
- [ ] Version bump: minor (0.1.8 → 0.1.9)
- [ ] Published to GitHub Packages (@elevanaltd/ui@0.1.9+)
- [ ] Git commit message: `feat: Extract Header component for multi-app use`

---

## How Apps Will Use It

### scripts-web Example
```typescript
import { Header } from '@elevanaltd/ui'
import { useScriptStatus } from './contexts/ScriptStatusContext'

export function ScriptsEditor() {
  const { logout } = useAuth()
  const { lastSaved } = useScriptStatus()
  const [showSettings, setShowSettings] = useState(false)

  return (
    <>
      <Header
        title="Script Editor"
        lastSaved={lastSaved}
        onLogout={logout}
        onSettings={() => setShowSettings(true)}
      />
      {showSettings && <SettingsDrawer onClose={() => setShowSettings(false)} />}
      {/* rest of app */}
    </>
  )
}
```

### scenes-web Example
```typescript
import { Header } from '@elevanaltd/ui'

export function ScenesApp() {
  const { logout } = useAuth()
  const [showSettings, setShowSettings] = useState(false)
  const [lastSaveTime] = useState<Date | undefined>(/* get from state */)

  return (
    <>
      <Header
        title="Scene Planning"
        lastSaved={lastSaveTime}
        onLogout={logout}
        onSettings={() => setShowSettings(true)}
      />
      {showSettings && (
        <SettingsModal onClose={() => setShowSettings(false)}>
          <div>App-specific settings here</div>
          <button onClick={logout}>Logout</button>
        </SettingsModal>
      )}
      {/* rest of app */}
    </>
  )
}
```

---

## Reference Implementation

**Complete working implementation available:**
- Component: `/Volumes/HestAI-Projects/eav-ops/eav-app-demos/scenes-web-demo-1/src/components/HeaderMockup.tsx`
- Tests: `/Volumes/HestAI-Projects/eav-ops/eav-app-demos/scenes-web-demo-1/src/components/HeaderMockup.test.tsx` (9/9 passing)
- CSS: `/Volumes/HestAI-Projects/eav-ops/eav-app-demos/scenes-web-demo-1/src/components/HeaderMockup.css`
- Live demo integrated in App.tsx with working settings panel

You can see working Header in the demo app (click ⚙️ to see settings panel behavior).

---

## TDD Discipline

1. **RED:** Write failing tests for all requirements above
2. **GREEN:** Implement minimal component to pass tests
3. **REFACTOR:** Improve code while keeping tests green
4. **REVIEW:** Code review by code-review-specialist before merge

---

## Timeline & Effort

- **Estimate:** 2-3 hours
- **Breaking changes:** None (new component, no modifications to existing)
- **Dependencies:** @elevanaltd/shared-lib (already in place)
- **Blocking:** No (can integrate immediately when ready)

---

## Questions to Clarify

1. ✅ Should settings button always show? **Yes - all apps have settings**
2. ✅ Should logout be in Header? **No - in settings panel (app-specific)**
3. ❌ Should we support dark mode? **Defer to Phase 4**
4. ❌ Should we internationalize labels? **Defer to Phase 4**

---

## Definition of Done

Component is ready for integration when:
- ✅ All tests passing
- ✅ `npm run validate` passes
- ✅ Code reviewed and approved
- ✅ Published to GitHub Packages
- ✅ Documentation updated in README
- ✅ Existing apps can import and use with 2-line changes

---

**Ready to build! 🚀**

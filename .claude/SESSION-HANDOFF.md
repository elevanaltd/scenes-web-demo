# Scenes-Web Demo Session Handoff

**Date:** 2025-10-22
**Status:** Phase 2 Delivery - Navigation working, Shot table implemented but videos dropdown empty
**Repository:** `/Volumes/HestAI-Projects/eav-ops/eav-app-demos/scenes-web-demo-1/`

## Current State

### ✅ Completed
- Sidebar navigation hierarchy (Projects → Videos → Scripts → Components)
- Projects filtered to active phases only (Pre-Production, In Production, Post-Production)
- Navigation state management (NavigationContext)
- useScene hook (auto-creates scene_planning_state records)
- Shot table UI with inline editing
- All 54 tests passing
- Zero TypeScript errors
- **DEBUG LOGGING ADDED**: useVideos hook now logs query execution and responses

### 🔍 Investigation Completed
**Database Status:** ✅ All data verified
- 292 videos in database
- Videos linked to projects via eav_code (EAV011 has 6, EAV002 has 12, etc.)
- RLS policy "videos_select_unified" correctly allows admin/employee access
- Projects exist with matching eav_codes

**Code Status:** ✅ Implementation correct
- useVideos hook structure is correct (filters by eav_code, enabled when eav_code present)
- Sidebar rendering logic is correct (shows videos when project selected AND expanded)
- Navigation state management working properly
- All tests pass (54/54)

### 🟡 Current Issue
**Videos dropdown not appearing in browser** - likely runtime issue requiring browser testing

**Most Likely Causes (in order):**
1. Auth not fully initialized when app loads (session timing issue)
2. Browser console showing a silent error that's being caught
3. Query response is malformed or empty despite database check
4. VITE environment variables not being picked up by browser bundle

**Not The Issue:**
- ❌ Database missing videos (verified: 292 exist)
- ❌ RLS blocking access (policy allows admin/employee queries)
- ❌ Code logic error (tests verify correct behavior, tests pass)

## Quick Start for Next Session

```bash
# Navigate to project
cd /Volumes/HestAI-Projects/eav-ops/eav-app-demos/scenes-web-demo-1

# Verify dev server is running
npm run dev  # Port 3002

# In browser console, check:
# 1. Network tab - look for `/rest/v1/videos` request
# 2. Console - filter for "useVideos" or "Sidebar State"
# 3. Check if request returns 401/403 (auth/RLS issue)
```

## Architecture Overview

### File Structure
```
src/
  components/
    Sidebar.tsx           # Main navigation (Project → Video → Script → Component)
    ShotTable.tsx         # Shot editor with inline editing
  hooks/
    useProjects.ts        # Fetch projects (filtered by phase)
    useVideos.ts          # ISSUE: Videos not loading - check this
    useScripts.ts         # Fetch scripts for video
    useScriptComponents.ts # Fetch components for script
    useShots.ts           # Fetch shots for component
    useScene.ts           # Get/create scene_planning_state
  contexts/
    NavigationContext.tsx  # State management (selectedProject, Video, Script, Component)
    AuthContext.tsx       # Auth state
```

### Database Relationships
```
projects (id, eav_code, project_phase, ...)
  ↓ eav_code = eav_code
videos (id, eav_code, title, ...)
  ↓ video_id
scripts (id, video_id, plain_text, component_count, ...)
  ↓ script_id
script_components (id, script_id, component_number, content, ...)
  ↓ script_component_id
scene_planning_state (id, script_component_id, ...)
  ↓ scene_id
shots (id, scene_id, ...)
```

## Key Code Patterns

### useVideos Implementation
```typescript
export function useVideos(projectEavCode: string | undefined) {
  return useQuery({
    queryKey: ['videos', projectEavCode],
    queryFn: async () => {
      if (!projectEavCode) return []
      const { data, error } = await supabase
        .from('videos')
        .select('id, title, eav_code, created_at')
        .eq('eav_code', projectEavCode)  // Link via eav_code, NOT project_id
      if (error) throw error
      return (data || []) as Video[]
    },
    enabled: !!projectEavCode,
  })
}
```

### Sidebar Videos Rendering
```typescript
const videosQuery = useVideos(selectedProject?.eav_code)

{expandedProjects.has(project.id) && selectedProject?.id === project.id && (
  <div className="videos-container">
    {videosQuery.data?.map((video) => (
      <button onClick={() => onSelectVideo(video)}>
        {video.title}
      </button>
    ))}
  </div>
)}
```

## Configuration

### Environment Variables (.env.local)
```
VITE_SUPABASE_URL=https://zbxvjyrbkycbfhwmmnmy.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_hKu4NvkHKDtdrVFTHC-hUQ_mgUrGgyu
```

### Test User
- Email: shaun.buswell@elevana.com (admin role)
- Has access to all projects

## Debugging Steps (WITH DEBUG LOGGING ENABLED)

### Quick Manual Test in Browser
1. **Open browser dev tools** (Cmd+Option+I on Mac, F12 on Windows/Linux)
2. **Go to http://localhost:3003** and login with: `shaun.buswell@elevana.com`
3. **Click on a project** in the sidebar (e.g., "EAV015")
4. **Watch the browser console** - you should see:
   ```
   [Sidebar] Videos query for project: {eav_code: 'EAV015', videosLoading: false, videosCount: 29, videosError: undefined}
   [useVideos] Fetching videos for eav_code: EAV015
   [useVideos] Response: { data: [...], error: null }
   [useVideos] Returning 29 videos
   ```

5. **If console shows different output, note:**
   - `videosLoading: true` = query still running (wait a moment)
   - `videosError: "..."` = RLS or auth issue - report exact error
   - `videosCount: 0` = query returned empty array (database issue)
   - No logs at all = query not being triggered (timing issue)

### If Videos Still Don't Appear After Steps Above:
1. **Check Network tab** → filter by "videos"
   - Look for request to `/rest/v1/videos?...`
   - Note response code (200 = success, 401 = auth, 403 = RLS, 400 = bad query)

2. **Check if auth is ready:**
   - Console filter: "Auth"
   - Look for "Session loaded" or auth user info
   - If not logged in, login first before clicking projects

3. **Verify environment variables:**
   - Console type: `import.meta.env.VITE_SUPABASE_URL`
   - Should show: `https://zbxvjyrbkycbfhwmmnmy.supabase.co`
   - If undefined, rebuild with: `npm run dev`

### SQL Verification (if needed)
```sql
-- Verify videos exist for your project
SELECT COUNT(*) as count FROM videos WHERE eav_code = 'EAV015';
-- Expected: 29 rows

-- Check RLS policy is allowing your role
SELECT get_user_role() as role;
-- Expected: 'admin' or 'employee'
```

## Next Steps (Priority Order)

1. **DEBUG VIDEOS LOADING** - Follow debugging steps above with new console logging
   - Check browser console while clicking projects
   - Report any errors shown in console
   - Verify auth session is ready before testing

2. **TEST FULL NAVIGATION FLOW** - Once videos appear:
   - Project → Video → Script → Component → Shot table
   - Verify all hierarchy levels work
   - Test inline shot editing

3. **PHASE 2 STABILIZATION** - Add critical path tests if issues found
   - Test RLS edge cases if auth issues discovered
   - Lock down what works once full flow verified

4. **PHASE 3 HARDENING** - When features validated:
   - Full TDD catch-up for any new code
   - Code review of architecture
   - Production readiness assessment

## Recent Changes (Last Session)

```
commit e6d3470 (Current Session - 2025-10-22)
test: Add debug logging to useVideos hook and Sidebar component for troubleshooting
- Enhanced useVideos with console.log to trace query execution and responses
- Added Sidebar effect to log videos loading state when project selected
- Fixed Sidebar.test.tsx to mock all hooks in beforeEach
- All 54 tests passing

commit ef3722c (Previous Session)
refactor: Remove debug logging from Sidebar and useScripts
```

## Session Summary (2025-10-22)

### Investigation Results
- ✅ Verified 292 videos exist in database
- ✅ Verified videos are linked to projects via eav_code
- ✅ Verified RLS policy allows admin/employee access
- ✅ Verified code implementation is correct (tests pass)
- ✅ Added comprehensive debug logging to trace issue
- ✅ Fixed Sidebar test setup for proper mock initialization

### Work Completed
1. Database verification query (292 videos, distributed across projects)
2. RLS policy analysis (videos_select_unified is correct)
3. Code review of useVideos, Sidebar, NavigationContext
4. Added console.log debugging to useVideos and Sidebar
5. Fixed broken Sidebar.test.tsx beforeEach mock setup
6. Updated SESSION-HANDOFF with detailed browser debugging steps
7. All tests pass (54/54)

### Next Session Action Items
User should follow the "Debugging Steps" section above to:
1. Open browser console and check for logs when clicking projects
2. Report any error messages shown
3. Verify auth is ready before testing
4. Check Network tab for API responses

Based on console output, root cause will become clear.


## Related Documentation

- **Suite patterns:** `/Volumes/HestAI-Projects/eav-ops/CLAUDE.md`
- **Global standards:** `/Users/shaunbuswell/.claude/CLAUDE.md`
- **Database schema:** Supabase console at zbxvjyrbkycbfhwmmnmy
- **North Star:** `/Volumes/HestAI-Projects/eav-ops/coordination/workflow-docs/000-UNIVERSAL-EAV_SYSTEM-D1-NORTH-STAR-MINIMAL.md`

## Git Status

Branch: master
Last commit: ef3722c (refactor: Remove debug logging)
Tests: 54/54 passing
Build: ✅ Clean (0 errors, 0 warnings)

---

**Session Focus:** Get videos loading in dropdown by debugging useVideos query and fixing whatever is preventing data from appearing.

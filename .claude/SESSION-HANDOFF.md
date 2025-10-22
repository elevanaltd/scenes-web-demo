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

### 🔴 Current Issue
**Videos dropdown shows NO VIDEOS** even though data exists in database

**Symptoms:**
- Projects appear in sidebar
- Click project to expand → no videos show (should show 6+ videos per project)
- useVideos query not loading any data
- No console errors reported

**Last Working State:**
- Yesterday: Videos were loading with `useVideos(selectedProject?.eav_code)`
- Query was filtering by `eav_code` correctly
- Data was appearing in console logs

**Suspected Root Cause:**
- Videos query might have RLS policy blocking access
- OR environment variables changed
- OR useVideos hook has stale implementation

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

## Debugging Steps

1. **Check if videos exist in database:**
   ```sql
   SELECT COUNT(*) as video_count FROM videos WHERE eav_code = 'EAV011';
   ```

2. **Test useVideos directly in console:**
   ```javascript
   // After app loads, add to Sidebar.tsx:
   React.useEffect(() => {
     if (selectedProject?.eav_code) {
       console.log('Testing with eav_code:', selectedProject.eav_code)
     }
   }, [selectedProject])
   ```

3. **Check Supabase RLS policies:**
   - Videos table must be readable by authenticated users
   - Check if RLS is blocking queries

4. **Verify API calls:**
   - Network tab should show: `GET /rest/v1/videos?select=...&eav_code=eq.EAV011`
   - If getting 401/403, it's an auth issue
   - If getting 400, it's a query syntax issue

## Next Steps (Priority Order)

1. **FIX VIDEOS LOADING** - Use debugging steps above to identify RLS/auth issue
2. **Simplify architecture** - Remove Script selection layer (Project → Video → Components directly)
3. **Test full flow** - Project → Video → Scripts → Components → Shot table
4. **Phase 3 hardening** - Full TDD catch-up, code review, production testing

## Recent Changes (Last Commit)

```
commit ef3722c
refactor: Remove debug logging from Sidebar and useScripts
```

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

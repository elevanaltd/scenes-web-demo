import { createBrowserClient } from '@elevanaltd/shared-lib/client'

// North Star I6: App-specific state tables
// This app reads shared script_components and maintains independent shots/scene_planning_state
export const supabase = createBrowserClient()

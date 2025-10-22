# EAV Scenes Web

Scene planning and shot list management for production workflows.

## Features

- Navigate projects → videos → scripts → script components
- Create and manage shots for each scene (read-only script_components)
- Add production notes to individual shots
- Configure global dropdown options (status, location, action, shot_type, subject)
- Independent authentication from scripts-web

## Setup

```bash
# Install dependencies
npm install

# Create .env.local with Supabase credentials
cp .env.example .env.local

# Start development server
npm run dev
```

## Build

```bash
# Validate (lint + typecheck + test)
npm run validate

# Build for production
npm run build

# Preview production build
npm run preview
```

## Database

Schema is shared with scripts-web (same Supabase project).

Tables:
- `scene_planning_state` - Links script_components to scenes
- `shots` - Individual shots with metadata
- `dropdown_options` - Global configuration for dropdown fields
- `production_notes` - Comments on shots

## Architecture

- **Sidebar Navigation**: Projects → Videos → Scripts → Components (read-only)
- **Shot Table**: Add/edit/delete shots with dropdown fields
- **Production Notes**: Thread-based comments on shots
- **Settings**: Manage global dropdown options

## Pattern Replication

Built on scripts-web patterns:
- Supabase client initialization via `@elevanaltd/shared-lib`
- Auth context with session management
- Navigation context for hierarchical state
- Custom hooks for data fetching
- Mapper layer for type-safe domain models
- Test infrastructure with Vitest + factories

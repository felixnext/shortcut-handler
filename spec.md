# Keyboard Shortcuts Lookup Tool - Specification

## Overview

A modern, web-based keyboard shortcuts reference tool designed to help users quickly find and manage keyboard shortcuts across multiple applications and tools. The application provides fuzzy search, categorization, and a clean interface for discovering shortcuts.

## Core Features

### 1. Shortcut Management
- Display keyboard shortcuts for multiple tools (vim, vscode, tmux, raycast, etc.)
- Support for complex key combinations (chords, sequences, modifiers)
- Platform-aware shortcuts (Mac/Windows/Linux)
- Categories for organizing shortcuts (cursor movement, editing, navigation, etc.)

### 2. Search & Filter
- Fuzzy search for function names
- Search by key combination
- Search within descriptions
- Quick filter by tool
- Filter by category

### 3. Data Persistence
- YAML-based storage for easy editing
- One file per tool for organization
- Shared metadata file for categories and common data
- Volume mounting for Docker persistence

### 4. User Interface
- Modern, clean design with dark/light theme support
- Keyboard-navigable interface
- Visual key representation with platform-specific symbols
- Responsive layout for various screen sizes

### 5. CRUD Operations
- Add new shortcuts through UI
- Edit existing shortcuts
- Delete shortcuts
- Add/edit tool metadata
- Manage categories

### 6. Additional Features
- Export/import shortcut collections
- Conflict detection (highlight duplicate shortcuts)
- Hover tooltips showing config file location and extended descriptions

## Data Structure

### Tool File Format (e.g., `vim.yaml`)
```yaml
tool:
  name: Vim
  description: A highly configurable text editor
  website: https://www.vim.org/
  icon: vim # optional icon identifier

shortcuts:
  - id: vim-save
    name: Save file
    description: Write the current buffer to disk
    keys:
      default: [":w"]
    category: file-operations
    configFile: ~/.vimrc

  - id: vim-quit
    name: Quit
    description: Exit vim
    keys:
      default: [":q"]
    category: file-operations
    configFile: ~/.vimrc

  - id: vim-goto-top
    name: Go to top of file
    description: Move cursor to the first line
    keys:
      default: ["g", "g"]  # Sequential keys
    category: navigation
    configFile: ~/.vimrc

  - id: vim-visual-line
    name: Visual line mode
    description: Select entire lines
    keys:
      default: ["Shift+V"]
    category: selection
    configFile: ~/.vimrc
```

### Metadata File Format (`metadata.yaml`)
```yaml
categories:
  - id: navigation
    name: Navigation
    description: Moving around in the application
    
  - id: editing
    name: Editing
    description: Text manipulation and editing
    
  - id: file-operations
    name: File Operations
    description: Opening, saving, and managing files
    
  - id: selection
    name: Selection
    description: Selecting text or objects
    
  - id: window-management
    name: Window Management
    description: Managing windows and panes
    
  - id: search-replace
    name: Search & Replace
    description: Finding and replacing text
    
  - id: custom
    name: Custom
    description: User-defined shortcuts

platforms:
  - id: mac
    name: macOS
    modifierKeys:
      cmd: "⌘"
      ctrl: "⌃"
      opt: "⌥"
      shift: "⇧"
      
  - id: windows
    name: Windows
    modifierKeys:
      win: "⊞"
      ctrl: "Ctrl"
      alt: "Alt"
      shift: "Shift"
      
  - id: linux
    name: Linux
    modifierKeys:
      super: "Super"
      ctrl: "Ctrl"
      alt: "Alt"
      shift: "Shift"
```

## UI Components

### 1. Main Layout
- Header with search bar and theme toggle
- Sidebar with tool filters and categories
- Main content area with shortcut cards
- Floating action button for adding shortcuts

### 2. Shortcut Card
- Visual key representation
- Function name (prominent)
- Tool badge
- Category badge
- Info icon (hover for description and config file)
- Edit/delete actions (on hover/focus)

### 3. Key Visualization
- Platform-specific modifier symbols
- Sequential keys with arrows: `g` → `g`
- Chord shortcuts: `⌘K` then `⌘S`
- Combined modifiers: `⌘⇧P`

### 4. Edit Modal
- Form fields for all shortcut properties
- Key combination recorder
- Live preview of key visualization
- Platform-specific key variations

### 5. Search Interface
- Fuzzy search input
- Search type toggle (function/keys/description)
- Active filters display
- Clear filters button

## Technical Implementation

### Frontend Architecture
- Next.js 15 with App Router
- React 19 with TypeScript
- Tailwind CSS v4 for styling
- shadcn/ui for component library
- Fuse.js for fuzzy search
- React Hook Form for forms
- Zod for validation

### State Management
- React Context for global state (theme, filters)
- Local state for component-specific data
- Optimistic updates for CRUD operations

### API Routes
- `GET /api/shortcuts` - Fetch all shortcuts with filtering
- `GET /api/shortcuts/[tool]` - Fetch shortcuts for specific tool
- `POST /api/shortcuts` - Create new shortcut
- `PUT /api/shortcuts/[id]` - Update shortcut
- `DELETE /api/shortcuts/[id]` - Delete shortcut
- `GET /api/metadata` - Fetch categories and platform data
- `POST /api/export` - Export shortcuts
- `POST /api/import` - Import shortcuts

### File Structure
```
shortcuts/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── shortcuts/
│   │   │   ├── metadata/
│   │   │   └── export/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── ui/           # shadcn components
│   │   ├── shortcuts/
│   │   │   ├── ShortcutCard.tsx
│   │   │   ├── ShortcutList.tsx
│   │   │   └── KeyVisualizer.tsx
│   │   ├── search/
│   │   │   ├── SearchBar.tsx
│   │   │   └── FilterSidebar.tsx
│   │   └── modals/
│   │       ├── EditShortcutModal.tsx
│   │       └── ImportExportModal.tsx
│   ├── lib/
│   │   ├── shortcuts.ts  # Data access layer
│   │   ├── search.ts     # Search implementation
│   │   └── platform.ts   # Platform detection
│   └── types/
│       └── shortcuts.ts  # TypeScript interfaces
└── data/                 # Volume mount point
    ├── tools/           # Tool-specific YAML files
    └── metadata.yaml    # Shared metadata
```

## Docker Deployment

### Dockerfile
- Multi-stage build
- Production optimizations
- Volume mount at `/app/data`
- Environment variable support

### Docker Compose
```yaml
version: '3.8'
services:
  shortcuts:
    build: .
    ports:
      - "3000:3000"
    volumes:
      - ./shortcuts-data:/app/data
    environment:
      - NODE_ENV=production
```

## Keyboard Navigation

- `/` - Focus search
- `Esc` - Clear search/close modals
- `Tab` - Navigate through shortcuts
- `Enter` - Open edit modal for focused shortcut
- `Ctrl/Cmd + K` - Command palette
- `Ctrl/Cmd + N` - Add new shortcut
- `Ctrl/Cmd + E` - Export shortcuts
- `Ctrl/Cmd + I` - Import shortcuts

## Future Enhancements

1. User accounts and personal shortcut collections
2. Sharing shortcut collections via URL
3. Browser extension for quick lookup
4. API for third-party integrations
5. Shortcut conflict resolution suggestions
6. Shortcut usage analytics
7. Integration with editor configs (auto-import from .vimrc, etc.)
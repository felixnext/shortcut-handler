# System Architecture

## Component Hierarchy

```
App
├── Layout
│   ├── Header
│   │   ├── SearchBar
│   │   ├── ThemeToggle
│   │   └── CommandPalette
│   └── Sidebar
│       ├── ToolFilter
│       └── CategoryFilter
├── MainContent
│   ├── ShortcutGrid
│   │   └── ShortcutCard
│   │       ├── KeyVisualizer
│   │       │   ├── KeyPress (visual keys)
│   │       │   ├── CommandDisplay (terminal style)
│   │       │   └── KeySequence (with arrows)
│   │       ├── ShortcutInfo
│   │       └── ShortcutActions
│   └── EmptyState
└── Modals
    ├── EditShortcutModal
    ├── AddShortcutModal
    └── ImportExportModal
```

## Key Visualization Components

### 1. KeyPress Component
- Renders beautiful keyboard keys like in the screenshot
- Supports modifier keys with proper symbols
- Responsive sizing and proper shadows/styling

### 2. CommandDisplay Component
- Terminal-style display for vim commands
- Monospace font with terminal background
- Syntax highlighting for commands

### 3. KeySequence Component
- Shows sequential keys with arrow separators
- Each key rendered as KeyPress component
- Arrow icons between keys

## State Management

### Global State (React Context)
- Theme (dark/light)
- Active filters (tools, categories, search)
- User preferences

### Local State
- Modal open/close states
- Form data
- Optimistic updates

## Data Flow

1. **Initial Load**
   - Fetch metadata.yaml
   - Fetch all tool files
   - Initialize search index

2. **Search/Filter**
   - Client-side filtering with Fuse.js
   - Real-time search results
   - Filter combination logic

3. **CRUD Operations**
   - Optimistic UI updates
   - API calls to persist changes
   - File system writes through API routes

## API Routes Structure

```
/api/shortcuts
  GET    - Fetch all shortcuts
  POST   - Create new shortcut

/api/shortcuts/[tool]
  GET    - Fetch tool shortcuts
  PUT    - Update tool file
  DELETE - Delete tool

/api/shortcuts/[tool]/[id]
  PUT    - Update specific shortcut
  DELETE - Delete specific shortcut

/api/metadata
  GET    - Fetch categories/platforms
  PUT    - Update metadata

/api/export
  POST   - Export shortcuts

/api/import
  POST   - Import shortcuts
```

## Styling Architecture

### Design Tokens
- Colors (support dark/light)
- Spacing scale
- Typography scale
- Shadow system
- Border radius system

### Component Styling
- Tailwind CSS for utilities
- CSS modules for complex components
- shadcn/ui for base components
- Custom key visualization styles

### Key Visual Design
```css
/* Example key press styling */
.key {
  background: linear-gradient(to bottom, #f8f9fa, #e9ecef);
  border: 1px solid #dee2e6;
  border-radius: 8px;
  box-shadow: 
    0 2px 4px rgba(0,0,0,0.1),
    inset 0 1px 0 rgba(255,255,255,0.5);
  padding: 8px 16px;
  font-family: -apple-system, system-ui;
  font-weight: 500;
}

/* Dark mode */
.dark .key {
  background: linear-gradient(to bottom, #2d3748, #1a202c);
  border-color: #4a5568;
  color: #e2e8f0;
}
```

## Performance Considerations

1. **Search Performance**
   - Debounced search input
   - Memoized search results
   - Virtual scrolling for large lists

2. **Data Loading**
   - Lazy load tool data
   - Cache API responses
   - Optimistic UI updates

3. **Bundle Size**
   - Code splitting by route
   - Lazy load modals
   - Tree-shake unused components
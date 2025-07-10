# Keyboard Shortcuts Lookup Tool

A modern, web-based application for managing and quickly finding keyboard shortcuts across multiple tools and applications. Built with Next.js, TypeScript, and a clean, responsive interface.

## Features

- 🔍 **Fuzzy Search** - Quickly find shortcuts by function name, key combination, or description
- 🛠️ **Multi-Tool Support** - Organize shortcuts for vim, vscode, tmux, raycast, and more
- 🎨 **Modern UI** - Clean design with dark/light theme support
- ⌨️ **Keyboard Navigation** - Fully keyboard-accessible interface
- 📝 **CRUD Operations** - Add, edit, and delete shortcuts through the UI
- 🔄 **Import/Export** - Share and backup your shortcut collections
- 🚨 **Conflict Detection** - Highlights duplicate shortcuts within tools
- 🐳 **Docker Support** - Easy deployment with Docker

## Getting Started

### Prerequisites

- Node.js 20+ 
- pnpm 9.14.2+ (will be auto-installed via corepack)
- Docker (optional, for containerized deployment)

### Development Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/shortcut-handler.git
cd shortcut-handler
```

2. Install dependencies:
```bash
cd shortcuts
pnpm install
```

3. Create the data directory structure:
```bash
mkdir -p data/tools
```

4. Run the development server:
```bash
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Docker Deployment

1. Build and run with Docker Compose:
```bash
docker-compose up -d
```

2. Access the application at [http://localhost:3000](http://localhost:3000)

3. Shortcut data will be persisted in the `./shortcuts-data` directory

### Manual Docker Build

```bash
# Build the image
cd shortcuts
docker build -t keyboard-shortcuts .

# Run the container
docker run -p 3000:3000 -v $(pwd)/shortcuts-data:/app/data keyboard-shortcuts
```

## Usage

### Adding Shortcuts

1. Click the "+" button or press `Ctrl/Cmd + N`
2. Fill in the shortcut details:
   - Tool name
   - Function name
   - Key combination
   - Category
   - Description (optional)
   - Config file location (optional)
3. Save the shortcut

### Searching

- **By Function**: Type any part of the function name
- **By Keys**: Search for specific key combinations (e.g., "Ctrl+K")
- **By Description**: Search within shortcut descriptions

### Keyboard Navigation

- `/` - Focus search bar
- `Tab` - Navigate through shortcuts
- `Enter` - Edit focused shortcut
- `Esc` - Clear search/close modals
- `Ctrl/Cmd + K` - Open command palette
- `Ctrl/Cmd + N` - Add new shortcut
- `Ctrl/Cmd + E` - Export shortcuts
- `Ctrl/Cmd + I` - Import shortcuts

### Data Format

Shortcuts are stored in YAML format for easy editing. Each tool has its own file in the `data/tools/` directory.

Example (`data/tools/vim.yaml`):
```yaml
tool:
  name: Vim
  description: A highly configurable text editor
  website: https://www.vim.org/

shortcuts:
  - id: vim-save
    name: Save file
    description: Write the current buffer to disk
    keys:
      default: [":w"]
    category: file-operations
    configFile: ~/.vimrc
```

## Development

### Commands

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Run production build
pnpm start

# Type checking
pnpm typecheck

# Linting and formatting
pnpm check
pnpm check:write
```

### Project Structure

```
shortcuts/
├── src/
│   ├── app/          # Next.js app router pages
│   ├── components/   # React components
│   ├── lib/          # Utility functions
│   └── types/        # TypeScript types
├── data/             # Shortcut data (git-ignored)
│   ├── tools/        # Tool-specific YAML files
│   └── metadata.yaml # Categories and shared data
└── public/           # Static assets
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the Apache 2.0 License - see the LICENSE file for details.

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)
- Fuzzy search powered by [Fuse.js](https://fusejs.io/)
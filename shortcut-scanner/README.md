# Shortcut Scanner

A CLI tool to discover and extract keyboard shortcuts from various applications' configuration files.

## Features

- 🔍 **Automatic Discovery**: Scans configuration files to find keyboard shortcuts
- 🎯 **Multiple Applications**: Supports Vim/Neovim, VSCode, Cursor, and Tmux
- 🎨 **Interactive Selection**: Choose which shortcuts to export with a beautiful CLI interface
- 📊 **Confidence Scoring**: Rates shortcuts by confidence level (high/medium/low)
- 🏷️ **Smart Categorization**: Automatically categorizes shortcuts by function
- 📁 **YAML Export**: Exports in a format compatible with shortcut-handler

## Installation

```bash
cd shortcut-scanner
pnpm install
pnpm build
```

## Usage

### Interactive Mode (Recommended)

```bash
pnpm start
```

This will:
1. Let you select which scanners to run
2. Show progress as it scans each application
3. Display all found shortcuts grouped by category
4. Allow you to select which shortcuts to export
5. Save selected shortcuts as YAML files

### Command Line Options

```bash
# Run specific scanners
pnpm start --scanners vim tmux

# Exclude default/built-in shortcuts
pnpm start --no-defaults

# Specify output directory
pnpm start --output ./my-shortcuts

# List available scanners
pnpm start list
```

## Supported Applications

### Vim/Neovim
- Scans: `~/.vimrc`, `~/.vim/vimrc`, `~/.config/nvim/init.vim`
- Extracts: Custom mappings, leader key configurations
- Includes: Common built-in shortcuts (optional)

### VSCode
- Scans: User keybindings.json
- Platform-aware paths (macOS/Windows/Linux)
- Merges with default keybindings

### Cursor
- Same as VSCode but for Cursor IDE
- Scans Cursor-specific configuration paths

### Tmux
- Scans: `~/.tmux.conf`, `~/.config/tmux/tmux.conf`
- Extracts: bind-key commands, prefix key
- Handles: Different key tables and modifiers

## Output Format

The tool exports shortcuts in YAML format compatible with the shortcut-handler:

```yaml
tool:
  name: Vim
  description: A highly configurable text editor
  website: https://www.vim.org/
  icon: vim

shortcuts:
  - id: vim-save
    name: Save file
    description: Write the current buffer to disk
    keys:
      default: [":w"]
    category: file-operations
    configFile: /Users/you/.vimrc
```

## Development

```bash
# Run in development mode
pnpm dev

# Type checking
pnpm typecheck

# Build
pnpm build
```

## Adding New Scanners

1. Create scanner files in `src/scanners/[tool-name]/`
2. Extend `BaseScanner` class
3. Implement required methods
4. Register in `src/index.ts`

Example:
```typescript
export class MyToolScanner extends BaseScanner {
  readonly name = 'MyTool';
  readonly description = 'Scans MyTool configuration';
  
  getConfigPaths(): string[] {
    return ['~/.mytool/config'];
  }
  
  async scan(): Promise<ScannerResult> {
    // Implementation
  }
}
```
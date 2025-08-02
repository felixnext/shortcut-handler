import type { DiscoveredShortcut, ToolFile } from '../core/types.js';

export class ShortcutConverter {
  convertToToolFile(
    toolName: string,
    shortcuts: DiscoveredShortcut[],
    toolInfo?: {
      description?: string;
      website?: string;
      icon?: string;
    }
  ): ToolFile {
    const tool = {
      name: toolName,
      description: toolInfo?.description || this.getDefaultDescription(toolName),
      website: toolInfo?.website || this.getDefaultWebsite(toolName),
      icon: toolInfo?.icon || toolName.toLowerCase()
    };

    const convertedShortcuts = shortcuts.map(shortcut => ({
      id: this.generateId(toolName, shortcut.name),
      name: shortcut.name,
      description: shortcut.description,
      keys: {
        default: shortcut.keys
      },
      category: shortcut.category || 'general',
      configFile: shortcut.source.split(':')[0]
    }));

    return {
      tool,
      shortcuts: convertedShortcuts
    };
  }

  private generateId(toolName: string, shortcutName: string): string {
    const cleanTool = toolName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const cleanName = shortcutName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    return `${cleanTool}-${cleanName}`;
  }

  private getDefaultDescription(toolName: string): string {
    const descriptions: Record<string, string> = {
      'Vim': 'A highly configurable text editor built to enable efficient text editing',
      'Neovim': 'Hyperextensible Vim-based text editor',
      'VSCode': 'Visual Studio Code - Code editing redefined',
      'Cursor': 'The AI-first code editor',
      'Tmux': 'Terminal multiplexer that lets you switch between several programs in one terminal'
    };

    return descriptions[toolName] || `${toolName} - A powerful development tool`;
  }

  private getDefaultWebsite(toolName: string): string {
    const websites: Record<string, string> = {
      'Vim': 'https://www.vim.org/',
      'Neovim': 'https://neovim.io/',
      'VSCode': 'https://code.visualstudio.com/',
      'Cursor': 'https://cursor.sh/',
      'Tmux': 'https://github.com/tmux/tmux'
    };

    return websites[toolName] || '';
  }

  formatForYaml(toolFile: ToolFile): any {
    return {
      tool: toolFile.tool,
      shortcuts: toolFile.shortcuts.map(shortcut => ({
        id: shortcut.id,
        name: shortcut.name,
        ...(shortcut.description && { description: shortcut.description }),
        keys: shortcut.keys,
        category: shortcut.category,
        ...(shortcut.configFile && { configFile: shortcut.configFile })
      }))
    };
  }
}
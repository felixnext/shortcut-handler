import { join } from 'node:path';
import { BaseScanner } from '../../core/base-scanner.js';
import type { ScannerResult, DiscoveredShortcut } from '../../core/types.js';
import { VimParser } from './vim-parser.js';

export class VimScanner extends BaseScanner {
  readonly name = 'Vim/Neovim';
  readonly description = 'Scans Vim and Neovim configuration files for keyboard shortcuts';
  private parser = new VimParser();

  getConfigPaths(): string[] {
    const paths = [
      '~/.vimrc',
      '~/.vim/vimrc',
      '~/.config/nvim/init.vim',
      '~/.config/nvim/init.lua',
      '~/.config/nvim/lua/config/keymaps.lua',
      '~/.config/nvim/lua/keymaps.lua'
    ];

    // Add custom paths from config
    if (this.config.includePaths) {
      paths.push(...this.config.includePaths);
    }

    return paths.map(p => this.expandPath(p));
  }

  async scan(): Promise<ScannerResult> {
    const result: ScannerResult = {
      toolName: this.name,
      toolDescription: 'A highly configurable text editor built to enable efficient text editing',
      shortcuts: [],
      errors: [],
      warnings: []
    };

    const configPaths = this.getConfigPaths();
    let totalPaths = configPaths.length;
    let processedPaths = 0;

    for (const configPath of configPaths) {
      this.updateProgress(
        (processedPaths / totalPaths) * 100,
        result.shortcuts.length,
        `Scanning ${configPath}`
      );

      if (await this.fileExists(configPath)) {
        try {
          if (configPath.endsWith('.lua')) {
            result.warnings.push(`Lua config parsing not yet implemented: ${configPath}`);
          } else {
            const shortcuts = await this.scanVimConfig(configPath);
            result.shortcuts.push(...shortcuts);
            if (!result.configFile) {
              result.configFile = configPath;
            }
          }
        } catch (error) {
          result.errors.push(`Error scanning ${configPath}: ${error}`);
        }
      }

      processedPaths++;
    }

    // Also scan for plugin directories
    const pluginDirs = [
      '~/.vim/plugin',
      '~/.vim/pack',
      '~/.config/nvim/plugin',
      '~/.config/nvim/pack'
    ].map(p => this.expandPath(p));

    for (const pluginDir of pluginDirs) {
      if (await this.fileExists(pluginDir)) {
        // For now, just note that plugins exist
        result.warnings.push(`Plugin directory found but not scanned: ${pluginDir}`);
      }
    }

    // Remove duplicates and sort
    result.shortcuts = this.deduplicateShortcuts(result.shortcuts);
    result.shortcuts = this.sortShortcuts(result.shortcuts);

    this.updateProgress(100, result.shortcuts.length, 'Scan complete');

    return result;
  }

  private async scanVimConfig(configPath: string): Promise<DiscoveredShortcut[]> {
    const content = await this.readFile(configPath);
    if (!content) return [];

    const { mappings, leader } = this.parser.parseVimrc(content, configPath);
    const shortcuts = this.parser.convertToShortcuts(mappings, configPath);

    // Add some common built-in shortcuts with high confidence
    if (this.config.includeDefaults !== false) {
      shortcuts.push(...this.getBuiltinShortcuts(configPath));
    }

    return shortcuts;
  }

  private getBuiltinShortcuts(configFile: string): DiscoveredShortcut[] {
    const builtins: Array<{
      name: string;
      keys: string[];
      description: string;
      category: string;
    }> = [
      { name: 'Save file', keys: [':w'], description: 'Write the current buffer to disk', category: 'file-operations' },
      { name: 'Save and quit', keys: [':wq'], description: 'Write buffer and exit vim', category: 'file-operations' },
      { name: 'Quit', keys: [':q'], description: 'Exit vim (fails if unsaved changes)', category: 'file-operations' },
      { name: 'Force quit', keys: [':q!'], description: 'Exit vim without saving', category: 'file-operations' },
      { name: 'Go to top', keys: ['g', 'g'], description: 'Move cursor to first line', category: 'navigation' },
      { name: 'Go to bottom', keys: ['G'], description: 'Move cursor to last line', category: 'navigation' },
      { name: 'Next word', keys: ['w'], description: 'Move to beginning of next word', category: 'navigation' },
      { name: 'Previous word', keys: ['b'], description: 'Move to beginning of previous word', category: 'navigation' },
      { name: 'Undo', keys: ['u'], description: 'Undo last change', category: 'editing' },
      { name: 'Redo', keys: ['Ctrl+r'], description: 'Redo last undone change', category: 'editing' },
      { name: 'Delete line', keys: ['d', 'd'], description: 'Delete current line', category: 'editing' },
      { name: 'Copy line', keys: ['y', 'y'], description: 'Copy current line', category: 'editing' },
      { name: 'Paste after', keys: ['p'], description: 'Paste after cursor', category: 'editing' },
      { name: 'Search forward', keys: ['/'], description: 'Search forward for pattern', category: 'search-replace' },
      { name: 'Next match', keys: ['n'], description: 'Go to next search match', category: 'search-replace' }
    ];

    return builtins.map(shortcut => ({
      ...shortcut,
      confidence: 'high' as const,
      source: `builtin (${configFile})`,
      originalCommand: undefined
    }));
  }

  private deduplicateShortcuts(shortcuts: DiscoveredShortcut[]): DiscoveredShortcut[] {
    const seen = new Map<string, DiscoveredShortcut>();

    for (const shortcut of shortcuts) {
      const key = `${shortcut.keys.join('+')}:${shortcut.name}`;
      const existing = seen.get(key);

      if (!existing || this.compareConfidence(shortcut.confidence, existing.confidence) > 0) {
        seen.set(key, shortcut);
      }
    }

    return Array.from(seen.values());
  }

  private compareConfidence(a: string, b: string): number {
    const order = { high: 3, medium: 2, low: 1 };
    return (order[a as keyof typeof order] || 0) - (order[b as keyof typeof order] || 0);
  }
}
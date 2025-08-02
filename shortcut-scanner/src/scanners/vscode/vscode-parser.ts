import type { DiscoveredShortcut } from '../../core/types.js';

export interface VSCodeKeybinding {
  key: string;
  command: string;
  when?: string;
  args?: any;
}

export interface VSCodeDefaultKeybinding extends VSCodeKeybinding {
  isDefault?: boolean;
}

export class VSCodeParser {
  parseKeybindings(content: string, isDefault: boolean = false): VSCodeKeybinding[] {
    try {
      // Remove comments (VSCode allows comments in JSON)
      const cleanContent = content
        .replace(/\/\*[\s\S]*?\*\//g, '') // Remove block comments
        .replace(/\/\/.*$/gm, ''); // Remove line comments

      const keybindings = JSON.parse(cleanContent);
      
      if (!Array.isArray(keybindings)) {
        return [];
      }

      return keybindings.filter(kb => kb.key && kb.command);
    } catch (error) {
      console.error('Error parsing VSCode keybindings:', error);
      return [];
    }
  }

  convertToShortcuts(
    keybindings: VSCodeKeybinding[],
    configFile: string,
    commandDescriptions: Map<string, string> = new Map()
  ): DiscoveredShortcut[] {
    return keybindings.map((kb, index) => {
      const keys = this.parseKeySequence(kb.key);
      const name = this.generateName(kb.command);
      const description = commandDescriptions.get(kb.command) || this.generateDescription(kb);
      const category = this.categorizeCommand(kb.command);
      const confidence = this.assessConfidence(kb);

      return {
        name,
        description,
        keys,
        category,
        confidence,
        source: `${configFile}:${index + 1}`,
        originalCommand: kb.command
      };
    });
  }

  private parseKeySequence(keyString: string): string[] {
    // VSCode uses space to separate key chords
    const chords = keyString.split(' ');
    
    return chords.map(chord => {
      // Split by + for modifier keys
      const parts = chord.split('+').map(part => part.trim());
      
      return parts.map(part => this.normalizeKey(part)).join('+');
    });
  }

  private normalizeKey(key: string): string {
    const keyMap: Record<string, string> = {
      'cmd': 'Cmd',
      'ctrl': 'Ctrl',
      'shift': 'Shift',
      'alt': 'Alt',
      'opt': 'Alt',
      'meta': 'Cmd',
      'enter': 'Enter',
      'return': 'Enter',
      'escape': 'Escape',
      'esc': 'Escape',
      'delete': 'Delete',
      'backspace': 'Backspace',
      'tab': 'Tab',
      'space': 'Space',
      'up': 'ArrowUp',
      'down': 'ArrowDown',
      'left': 'ArrowLeft',
      'right': 'ArrowRight',
      'pageup': 'PageUp',
      'pagedown': 'PageDown',
      'home': 'Home',
      'end': 'End'
    };

    const lower = key.toLowerCase();
    return keyMap[lower] || key;
  }

  private generateName(command: string): string {
    // Remove prefixes like "editor.", "workbench.", etc.
    const simplifiedCommand = command.replace(/^[a-z]+\./, '');
    
    // Convert camelCase to Title Case
    return simplifiedCommand
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  }

  private generateDescription(kb: VSCodeKeybinding): string {
    let desc = `Execute command: ${kb.command}`;
    
    if (kb.when) {
      desc += ` (when ${kb.when})`;
    }
    
    return desc;
  }

  private categorizeCommand(command: string): string {
    const lower = command.toLowerCase();

    // File operations
    if (/save|close|open|new/.test(lower)) {
      return 'file-operations';
    }

    // Navigation
    if (/go|jump|navigate|cursor|scroll/.test(lower)) {
      return 'navigation';
    }

    // Search
    if (/find|search|replace/.test(lower)) {
      return 'search-replace';
    }

    // Editing
    if (/cut|copy|paste|delete|insert|format|indent|comment/.test(lower)) {
      return 'editing';
    }

    // Selection
    if (/select|expand|shrink/.test(lower)) {
      return 'selection';
    }

    // View/Window management
    if (/view|panel|sidebar|split|tab|window|editor/.test(lower)) {
      return 'window-management';
    }

    // Terminal
    if (/terminal|console/.test(lower)) {
      return 'execution';
    }

    // Debug
    if (/debug|breakpoint/.test(lower)) {
      return 'debugging';
    }

    // Git
    if (/git|scm/.test(lower)) {
      return 'git';
    }

    return 'custom';
  }

  private assessConfidence(kb: VSCodeKeybinding): 'high' | 'medium' | 'low' {
    // High confidence for standard VSCode commands
    if (kb.command.startsWith('workbench.') || 
        kb.command.startsWith('editor.') ||
        kb.command.startsWith('type')) {
      return 'high';
    }

    // Low confidence for extension commands
    if (kb.command.includes('.extension.') || kb.command.includes('extension.')) {
      return 'low';
    }

    // Medium confidence for everything else
    return 'medium';
  }

  mergeKeybindings(
    defaults: VSCodeKeybinding[],
    userKeybindings: VSCodeKeybinding[]
  ): VSCodeKeybinding[] {
    const merged = new Map<string, VSCodeKeybinding>();

    // Add defaults
    for (const kb of defaults) {
      const key = `${kb.command}:${kb.when || ''}`;
      merged.set(key, kb);
    }

    // Override with user keybindings
    for (const kb of userKeybindings) {
      if (kb.command.startsWith('-')) {
        // Remove binding
        const command = kb.command.slice(1);
        const key = `${command}:${kb.when || ''}`;
        merged.delete(key);
      } else {
        const key = `${kb.command}:${kb.when || ''}`;
        merged.set(key, kb);
      }
    }

    return Array.from(merged.values());
  }
}
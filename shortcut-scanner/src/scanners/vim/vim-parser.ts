import type { DiscoveredShortcut } from '../../core/types.js';

export interface ParsedMapping {
  mode: string;
  lhs: string;
  rhs: string;
  silent?: boolean;
  noremap?: boolean;
  buffer?: boolean;
  expr?: boolean;
  line: number;
}

export class VimParser {
  private leader = '\\';
  private localLeader = '\\';

  parseVimrc(content: string, filePath: string): { mappings: ParsedMapping[]; leader: string } {
    const lines = content.split('\n');
    const mappings: ParsedMapping[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Skip comments and empty lines
      if (!line || line.startsWith('"')) continue;

      // Check for leader key settings
      if (line.match(/^let\s+mapleader\s*=/)) {
        const match = line.match(/["'](.+)["']/);
        if (match) {
          this.leader = match[1];
        }
      } else if (line.match(/^let\s+maplocalleader\s*=/)) {
        const match = line.match(/["'](.+)["']/);
        if (match) {
          this.localLeader = match[1];
        }
      }

      // Parse mapping commands
      const mapping = this.parseMappingLine(line, i + 1);
      if (mapping) {
        mappings.push(mapping);
      }
    }

    return { mappings, leader: this.leader };
  }

  private parseMappingLine(line: string, lineNumber: number): ParsedMapping | null {
    // Match various mapping commands
    const mapRegex = /^(([nvxsoilct])?n?o?re?map!?)\s+(<[^>]+>)*\s*(\S+)\s+(.+)$/;
    const match = line.match(mapRegex);

    if (!match) return null;

    const [, command, modePrefix, modifiers, lhs, rhs] = match;
    
    // Determine mode from command
    let mode = 'n'; // default to normal mode
    if (command.includes('!')) {
      mode = 'i'; // insert and command-line mode
    } else if (modePrefix) {
      mode = modePrefix;
    } else if (command === 'map' || command === 'noremap') {
      mode = 'nvo'; // normal, visual, operator-pending
    }

    // Parse modifiers
    const silent = modifiers?.includes('<silent>') || false;
    const buffer = modifiers?.includes('<buffer>') || false;
    const expr = modifiers?.includes('<expr>') || false;
    const noremap = command.includes('noremap');

    return {
      mode,
      lhs: this.expandLeader(lhs),
      rhs: rhs.trim(),
      silent,
      noremap,
      buffer,
      expr,
      line: lineNumber
    };
  }

  private expandLeader(keys: string): string {
    return keys
      .replace(/<leader>/gi, this.leader)
      .replace(/<localleader>/gi, this.localLeader);
  }

  convertToShortcuts(mappings: ParsedMapping[], configFile: string): DiscoveredShortcut[] {
    return mappings.map(mapping => {
      const keys = this.parseKeySequence(mapping.lhs);
      const name = this.generateName(mapping);
      const description = this.generateDescription(mapping);
      const category = this.categorizeMapping(mapping);
      const confidence = this.assessConfidence(mapping);

      return {
        name,
        description,
        keys,
        category,
        confidence,
        source: `${configFile}:${mapping.line}`,
        originalCommand: `${mapping.mode}map ${mapping.lhs} ${mapping.rhs}`
      };
    });
  }

  private parseKeySequence(keys: string): string[] {
    const keyPattern = /<[^>]+>|./g;
    const matches = keys.match(keyPattern) || [];
    
    return matches.map(key => {
      // Handle special keys
      if (key.startsWith('<') && key.endsWith('>')) {
        return this.normalizeSpecialKey(key);
      }
      return key;
    });
  }

  private normalizeSpecialKey(key: string): string {
    const inner = key.slice(1, -1).toLowerCase();
    
    const keyMap: Record<string, string> = {
      'cr': 'Enter',
      'return': 'Enter',
      'esc': 'Escape',
      'space': 'Space',
      'tab': 'Tab',
      'bs': 'Backspace',
      'del': 'Delete',
      'up': 'ArrowUp',
      'down': 'ArrowDown',
      'left': 'ArrowLeft',
      'right': 'ArrowRight',
      'home': 'Home',
      'end': 'End',
      'pageup': 'PageUp',
      'pagedown': 'PageDown',
      'c-': 'Ctrl+',
      's-': 'Shift+',
      'a-': 'Alt+',
      'm-': 'Alt+',
      'd-': 'Cmd+'
    };

    // Handle modifier keys
    for (const [prefix, replacement] of Object.entries(keyMap)) {
      if (inner.startsWith(prefix)) {
        const suffix = inner.slice(prefix.length);
        if (prefix.endsWith('-')) {
          return replacement + (suffix.length === 1 ? suffix.toUpperCase() : this.normalizeSpecialKey(`<${suffix}>`));
        }
      }
    }

    return keyMap[inner] || key;
  }

  private generateName(mapping: ParsedMapping): string {
    // Try to extract a meaningful name from the rhs
    const rhs = mapping.rhs;

    // Common patterns
    if (rhs.startsWith(':')) {
      const command = rhs.slice(1).split('<')[0].trim();
      return this.commandToName(command);
    }

    if (rhs.includes('Plug')) {
      const match = rhs.match(/Plug[(\s]+['"]?([^'")]+)/);
      if (match) {
        return this.pluginNameToName(match[1]);
      }
    }

    // Fallback to key combination
    return `Custom mapping (${mapping.lhs})`;
  }

  private commandToName(command: string): string {
    const commonCommands: Record<string, string> = {
      'w': 'Save file',
      'wq': 'Save and quit',
      'q': 'Quit',
      'q!': 'Force quit',
      'e': 'Edit file',
      'split': 'Split window horizontally',
      'vsplit': 'Split window vertically',
      'close': 'Close window',
      'bnext': 'Next buffer',
      'bprevious': 'Previous buffer',
      'tabnew': 'New tab',
      'tabclose': 'Close tab'
    };

    return commonCommands[command] || `Execute :${command}`;
  }

  private pluginNameToName(pluginName: string): string {
    return pluginName
      .replace(/([A-Z])/g, ' $1')
      .replace(/[-_]/g, ' ')
      .trim()
      .replace(/\s+/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  private generateDescription(mapping: ParsedMapping): string {
    const modeNames: Record<string, string> = {
      'n': 'Normal mode',
      'v': 'Visual mode',
      'i': 'Insert mode',
      'x': 'Visual mode',
      's': 'Select mode',
      'o': 'Operator-pending mode',
      'c': 'Command-line mode',
      't': 'Terminal mode'
    };

    const mode = modeNames[mapping.mode] || 'Multiple modes';
    return `${mode}: ${mapping.rhs}`;
  }

  private categorizeMapping(mapping: ParsedMapping): string {
    const rhs = mapping.rhs.toLowerCase();
    const lhs = mapping.lhs.toLowerCase();

    if (/save|write|:w/.test(rhs)) return 'file-operations';
    if (/move|goto|jump|gg|G|0|\$|w|b|e/.test(lhs)) return 'navigation';
    if (/search|find|\/|\?|n|N/.test(lhs)) return 'search-replace';
    if (/yank|delete|paste|change|y|d|p|c/.test(lhs)) return 'editing';
    if (/visual|select|v|V/.test(lhs)) return 'selection';
    if (/window|split|tab/.test(rhs)) return 'window-management';
    if (/format|indent|=/.test(lhs)) return 'formatting';

    return 'general';
  }

  private assessConfidence(mapping: ParsedMapping): 'high' | 'medium' | 'low' {
    // High confidence for standard vim commands
    if (mapping.rhs.startsWith(':') && !mapping.rhs.includes('call')) {
      return 'high';
    }

    // Medium confidence for plugin mappings
    if (mapping.rhs.includes('Plug') || mapping.rhs.includes('<Plug>')) {
      return 'medium';
    }

    // Low confidence for complex expressions or functions
    if (mapping.expr || mapping.rhs.includes('function') || mapping.rhs.includes('=')) {
      return 'low';
    }

    return 'medium';
  }
}
import type { DiscoveredShortcut } from '../../core/types.js';

export interface TmuxBinding {
  key: string;
  command: string;
  table?: string;
  repeat?: boolean;
  prefix?: boolean;
  line: number;
}

export class TmuxParser {
  private prefixKey = 'C-b'; // Default tmux prefix

  parseTmuxConf(content: string, filePath: string): { bindings: TmuxBinding[]; prefix: string } {
    const lines = content.split('\n');
    const bindings: TmuxBinding[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Skip comments and empty lines
      if (!line || line.startsWith('#')) continue;

      // Check for prefix key change
      const prefixMatch = line.match(/^set(?:-option)?\s+-g\s+prefix\s+(.+)$/);
      if (prefixMatch) {
        this.prefixKey = this.normalizeKey(prefixMatch[1]);
        continue;
      }

      // Parse bind-key commands
      const binding = this.parseBindLine(line, i + 1);
      if (binding) {
        bindings.push(binding);
      }
    }

    return { bindings, prefix: this.prefixKey };
  }

  private parseBindLine(line: string, lineNumber: number): TmuxBinding | null {
    // Match bind-key commands with various options
    const bindRegex = /^bind(?:-key)?\s+(-[rnTx]+\s+)?(?:-T\s+(\S+)\s+)?(\S+)\s+(.+)$/;
    const match = line.match(bindRegex);

    if (!match) return null;

    const [, options, table, key, command] = match;
    
    // Parse options
    const repeat = options?.includes('-r') || false;
    const noPrefix = options?.includes('-n') || false;
    const isRootTable = table === 'root' || noPrefix;

    return {
      key: this.normalizeKey(key),
      command: command.trim(),
      table: table || (isRootTable ? 'root' : 'prefix'),
      repeat,
      prefix: !isRootTable,
      line: lineNumber
    };
  }

  private normalizeKey(key: string): string {
    // Remove quotes if present
    key = key.replace(/^["']|["']$/g, '');
    
    // Normalize common key representations
    return key
      .replace(/^C-/i, 'Ctrl+')
      .replace(/^M-/i, 'Alt+')
      .replace(/^S-/i, 'Shift+')
      .replace(/Space/i, 'Space')
      .replace(/Enter/i, 'Enter')
      .replace(/Escape/i, 'Escape')
      .replace(/Tab/i, 'Tab')
      .replace(/BSpace/i, 'Backspace')
      .replace(/DC/i, 'Delete')
      .replace(/IC/i, 'Insert')
      .replace(/Up/i, 'ArrowUp')
      .replace(/Down/i, 'ArrowDown')
      .replace(/Left/i, 'ArrowLeft')
      .replace(/Right/i, 'ArrowRight')
      .replace(/PgUp/i, 'PageUp')
      .replace(/PgDn/i, 'PageDown')
      .replace(/Home/i, 'Home')
      .replace(/End/i, 'End');
  }

  convertToShortcuts(bindings: TmuxBinding[], prefix: string, configFile: string): DiscoveredShortcut[] {
    return bindings.map(binding => {
      const keys = this.generateKeySequence(binding, prefix);
      const name = this.generateName(binding.command);
      const description = this.generateDescription(binding);
      const category = this.categorizeCommand(binding.command);
      const confidence = this.assessConfidence(binding);

      return {
        name,
        description,
        keys,
        category,
        confidence,
        source: `${configFile}:${binding.line}`,
        originalCommand: `bind-key ${binding.key} ${binding.command}`
      };
    });
  }

  private generateKeySequence(binding: TmuxBinding, prefix: string): string[] {
    if (binding.table === 'root' || !binding.prefix) {
      // Direct binding without prefix
      return [binding.key];
    } else {
      // Requires prefix key first
      return [prefix, binding.key];
    }
  }

  private generateName(command: string): string {
    // Handle common tmux commands
    const commandMap: Record<string, string> = {
      'new-window': 'New window',
      'kill-window': 'Kill window',
      'next-window': 'Next window',
      'previous-window': 'Previous window',
      'last-window': 'Last window',
      'select-window': 'Select window',
      'rename-window': 'Rename window',
      'split-window': 'Split window',
      'kill-pane': 'Kill pane',
      'select-pane': 'Select pane',
      'resize-pane': 'Resize pane',
      'swap-pane': 'Swap pane',
      'break-pane': 'Break pane',
      'copy-mode': 'Enter copy mode',
      'paste-buffer': 'Paste buffer',
      'list-sessions': 'List sessions',
      'new-session': 'New session',
      'attach-session': 'Attach session',
      'detach-client': 'Detach client',
      'switch-client': 'Switch client',
      'source-file': 'Reload config',
      'display-message': 'Display message',
      'show-messages': 'Show messages',
      'command-prompt': 'Command prompt'
    };

    // Extract base command
    const baseCommand = command.split(/\s+/)[0];
    
    if (commandMap[baseCommand]) {
      // Add details for specific variations
      if (command.includes('-h')) {
        return commandMap[baseCommand] + ' horizontally';
      }
      if (command.includes('-v')) {
        return commandMap[baseCommand] + ' vertically';
      }
      if (command.includes('-L')) {
        return commandMap[baseCommand] + ' left';
      }
      if (command.includes('-R')) {
        return commandMap[baseCommand] + ' right';
      }
      if (command.includes('-U')) {
        return commandMap[baseCommand] + ' up';
      }
      if (command.includes('-D')) {
        return commandMap[baseCommand] + ' down';
      }
      
      return commandMap[baseCommand];
    }

    // Handle run-shell commands
    if (baseCommand === 'run-shell' || baseCommand === 'run') {
      const shellCmd = command.match(/["']([^"']+)["']/)?.[1] || command.slice(10);
      return `Run: ${shellCmd}`;
    }

    // Handle send-keys
    if (baseCommand === 'send-keys' || baseCommand === 'send') {
      const keys = command.match(/["']([^"']+)["']/)?.[1] || command.slice(10);
      return `Send keys: ${keys}`;
    }

    return baseCommand.replace(/-/g, ' ');
  }

  private generateDescription(binding: TmuxBinding): string {
    let desc = `Execute: ${binding.command}`;
    
    if (binding.repeat) {
      desc += ' (repeatable)';
    }
    
    if (binding.table && binding.table !== 'prefix') {
      desc += ` in ${binding.table} table`;
    }
    
    return desc;
  }

  private categorizeCommand(command: string): string {
    const lower = command.toLowerCase();

    if (/window|pane|split/.test(lower)) {
      return 'window-management';
    }
    if (/session|client|attach|detach/.test(lower)) {
      return 'custom';
    }
    if (/copy|paste|buffer/.test(lower)) {
      return 'editing';
    }
    if (/resize/.test(lower)) {
      return 'window-management';
    }
    if (/run|command/.test(lower)) {
      return 'execution';
    }

    return 'custom';
  }

  private assessConfidence(binding: TmuxBinding): 'high' | 'medium' | 'low' {
    // High confidence for standard tmux commands
    const standardCommands = [
      'new-window', 'kill-window', 'next-window', 'previous-window',
      'split-window', 'kill-pane', 'select-pane', 'resize-pane',
      'copy-mode', 'paste-buffer', 'detach-client'
    ];

    const baseCommand = binding.command.split(/\s+/)[0];
    
    if (standardCommands.includes(baseCommand)) {
      return 'high';
    }

    // Low confidence for complex shell commands
    if (baseCommand === 'run-shell' || baseCommand === 'if-shell') {
      return 'low';
    }

    return 'medium';
  }

  getBuiltinBindings(): TmuxBinding[] {
    // Common default tmux bindings
    return [
      { key: 'c', command: 'new-window', prefix: true, line: 0 },
      { key: '&', command: 'kill-window', prefix: true, line: 0 },
      { key: 'n', command: 'next-window', prefix: true, line: 0 },
      { key: 'p', command: 'previous-window', prefix: true, line: 0 },
      { key: '0', command: 'select-window -t :0', prefix: true, line: 0 },
      { key: '1', command: 'select-window -t :1', prefix: true, line: 0 },
      { key: '2', command: 'select-window -t :2', prefix: true, line: 0 },
      { key: '"', command: 'split-window', prefix: true, line: 0 },
      { key: '%', command: 'split-window -h', prefix: true, line: 0 },
      { key: 'x', command: 'kill-pane', prefix: true, line: 0 },
      { key: 'o', command: 'select-pane -t :.+', prefix: true, line: 0 },
      { key: '{', command: 'swap-pane -U', prefix: true, line: 0 },
      { key: '}', command: 'swap-pane -D', prefix: true, line: 0 },
      { key: '[', command: 'copy-mode', prefix: true, line: 0 },
      { key: ']', command: 'paste-buffer', prefix: true, line: 0 },
      { key: 'd', command: 'detach-client', prefix: true, line: 0 },
      { key: ':', command: 'command-prompt', prefix: true, line: 0 },
      { key: '?', command: 'list-keys', prefix: true, line: 0 }
    ];
  }
}
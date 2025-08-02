import { BaseScanner } from '../../core/base-scanner.js';
import type { ScannerResult, DiscoveredShortcut } from '../../core/types.js';
import { TmuxParser } from './tmux-parser.js';

export class TmuxScanner extends BaseScanner {
  readonly name = 'Tmux';
  readonly description = 'Scans tmux configuration files for keyboard shortcuts';
  private parser = new TmuxParser();

  getConfigPaths(): string[] {
    const paths = [
      '~/.tmux.conf',
      '~/.config/tmux/tmux.conf',
      '/etc/tmux.conf'
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
      toolDescription: 'Terminal multiplexer that lets you switch between several programs in one terminal',
      shortcuts: [],
      errors: [],
      warnings: []
    };

    const configPaths = this.getConfigPaths();
    let userBindings: any[] = [];
    let prefix = 'C-b';
    let foundConfig = false;

    // Scan configuration files
    for (const configPath of configPaths) {
      this.updateProgress(30, result.shortcuts.length, `Scanning ${configPath}`);

      if (await this.fileExists(configPath)) {
        try {
          const content = await this.readFile(configPath);
          if (content) {
            const parsed = this.parser.parseTmuxConf(content, configPath);
            userBindings = parsed.bindings;
            prefix = parsed.prefix;
            result.configFile = configPath;
            foundConfig = true;
            break; // Use first found config
          }
        } catch (error) {
          result.errors.push(`Error scanning ${configPath}: ${error}`);
        }
      }
    }

    // Get built-in bindings if enabled
    this.updateProgress(50, result.shortcuts.length, 'Processing default bindings');
    let allBindings = userBindings;
    
    if (this.config.includeDefaults !== false) {
      const builtinBindings = this.parser.getBuiltinBindings();
      
      // Create a map to track overridden bindings
      const userBindingKeys = new Set(userBindings.map(b => `${b.table || 'prefix'}:${b.key}`));
      
      // Add built-in bindings that haven't been overridden
      for (const builtin of builtinBindings) {
        const key = `${builtin.table || 'prefix'}:${builtin.key}`;
        if (!userBindingKeys.has(key)) {
          allBindings.push(builtin);
        }
      }
    }

    // Convert to shortcuts
    this.updateProgress(80, result.shortcuts.length, 'Converting shortcuts');
    const shortcuts = this.parser.convertToShortcuts(
      allBindings,
      prefix,
      result.configFile || 'defaults'
    );

    // Check for included files
    await this.checkForIncludes(result, configPaths);

    result.shortcuts = this.sortShortcuts(shortcuts);
    this.updateProgress(100, result.shortcuts.length, 'Scan complete');

    if (!foundConfig && result.shortcuts.length === 0) {
      result.warnings.push('No tmux configuration found. Using default bindings.');
    }

    return result;
  }

  private async checkForIncludes(result: ScannerResult, scannedPaths: string[]): Promise<void> {
    // Check for common tmux plugin managers
    const pluginPaths = [
      '~/.tmux/plugins',
      '~/.config/tmux/plugins'
    ].map(p => this.expandPath(p));

    for (const pluginPath of pluginPaths) {
      if (await this.fileExists(pluginPath)) {
        result.warnings.push(`Plugin directory found but not scanned: ${pluginPath}`);
      }
    }
  }
}
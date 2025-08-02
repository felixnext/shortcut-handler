import { join } from 'node:path';
import { platform } from 'node:os';
import { BaseScanner } from '../../core/base-scanner.js';
import type { ScannerResult } from '../../core/types.js';
import { VSCodeParser } from './vscode-parser.js';

export class VSCodeScanner extends BaseScanner {
  readonly name = 'VSCode';
  readonly description = 'Scans Visual Studio Code keybindings configuration';
  private parser = new VSCodeParser();

  getConfigPaths(): string[] {
    const paths: string[] = [];
    const system = platform();

    // User keybindings
    if (system === 'darwin') {
      paths.push('~/Library/Application Support/Code/User/keybindings.json');
    } else if (system === 'win32') {
      paths.push('%APPDATA%/Code/User/keybindings.json');
    } else {
      paths.push('~/.config/Code/User/keybindings.json');
    }

    // Add custom paths from config
    if (this.config.includePaths) {
      paths.push(...this.config.includePaths);
    }

    return paths.map(p => this.expandPath(p));
  }

  async scan(): Promise<ScannerResult> {
    const result: ScannerResult = {
      toolName: this.name,
      toolDescription: 'Visual Studio Code - Code editing redefined',
      shortcuts: [],
      errors: [],
      warnings: []
    };

    const configPaths = this.getConfigPaths();
    let userKeybindings: any[] = [];

    // Scan user keybindings
    for (const configPath of configPaths) {
      this.updateProgress(30, result.shortcuts.length, `Scanning ${configPath}`);

      if (await this.fileExists(configPath)) {
        try {
          const content = await this.readFile(configPath);
          if (content) {
            const keybindings = this.parser.parseKeybindings(content, false);
            userKeybindings = keybindings;
            result.configFile = configPath;
          }
        } catch (error) {
          result.errors.push(`Error scanning ${configPath}: ${error}`);
        }
      }
    }

    // Try to load default keybindings
    this.updateProgress(60, result.shortcuts.length, 'Loading default keybindings');
    const defaultKeybindings = await this.loadDefaultKeybindings();

    // Merge user and default keybindings
    const mergedKeybindings = this.parser.mergeKeybindings(
      defaultKeybindings,
      userKeybindings
    );

    // Convert to shortcuts
    this.updateProgress(80, result.shortcuts.length, 'Converting shortcuts');
    const shortcuts = this.parser.convertToShortcuts(
      mergedKeybindings,
      result.configFile || 'defaults'
    );

    result.shortcuts = this.sortShortcuts(shortcuts);
    this.updateProgress(100, result.shortcuts.length, 'Scan complete');

    return result;
  }

  private async loadDefaultKeybindings(): Promise<any[]> {
    // In a real implementation, we would load these from VSCode's installation
    // For now, return some common defaults
    return [
      { key: 'cmd+s', command: 'workbench.action.files.save' },
      { key: 'cmd+shift+s', command: 'workbench.action.files.saveAs' },
      { key: 'cmd+w', command: 'workbench.action.closeActiveEditor' },
      { key: 'cmd+p', command: 'workbench.action.quickOpen' },
      { key: 'cmd+shift+p', command: 'workbench.action.showCommands' },
      { key: 'cmd+/', command: 'editor.action.commentLine' },
      { key: 'cmd+f', command: 'actions.find' },
      { key: 'cmd+shift+f', command: 'workbench.action.findInFiles' },
      { key: 'f12', command: 'editor.action.goToDeclaration' },
      { key: 'shift+f12', command: 'editor.action.goToReferences' },
      { key: 'cmd+d', command: 'editor.action.addSelectionToNextFindMatch' },
      { key: 'cmd+shift+l', command: 'editor.action.selectHighlights' },
      { key: 'alt+up', command: 'editor.action.moveLinesUpAction' },
      { key: 'alt+down', command: 'editor.action.moveLinesDownAction' },
      { key: 'cmd+enter', command: 'editor.action.insertLineAfter' },
      { key: 'cmd+shift+enter', command: 'editor.action.insertLineBefore' },
      { key: 'cmd+\\', command: 'workbench.action.splitEditor' },
      { key: 'cmd+1', command: 'workbench.action.focusFirstEditorGroup' },
      { key: 'cmd+2', command: 'workbench.action.focusSecondEditorGroup' },
      { key: 'cmd+b', command: 'workbench.action.toggleSidebarVisibility' },
      { key: 'cmd+j', command: 'workbench.action.togglePanel' },
      { key: 'ctrl+`', command: 'workbench.action.terminal.toggleTerminal' },
      { key: 'cmd+shift+[', command: 'workbench.action.previousEditor' },
      { key: 'cmd+shift+]', command: 'workbench.action.nextEditor' },
      { key: 'f5', command: 'workbench.action.debug.start' },
      { key: 'shift+f5', command: 'workbench.action.debug.stop' },
      { key: 'f9', command: 'editor.debug.action.toggleBreakpoint' },
      { key: 'cmd+k cmd+0', command: 'editor.foldAll' },
      { key: 'cmd+k cmd+j', command: 'editor.unfoldAll' },
      { key: 'cmd+k cmd+s', command: 'workbench.action.keybindingsReference' }
    ];
  }
}
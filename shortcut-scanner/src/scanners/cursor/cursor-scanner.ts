import { platform } from 'node:os';
import { BaseScanner } from '../../core/base-scanner.js';
import type { ScannerResult } from '../../core/types.js';
import { VSCodeParser } from '../vscode/vscode-parser.js';

export class CursorScanner extends BaseScanner {
  readonly name = 'Cursor';
  readonly description = 'Scans Cursor IDE keybindings configuration';
  private parser = new VSCodeParser();

  getConfigPaths(): string[] {
    const paths: string[] = [];
    const system = platform();

    // Cursor uses similar paths to VSCode but with "Cursor" instead of "Code"
    if (system === 'darwin') {
      paths.push('~/Library/Application Support/Cursor/User/keybindings.json');
    } else if (system === 'win32') {
      paths.push('%APPDATA%/Cursor/User/keybindings.json');
    } else {
      paths.push('~/.config/Cursor/User/keybindings.json');
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
      toolDescription: 'The AI-first code editor',
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
    // Cursor uses similar default keybindings to VSCode
    return [
      { key: 'cmd+s', command: 'workbench.action.files.save' },
      { key: 'cmd+shift+s', command: 'workbench.action.files.saveAs' },
      { key: 'cmd+w', command: 'workbench.action.closeActiveEditor' },
      { key: 'cmd+p', command: 'workbench.action.quickOpen' },
      { key: 'cmd+shift+p', command: 'workbench.action.showCommands' },
      { key: 'cmd+k', command: 'cursor.action.generateInTerminal' },
      { key: 'cmd+l', command: 'cursor.action.focusChat' },
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
      { key: 'ctrl+`', command: 'workbench.action.terminal.toggleTerminal' }
    ];
  }
}
import { checkbox, confirm } from '@inquirer/prompts';
import chalk from 'chalk';
import type { BaseScanner } from '../core/base-scanner.js';
import type { ScannerResult, DiscoveredShortcut } from '../core/types.js';
import { ProgressTracker } from './ui-components.js';
import { formatScanSummary, formatCategory, formatShortcutKey, formatConfidenceLegend } from './formatters.js';

export class InteractiveCLI {
  private progressTracker = new ProgressTracker();

  async selectScanners(availableScanners: Array<{ name: string; scanner: BaseScanner }>): Promise<BaseScanner[]> {
    console.log(chalk.bold.blue('\n🔍 Shortcut Discovery Tool\n'));

    const choices = availableScanners.map(({ name, scanner }) => ({
      name: `${name.padEnd(15)} ${chalk.gray(scanner.description)}`,
      value: scanner,
      checked: true
    }));

    const selected = await checkbox({
      message: 'Select scanners to run:',
      choices,
      instructions: chalk.gray('\nPress space to toggle, enter to continue')
    });

    if (selected.length === 0) {
      console.log(chalk.yellow('\nNo scanners selected. Exiting.'));
      process.exit(0);
    }

    return selected;
  }

  async runScanners(scanners: BaseScanner[]): Promise<ScannerResult[]> {
    console.log(chalk.bold('\nScanning for shortcuts...\n'));

    const results: ScannerResult[] = [];

    for (const scanner of scanners) {
      this.progressTracker.start(scanner.name);
      
      scanner.setProgressCallback((progress) => {
        this.progressTracker.update(progress);
      });

      try {
        const result = await scanner.scan();
        results.push(result);
        
        this.progressTracker.update({
          scanner: scanner.name,
          status: 'completed',
          progress: 100,
          found: result.shortcuts.length
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        results.push({
          toolName: scanner.name,
          shortcuts: [],
          errors: [errorMessage],
          warnings: []
        });
        
        this.progressTracker.update({
          scanner: scanner.name,
          status: 'error',
          progress: 0,
          found: 0,
          error: errorMessage
        });
      }
    }

    this.progressTracker.complete();
    console.log(formatScanSummary(results));

    return results;
  }

  async selectShortcuts(results: ScannerResult[]): Promise<Map<string, DiscoveredShortcut[]>> {
    const selected = new Map<string, DiscoveredShortcut[]>();
    
    // Process each tool's shortcuts
    for (const result of results) {
      if (result.shortcuts.length === 0) continue;

      console.log(chalk.bold.blue(`\n\n${result.toolName} Shortcuts`));
      console.log(chalk.gray(`Found ${result.shortcuts.length} shortcuts`));
      console.log(formatConfidenceLegend());

      // Group by category
      const categories = this.groupByCategory(result.shortcuts);
      const choices: any[] = [];

      for (const [category, shortcuts] of categories) {
        // Add category header
        choices.push({
          name: chalk.bold(`\n${formatCategory(category)} (${shortcuts.length})`),
          value: `__category_${category}`,
          disabled: true
        });

        // Add shortcuts in this category
        for (const shortcut of shortcuts) {
          const confidence = {
            high: chalk.green('●'),
            medium: chalk.yellow('●'),
            low: chalk.red('●')
          }[shortcut.confidence];

          const keys = formatShortcutKey(shortcut.keys);
          const name = `${confidence} ${shortcut.name.padEnd(35)} ${keys}`;
          
          choices.push({
            name,
            value: shortcut,
            checked: shortcut.confidence === 'high'
          });
        }
      }

      const selectedShortcuts = await checkbox<DiscoveredShortcut>({
        message: `Select shortcuts to import:`,
        choices,
        pageSize: 20,
        instructions: chalk.gray('\nSpace to toggle, a to toggle all, enter to continue')
      });

      if (selectedShortcuts.length > 0) {
        selected.set(result.toolName, selectedShortcuts);
      }
    }

    return selected;
  }

  async confirmExport(selectedCount: number): Promise<boolean> {
    return await confirm({
      message: `Export ${selectedCount} shortcuts to YAML files?`,
      default: true
    });
  }

  private groupByCategory(shortcuts: DiscoveredShortcut[]): Map<string, DiscoveredShortcut[]> {
    const groups = new Map<string, DiscoveredShortcut[]>();

    for (const shortcut of shortcuts) {
      const category = shortcut.category || 'general';
      if (!groups.has(category)) {
        groups.set(category, []);
      }
      groups.get(category)!.push(shortcut);
    }

    // Sort categories in a logical order
    const sortedGroups = new Map<string, DiscoveredShortcut[]>();
    const categoryOrder = [
      'file-operations',
      'navigation',
      'editing',
      'selection',
      'search-replace',
      'window-management',
      'pane-management',
      'formatting',
      'debugging',
      'general'
    ];

    for (const category of categoryOrder) {
      if (groups.has(category)) {
        sortedGroups.set(category, groups.get(category)!);
      }
    }

    // Add any remaining categories
    for (const [category, shortcuts] of groups) {
      if (!sortedGroups.has(category)) {
        sortedGroups.set(category, shortcuts);
      }
    }

    return sortedGroups;
  }

  showExportSuccess(exportPath: string, fileCount: number): void {
    console.log(chalk.green(`\n✓ Successfully exported ${fileCount} tool files to:`));
    console.log(chalk.cyan(`  ${exportPath}`));
    if (exportPath.includes('.config/shortcuts')) {
      console.log(chalk.yellow('\n⚠️  Files were written to the shortcuts config directory.'));
      console.log(chalk.yellow('   Existing files with the same names have been overwritten.'));
    }
  }
}
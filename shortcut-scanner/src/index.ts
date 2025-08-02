#!/usr/bin/env node

import { promises as fs } from 'node:fs';
import { join } from 'node:path';
import { Command } from 'commander';
import chalk from 'chalk';
import yaml from 'js-yaml';
import { confirm } from '@inquirer/prompts';
import { InteractiveCLI } from './cli/interactive-cli.js';
import { ShortcutConverter } from './converters/shortcut-converter.js';
import { registry } from './core/scanner-registry.js';
import type { DiscoveredShortcut } from './core/types.js';

// Register scanners
import { VimScanner } from './scanners/vim/vim-scanner.js';
import { VSCodeScanner } from './scanners/vscode/vscode-scanner.js';
import { CursorScanner } from './scanners/cursor/cursor-scanner.js';
import { TmuxScanner } from './scanners/tmux/tmux-scanner.js';

registry.register('vim', VimScanner);
registry.register('vscode', VSCodeScanner);
registry.register('cursor', CursorScanner);
registry.register('tmux', TmuxScanner);

const program = new Command();

program
  .name('shortcut-scanner')
  .description('Discover and extract keyboard shortcuts from various applications')
  .version('1.0.0')
  .option('-o, --output <path>', 'Output directory for YAML files', `${process.env.HOME}/.config/shortcuts/shortcuts`)
  .option('-s, --scanners <names...>', 'Specific scanners to run (vim, vscode, cursor, tmux)')
  .option('--no-defaults', 'Exclude default/built-in shortcuts')
  .action(async (options) => {
    const cli = new InteractiveCLI();
    const converter = new ShortcutConverter();

    try {
      // Get available scanners
      let availableScanners = registry.getAll().map(({ name, class: ScannerClass }) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        scanner: new ScannerClass({
          includeDefaults: options.defaults
        })
      }));

      // Filter scanners if specific ones requested
      if (options.scanners) {
        const requested = options.scanners.map((s: string) => s.toLowerCase());
        availableScanners = availableScanners.filter(({ name }) => 
          requested.includes(name.toLowerCase())
        );
      }

      if (availableScanners.length === 0) {
        console.error(chalk.red('No valid scanners found'));
        process.exit(1);
      }

      // Select scanners
      const selectedScanners = options.scanners 
        ? availableScanners.map(s => s.scanner)
        : await cli.selectScanners(availableScanners);

      // Run scanners
      const results = await cli.runScanners(selectedScanners);

      // Select shortcuts
      const selectedShortcuts = await cli.selectShortcuts(results);

      if (selectedShortcuts.size === 0) {
        console.log(chalk.yellow('\nNo shortcuts selected for export.'));
        return;
      }

      // Count total shortcuts
      let totalCount = 0;
      for (const shortcuts of selectedShortcuts.values()) {
        totalCount += shortcuts.length;
      }

      // Confirm export
      if (!await cli.confirmExport(totalCount)) {
        console.log(chalk.yellow('\nExport cancelled.'));
        return;
      }

      // Create output directory
      const outputDir = options.output;
      await fs.mkdir(outputDir, { recursive: true });

      // Check for existing files
      const existingFiles: string[] = [];
      for (const [toolName] of selectedShortcuts) {
        const filename = `${toolName.toLowerCase().replace(/\s+/g, '-')}.yaml`;
        const filepath = join(outputDir, filename);
        try {
          await fs.access(filepath);
          existingFiles.push(filename);
        } catch {
          // File doesn't exist, which is fine
        }
      }

      if (existingFiles.length > 0 && outputDir.includes('.config/shortcuts')) {
        console.log(chalk.yellow(`\n⚠️  The following files will be overwritten:`));
        existingFiles.forEach(file => console.log(chalk.yellow(`   - ${file}`)));
        const proceed = await confirm({
          message: 'Do you want to continue?',
          default: true
        });
        if (!proceed) {
          console.log(chalk.yellow('\nExport cancelled.'));
          return;
        }
      }

      // Export each tool's shortcuts
      for (const [toolName, shortcuts] of selectedShortcuts) {
        const toolFile = converter.convertToToolFile(toolName, shortcuts);
        const yamlContent = yaml.dump(converter.formatForYaml(toolFile), {
          lineWidth: -1,
          noRefs: true,
          sortKeys: false
        });

        const filename = `${toolName.toLowerCase().replace(/\s+/g, '-')}.yaml`;
        const filepath = join(outputDir, filename);
        
        await fs.writeFile(filepath, yamlContent, 'utf-8');
      }

      cli.showExportSuccess(outputDir, selectedShortcuts.size);

    } catch (error) {
      console.error(chalk.red('\nError:'), error);
      process.exit(1);
    }
  });

program
  .command('list')
  .description('List available scanners')
  .action(() => {
    console.log(chalk.bold('\nAvailable scanners:\n'));
    
    const scanners = registry.getAll();
    for (const { name, class: ScannerClass } of scanners) {
      const instance = new ScannerClass();
      console.log(`  ${chalk.cyan(name.padEnd(10))} ${instance.description}`);
    }
    console.log();
  });

program.parse(process.argv);
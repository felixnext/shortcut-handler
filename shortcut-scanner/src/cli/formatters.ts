import chalk from 'chalk';
import type { DiscoveredShortcut, ScannerResult } from '../core/types.js';

export function formatShortcutKey(keys: string[]): string {
  return keys.map(key => chalk.cyan(key)).join(' ');
}

export function formatShortcut(shortcut: DiscoveredShortcut): string {
  const confidence = {
    high: chalk.green('●'),
    medium: chalk.yellow('●'),
    low: chalk.red('●')
  }[shortcut.confidence];

  const keys = formatShortcutKey(shortcut.keys);
  const name = chalk.white(shortcut.name);
  
  return `${confidence} ${name.padEnd(40)} ${keys}`;
}

export function formatCategory(category: string): string {
  const categoryNames: Record<string, string> = {
    'navigation': 'Navigation',
    'editing': 'Editing',
    'file-operations': 'File Operations',
    'selection': 'Selection',
    'window-management': 'Window Management',
    'search-replace': 'Search & Replace',
    'execution': 'Execute Command',
    'debugging': 'Debugging',
    'git': 'Git Operations',
    'custom': 'Custom'
  };

  return categoryNames[category] || category;
}

export function groupShortcutsByCategory(shortcuts: DiscoveredShortcut[]): Map<string, DiscoveredShortcut[]> {
  const groups = new Map<string, DiscoveredShortcut[]>();

  for (const shortcut of shortcuts) {
    const category = shortcut.category || 'general';
    if (!groups.has(category)) {
      groups.set(category, []);
    }
    groups.get(category)!.push(shortcut);
  }

  // Sort categories
  const sortedGroups = new Map<string, DiscoveredShortcut[]>();
  const categoryOrder = [
    'navigation',
    'editing',
    'file-operations',
    'selection',
    'window-management',
    'search-replace',
    'execution',
    'debugging',
    'git',
    'custom'
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

export function formatScanSummary(results: ScannerResult[]): string {
  const lines: string[] = [];
  
  lines.push(chalk.bold('\nScan Summary:'));
  lines.push('─'.repeat(60));

  let totalShortcuts = 0;
  let totalErrors = 0;
  let totalWarnings = 0;

  for (const result of results) {
    const shortcutCount = result.shortcuts.length;
    totalShortcuts += shortcutCount;
    totalErrors += result.errors.length;
    totalWarnings += result.warnings.length;

    const status = result.errors.length > 0 
      ? chalk.red('✗')
      : shortcutCount > 0 
        ? chalk.green('✓')
        : chalk.yellow('○');

    lines.push(
      `${status} ${chalk.bold(result.toolName.padEnd(15))} ` +
      `${chalk.cyan(shortcutCount.toString().padStart(3))} shortcuts` +
      (result.configFile ? chalk.gray(` (${result.configFile})`) : '')
    );

    if (result.errors.length > 0) {
      for (const error of result.errors) {
        lines.push(chalk.red(`  └─ ${error}`));
      }
    }

    if (result.warnings.length > 0) {
      for (const warning of result.warnings) {
        lines.push(chalk.yellow(`  └─ ${warning}`));
      }
    }
  }

  lines.push('─'.repeat(60));
  lines.push(
    chalk.bold('Total: ') +
    chalk.cyan(`${totalShortcuts} shortcuts`) +
    (totalErrors > 0 ? chalk.red(` | ${totalErrors} errors`) : '') +
    (totalWarnings > 0 ? chalk.yellow(` | ${totalWarnings} warnings`) : '')
  );

  return lines.join('\n');
}

export function formatConfidenceLegend(): string {
  return chalk.gray(
    '\nConfidence: ' +
    chalk.green('● High') + ' ' +
    chalk.yellow('● Medium') + ' ' +
    chalk.red('● Low')
  );
}
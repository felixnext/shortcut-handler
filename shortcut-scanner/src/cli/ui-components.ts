import ora from 'ora';
import chalk from 'chalk';
import type { ScanProgress } from '../core/types.js';

export class ProgressTracker {
  private spinners: Map<string, any> = new Map();
  private startTime: number = Date.now();

  start(scannerName: string): void {
    const spinner = ora({
      text: `${scannerName}: Initializing...`,
      prefixText: chalk.blue('  '),
      spinner: 'dots'
    }).start();
    
    this.spinners.set(scannerName, spinner);
  }

  update(progress: ScanProgress): void {
    const spinner = this.spinners.get(progress.scanner);
    if (!spinner) return;

    const progressBar = this.createProgressBar(progress.progress);
    const foundText = progress.found > 0 
      ? chalk.green(` | Found: ${progress.found}`)
      : '';

    switch (progress.status) {
      case 'scanning':
        spinner.text = `${progress.scanner}: ${progressBar} ${Math.round(progress.progress)}%${foundText}`;
        if (progress.message) {
          spinner.text += chalk.gray(` - ${progress.message}`);
        }
        break;
      
      case 'completed':
        spinner.succeed(`${progress.scanner}: ${chalk.green('Complete')}${foundText}`);
        break;
      
      case 'error':
        spinner.fail(`${progress.scanner}: ${chalk.red('Failed')} - ${progress.error}`);
        break;
    }
  }

  private createProgressBar(progress: number): string {
    const width = 20;
    const filled = Math.round((progress / 100) * width);
    const empty = width - filled;
    
    return chalk.cyan('[') +
           chalk.green('█'.repeat(filled)) +
           chalk.gray('░'.repeat(empty)) +
           chalk.cyan(']');
  }

  complete(): void {
    const elapsed = ((Date.now() - this.startTime) / 1000).toFixed(1);
    console.log(chalk.gray(`\nCompleted in ${elapsed}s`));
  }
}

export function createSelectionTree(
  shortcuts: Array<{ category: string; items: Array<{ selected: boolean; shortcut: any }> }>
): string[] {
  const lines: string[] = [];
  
  for (const category of shortcuts) {
    const allSelected = category.items.every(item => item.selected);
    const someSelected = category.items.some(item => item.selected);
    const selectedCount = category.items.filter(item => item.selected).length;
    
    const categoryCheckbox = allSelected 
      ? chalk.green('[✓]')
      : someSelected 
        ? chalk.yellow('[~]')
        : '[ ]';
    
    lines.push(
      `${categoryCheckbox} ${chalk.bold(category.category)} ` +
      chalk.gray(`(${selectedCount}/${category.items.length})`)
    );
    
    for (let i = 0; i < category.items.length; i++) {
      const item = category.items[i];
      const isLast = i === category.items.length - 1;
      const prefix = isLast ? '└─' : '├─';
      const checkbox = item.selected ? chalk.green('[✓]') : '[ ]';
      
      lines.push(
        chalk.gray(`  ${prefix} `) +
        `${checkbox} ${item.shortcut.name.padEnd(35)} ` +
        chalk.cyan(item.shortcut.keys.join(' '))
      );
    }
    
    lines.push(''); // Empty line between categories
  }
  
  return lines;
}

export function showKeyboardHints(): string {
  return chalk.gray(
    '\nControls: ' +
    chalk.white('↑/↓') + ' Navigate | ' +
    chalk.white('Space') + ' Toggle | ' +
    chalk.white('a') + ' Select all in category | ' +
    chalk.white('A') + ' Select all | ' +
    chalk.white('Enter') + ' Continue'
  );
}
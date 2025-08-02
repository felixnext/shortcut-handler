import { promises as fs } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import type { DiscoveredShortcut, ScannerConfig, ScannerResult, ProgressCallback } from './types.js';

export abstract class BaseScanner {
  abstract readonly name: string;
  abstract readonly description: string;
  protected config: ScannerConfig;
  protected progressCallback?: ProgressCallback;

  constructor(config: ScannerConfig = {}) {
    this.config = config;
  }

  abstract scan(): Promise<ScannerResult>;
  abstract getConfigPaths(): string[];

  setProgressCallback(callback: ProgressCallback): void {
    this.progressCallback = callback;
  }

  protected updateProgress(progress: number, found: number, message?: string): void {
    if (this.progressCallback) {
      this.progressCallback({
        scanner: this.name,
        status: 'scanning',
        progress,
        found,
        message
      });
    }
  }

  protected async fileExists(path: string): Promise<boolean> {
    try {
      await fs.access(path);
      return true;
    } catch {
      return false;
    }
  }

  protected async readFile(path: string): Promise<string | null> {
    try {
      return await fs.readFile(path, 'utf-8');
    } catch (error) {
      return null;
    }
  }

  protected expandPath(path: string): string {
    if (path.startsWith('~')) {
      return join(homedir(), path.slice(1));
    }
    return path;
  }

  protected normalizeKeys(keys: string[]): string[] {
    return keys.map(key => {
      return key
        .toLowerCase()
        .replace(/\s+/g, '')
        .replace(/cmd/g, 'cmd')
        .replace(/ctrl/g, 'ctrl')
        .replace(/control/g, 'ctrl')
        .replace(/opt/g, 'alt')
        .replace(/option/g, 'alt')
        .replace(/meta/g, 'cmd')
        .replace(/return/g, 'enter');
    });
  }

  protected generateShortcutId(toolName: string, name: string): string {
    const cleanName = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    return `${toolName.toLowerCase()}-${cleanName}`;
  }

  protected categorizeShortcut(name: string, command?: string): string {
    const lowerName = name.toLowerCase();
    const lowerCommand = command?.toLowerCase() || '';

    if (/save|write|open|close/.test(lowerName) || /save|write|open|close/.test(lowerCommand)) {
      return 'file-operations';
    }
    if (/move|go|jump|navigate|cursor/.test(lowerName) || /move|go|jump|navigate/.test(lowerCommand)) {
      return 'navigation';
    }
    if (/search|find|replace/.test(lowerName) || /search|find|replace/.test(lowerCommand)) {
      return 'search-replace';
    }
    if (/copy|cut|paste|delete|yank|edit|insert/.test(lowerName) || /copy|cut|paste|delete|edit/.test(lowerCommand)) {
      return 'editing';
    }
    if (/select|visual|highlight/.test(lowerName) || /select|visual/.test(lowerCommand)) {
      return 'selection';
    }
    if (/window|pane|split|tab/.test(lowerName) || /window|pane|split/.test(lowerCommand)) {
      return 'window-management';
    }
    if (/run|exec|command/.test(lowerName) || /run|exec/.test(lowerCommand)) {
      return 'execution';
    }
    if (/debug|breakpoint/.test(lowerName) || /debug|breakpoint/.test(lowerCommand)) {
      return 'debugging';
    }
    if (/git|commit|push|pull/.test(lowerName) || /git/.test(lowerCommand)) {
      return 'git';
    }

    return 'custom';
  }

  protected sortShortcuts(shortcuts: DiscoveredShortcut[]): DiscoveredShortcut[] {
    return shortcuts.sort((a, b) => {
      if (a.category !== b.category) {
        return (a.category || '').localeCompare(b.category || '');
      }
      if (a.confidence !== b.confidence) {
        const confidenceOrder = { high: 0, medium: 1, low: 2 };
        return confidenceOrder[a.confidence] - confidenceOrder[b.confidence];
      }
      return a.name.localeCompare(b.name);
    });
  }
}
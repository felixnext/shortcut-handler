import type { BaseScanner } from './base-scanner.js';
import type { ScannerConfig } from './types.js';

export class ScannerRegistry {
  private scanners: Map<string, new (config?: ScannerConfig) => BaseScanner> = new Map();

  register(name: string, scannerClass: new (config?: ScannerConfig) => BaseScanner): void {
    this.scanners.set(name.toLowerCase(), scannerClass);
  }

  get(name: string): (new (config?: ScannerConfig) => BaseScanner) | undefined {
    return this.scanners.get(name.toLowerCase());
  }

  getAll(): Array<{ name: string; class: new (config?: ScannerConfig) => BaseScanner }> {
    return Array.from(this.scanners.entries()).map(([name, class_]) => ({
      name,
      class: class_
    }));
  }

  createInstance(name: string, config?: ScannerConfig): BaseScanner | null {
    const ScannerClass = this.get(name);
    if (!ScannerClass) {
      return null;
    }
    return new ScannerClass(config);
  }
}

export const registry = new ScannerRegistry();
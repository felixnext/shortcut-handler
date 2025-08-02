export interface DiscoveredShortcut {
  name: string;
  description?: string;
  keys: string[];
  category?: string;
  confidence: 'high' | 'medium' | 'low';
  source: string;
  originalCommand?: string;
}

export interface ScannerResult {
  toolName: string;
  toolDescription?: string;
  shortcuts: DiscoveredShortcut[];
  configFile?: string;
  errors: string[];
  warnings: string[];
}

export interface ScannerConfig {
  includePaths?: string[];
  excludePaths?: string[];
  includeDefaults?: boolean;
}

export interface ToolFile {
  tool: {
    name: string;
    description?: string;
    website?: string;
    icon?: string;
  };
  shortcuts: Array<{
    id: string;
    name: string;
    description?: string;
    keys: {
      default: string[];
      mac?: string[];
      windows?: string[];
      linux?: string[];
    };
    category: string;
    configFile?: string;
  }>;
}

export interface ScanProgress {
  scanner: string;
  status: 'pending' | 'scanning' | 'completed' | 'error';
  progress: number;
  found: number;
  message?: string;
  error?: string;
}

export type ProgressCallback = (progress: ScanProgress) => void;
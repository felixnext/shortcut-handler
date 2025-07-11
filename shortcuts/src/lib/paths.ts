import path from "node:path";

// Base data directory - respects DATA_DIR environment variable
export const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), "data");

// Shortcuts directory where tool YAML files are stored
export const SHORTCUTS_DIR = path.join(DATA_DIR, "shortcuts");

// Metadata file location (in root of data directory)
export const METADATA_FILE = path.join(DATA_DIR, "metadata.yaml");

// Helper to get tool file path
export function getToolFilePath(toolName: string): string {
	return path.join(SHORTCUTS_DIR, `${toolName}.yaml`);
}

// Helper to check if we're in production (Docker)
export function isProduction(): boolean {
	return process.env.NODE_ENV === "production";
}
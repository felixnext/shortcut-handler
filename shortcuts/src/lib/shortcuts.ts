import { promises as fs } from "node:fs";
import path from "node:path";
import yaml from "js-yaml";
import type { Metadata, Shortcut, ToolFile } from "~/types/shortcuts";
import { parseToolFile } from "./yaml-parser";

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), "data");
const TOOLS_DIR = path.join(DATA_DIR, "tools");
const METADATA_FILE = path.join(DATA_DIR, "metadata.yaml");

// Ensure data directories exist
async function ensureDataDirs() {
	try {
		await fs.mkdir(TOOLS_DIR, { recursive: true });
	} catch (error) {
		console.error("Failed to create data directories:", error);
	}
}

// Load all tool files
export async function loadAllTools(): Promise<ToolFile[]> {
	await ensureDataDirs();

	try {
		const files = await fs.readdir(TOOLS_DIR);
		const yamlFiles = files.filter(
			(f) => f.endsWith(".yaml") || f.endsWith(".yml"),
		);

		const tools = await Promise.all(
			yamlFiles.map(async (file) => {
				const content = await fs.readFile(path.join(TOOLS_DIR, file), "utf-8");
				const data = yaml.load(content) as Record<string, unknown>;
				return parseToolFile(data);
			}),
		);

		return tools;
	} catch (error) {
		console.error("Failed to load tools:", error);
		return [];
	}
}

// Load a specific tool
export async function loadTool(toolName: string): Promise<ToolFile | null> {
	try {
		const filePath = path.join(TOOLS_DIR, `${toolName}.yaml`);
		const content = await fs.readFile(filePath, "utf-8");
		const data = yaml.load(content) as Record<string, unknown>;
		return parseToolFile(data);
	} catch (error) {
		console.error(`Failed to load tool ${toolName}:`, error);
		return null;
	}
}

// Load metadata
export async function loadMetadata(): Promise<Metadata> {
	try {
		const content = await fs.readFile(METADATA_FILE, "utf-8");
		return yaml.load(content) as Metadata;
	} catch (error) {
		console.error("Failed to load metadata:", error);
		// Return default metadata if file doesn't exist
		return {
			categories: [],
			platforms: [],
		};
	}
}

// Save a tool file
export async function saveTool(
	toolName: string,
	toolFile: ToolFile,
): Promise<void> {
	await ensureDataDirs();

	const filePath = path.join(TOOLS_DIR, `${toolName}.yaml`);
	const content = yaml.dump(toolFile);
	await fs.writeFile(filePath, content, "utf-8");
}

// Delete a tool
export async function deleteTool(toolName: string): Promise<void> {
	const filePath = path.join(TOOLS_DIR, `${toolName}.yaml`);
	await fs.unlink(filePath);
}

// Get all shortcuts from all tools
export async function getAllShortcuts(): Promise<
	{ shortcut: Shortcut; tool: string; toolInfo: ToolFile["tool"] }[]
> {
	const tools = await loadAllTools();
	const allShortcuts: {
		shortcut: Shortcut;
		tool: string;
		toolInfo: ToolFile["tool"];
	}[] = [];

	for (const toolFile of tools) {
		for (const shortcut of toolFile.shortcuts) {
			allShortcuts.push({
				shortcut,
				tool: toolFile.tool.name.toLowerCase().replace(/\s+/g, "-"),
				toolInfo: toolFile.tool,
			});
		}
	}

	return allShortcuts;
}

import type { Key, Shortcut, ToolFile } from "~/types/shortcuts";
import { parseKeyString } from "./shortcut-utils";

// Convert YAML string format to Key[][] format
export function parseShortcutKeys(keys: string[] | Key[][]): Key[][] {
	// If it's already in the new format, return as is
	if (Array.isArray(keys) && keys.length > 0 && Array.isArray(keys[0])) {
		return keys as Key[][];
	}

	// Convert from string[] format
	const stringKeys = keys as string[];
	return stringKeys.map((keyStr) => parseKeyString(keyStr));
}

// Parse tool file and convert keys to proper format
export interface RawToolFile {
	tool: Record<string, unknown>;
	shortcuts: Record<string, unknown>[];
}

export function parseToolFile(data: RawToolFile): ToolFile {
	const tool = data.tool as any;
	const shortcuts: Shortcut[] = data.shortcuts.map((shortcut: any) => ({
		...shortcut,
		keys: {
			default: parseShortcutKeys(shortcut.keys.default),
			...(shortcut.keys.mac && { mac: parseShortcutKeys(shortcut.keys.mac) }),
			...(shortcut.keys.windows && {
				windows: parseShortcutKeys(shortcut.keys.windows),
			}),
			...(shortcut.keys.linux && {
				linux: parseShortcutKeys(shortcut.keys.linux),
			}),
		},
	}));

	return { tool, shortcuts };
}

// For writing back to YAML, convert Key[][] to string[] for readability
export function stringifyKeys(keys: Key[][]): string[] {
	return keys.map((combo) => {
		if (combo.length === 1 && combo[0]?.type === "command") {
			return combo[0].key;
		}
		// Generate multiple variations for better search matching
		const parts = combo.map((k) => {
			// Normalize key names for search
			let key = k.key.toLowerCase();
			if (key === "cmd" || key === "command") key = "cmd";
			if (key === "ctrl" || key === "control") key = "ctrl";
			if (key === "opt" || key === "option") key = "alt";
			if (key === "return") key = "enter";
			return key;
		});
		return parts.join("+");
	});
}

export function stringifyShortcut(shortcut: Shortcut): Record<string, unknown> {
	return {
		...shortcut,
		keys: {
			default: stringifyKeys(shortcut.keys.default),
			...(shortcut.keys.mac && { mac: stringifyKeys(shortcut.keys.mac) }),
			...(shortcut.keys.windows && {
				windows: stringifyKeys(shortcut.keys.windows),
			}),
			...(shortcut.keys.linux && { linux: stringifyKeys(shortcut.keys.linux) }),
		},
	};
}

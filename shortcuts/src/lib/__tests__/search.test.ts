import { describe, expect, it } from "vitest";
import type { SearchFilters, SearchableShortcut } from "~/types/shortcuts";
import { createSearchIndex, filterShortcuts } from "../search";
import { stringifyKeys } from "../yaml-parser";

const mockShortcuts: SearchableShortcut[] = [
	{
		tool: "vim",
		toolInfo: {
			name: "Vim",
			description: "Text editor",
		},
		shortcut: {
			id: "vim-save",
			name: "Save file",
			description: "Write current buffer to disk",
			category: "file",
			keys: {
				default: [[{ key: ":w", type: "command" }]],
			},
		},
		keyStrings: [":w"],
	},
	{
		tool: "vscode",
		toolInfo: {
			name: "VSCode",
			description: "Code editor",
		},
		shortcut: {
			id: "vscode-save",
			name: "Save",
			category: "file",
			keys: {
				default: [
					[
						{ key: "cmd", isModifier: true, type: "key" },
						{ key: "s", type: "key" },
					],
				],
			},
		},
		keyStrings: ["cmd+s"],
	},
	{
		tool: "tmux",
		toolInfo: {
			name: "tmux",
			description: "Terminal multiplexer",
		},
		shortcut: {
			id: "tmux-split",
			name: "Split pane vertically",
			category: "navigation",
			keys: {
				default: [
					[
						{ key: "ctrl", isModifier: true, type: "key" },
						{ key: "b", type: "key" },
					],
					[{ key: "%", type: "key" }],
				],
			},
		},
		keyStrings: ["ctrl+b", "%"],
	},
];

const mockCategories = [
	{ id: "file", name: "File Operations" },
	{ id: "navigation", name: "Navigation" },
];

describe("search", () => {
	describe("stringifyKeys", () => {
		it("should convert command to string", () => {
			const keys = [[{ key: ":w", type: "command" as const }]];
			expect(stringifyKeys(keys)).toEqual([":w"]);
		});

		it("should convert key combination to string", () => {
			const keys = [
				[
					{ key: "cmd", isModifier: true, type: "key" as const },
					{ key: "s", type: "key" as const },
				],
			];
			expect(stringifyKeys(keys)).toEqual(["cmd+s"]);
		});

		it("should convert sequence to strings", () => {
			const keys = [
				[
					{ key: "ctrl", isModifier: true, type: "key" as const },
					{ key: "b", type: "key" as const },
				],
				[{ key: "%", type: "key" as const }],
			];
			expect(stringifyKeys(keys)).toEqual(["ctrl+b", "%"]);
		});
	});

	describe("filterShortcuts", () => {
		const searchIndex = createSearchIndex(mockShortcuts, mockCategories);

		it("should return all shortcuts when no filters", () => {
			const filters: SearchFilters = {};
			const result = filterShortcuts(mockShortcuts, filters, searchIndex);
			expect(result).toHaveLength(3);
		});

		it("should filter by tool", () => {
			const filters: SearchFilters = { tools: ["vim"] };
			const result = filterShortcuts(mockShortcuts, filters, searchIndex);
			expect(result).toHaveLength(1);
			expect(result[0].tool).toBe("vim");
		});

		it("should filter by multiple tools", () => {
			const filters: SearchFilters = { tools: ["vim", "vscode"] };
			const result = filterShortcuts(mockShortcuts, filters, searchIndex);
			expect(result).toHaveLength(2);
		});

		it("should filter by category", () => {
			const filters: SearchFilters = { categories: ["file"] };
			const result = filterShortcuts(mockShortcuts, filters, searchIndex);
			expect(result).toHaveLength(2);
		});

		it("should filter by captured keys", () => {
			const filters: SearchFilters = { capturedKeys: "cmd s" };
			const result = filterShortcuts(mockShortcuts, filters, searchIndex);
			expect(result).toHaveLength(1);
			expect(result[0].tool).toBe("vscode");
		});

		it("should search by query", () => {
			const filters: SearchFilters = { query: "save" };
			const result = filterShortcuts(mockShortcuts, filters, searchIndex);
			expect(result).toHaveLength(2);
		});

		it("should combine filters", () => {
			const filters: SearchFilters = {
				tools: ["vscode"],
				categories: ["file"],
				query: "save",
			};
			const result = filterShortcuts(mockShortcuts, filters, searchIndex);
			expect(result).toHaveLength(1);
			expect(result[0].tool).toBe("vscode");
		});
	});
});

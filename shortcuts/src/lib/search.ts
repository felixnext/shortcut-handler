import Fuse from "fuse.js";
import type { Key, SearchFilters, Shortcut } from "~/types/shortcuts";
import { stringifyKeys } from "./yaml-parser";

import type { Tool } from "~/types/shortcuts";

export interface SearchableShortcut {
	shortcut: Shortcut;
	tool: string;
	toolInfo: Tool;
	// Flattened fields for searching
	keyStrings: string[];
	categoryName?: string;
}

// Convert keys to searchable strings with variations for better matching
function keysToSearchStrings(keys: Key[][]): string[] {
	const baseStrings = stringifyKeys(keys);
	const variations: string[] = [];

	// Add base strings
	variations.push(...baseStrings);

	// Add variations with different separators
	for (const str of baseStrings) {
		// Space-separated version for keyboard capture search
		variations.push(str.replace(/\+/g, " "));
		// Individual keys
		variations.push(...str.split(/[+ ]/));
	}

	// Remove duplicates
	return [...new Set(variations)];
}

// Create search index
export function createSearchIndex(
	shortcuts: SearchableShortcut[],
	categories: { id: string; name: string }[],
) {
	// Enrich shortcuts with category names and key strings
	const enrichedShortcuts = shortcuts.map((item) => ({
		...item,
		keyStrings: keysToSearchStrings(item.shortcut.keys.default),
		categoryName: categories.find((c) => c.id === item.shortcut.category)?.name,
	}));

	const options = {
		keys: [
			{ name: "shortcut.name", weight: 2 },
			{ name: "shortcut.description", weight: 1 },
			{ name: "keyStrings", weight: 3 }, // Higher weight for key matches
			{ name: "tool", weight: 1 },
			{ name: "categoryName", weight: 0.5 },
		],
		threshold: 0.4, // Slightly more lenient
		includeScore: true,
		useExtendedSearch: true,
		ignoreLocation: true, // Don't care about position in string
		minMatchCharLength: 1, // Allow single character matches
	};

	return new Fuse(enrichedShortcuts, options);
}

// Apply filters to shortcuts
export function filterShortcuts(
	shortcuts: SearchableShortcut[],
	filters: SearchFilters,
	searchIndex: Fuse<SearchableShortcut>,
): SearchableShortcut[] {
	let filtered = shortcuts;

	// Apply captured keys filter (exact key matching)
	if (filters.capturedKeys?.trim()) {
		const capturedKeysList = filters.capturedKeys
			.trim()
			.toLowerCase()
			.split(" ");
		filtered = filtered.filter((item) => {
			// Generate key strings if not already present
			const keyStrings =
				item.keyStrings || keysToSearchStrings(item.shortcut.keys.default);

			// Check if any of the key strings contain ALL captured keys
			return keyStrings.some((keyString) => {
				const normalizedKeyString = keyString.toLowerCase();
				// Check if all captured keys are present in this key string
				return capturedKeysList.every((capturedKey) =>
					normalizedKeyString.includes(capturedKey),
				);
			});
		});
	}

	// Apply search query (general fuzzy search)
	if (filters.query?.trim() && !filters.capturedKeys) {
		const searchResults = searchIndex.search(filters.query);
		filtered = searchResults.map((result) => result.item);
	}

	// Filter by tools
	if (filters.tools && filters.tools.length > 0) {
		filtered = filtered.filter((item) => filters.tools?.includes(item.tool));
	}

	// Filter by categories
	if (filters.categories && filters.categories.length > 0) {
		filtered = filtered.filter((item) =>
			filters.categories?.includes(item.shortcut.category),
		);
	}

	return filtered;
}

// Group shortcuts by tool
export function groupByTool(
	shortcuts: SearchableShortcut[],
): Map<string, SearchableShortcut[]> {
	const grouped = new Map<string, SearchableShortcut[]>();

	for (const shortcut of shortcuts) {
		const existing = grouped.get(shortcut.tool) || [];
		existing.push(shortcut);
		grouped.set(shortcut.tool, existing);
	}

	return grouped;
}

// Group shortcuts by category
export function groupByCategory(
	shortcuts: SearchableShortcut[],
): Map<string, SearchableShortcut[]> {
	const grouped = new Map<string, SearchableShortcut[]>();

	for (const shortcut of shortcuts) {
		const category = shortcut.shortcut.category;
		const existing = grouped.get(category) || [];
		existing.push(shortcut);
		grouped.set(category, existing);
	}

	return grouped;
}

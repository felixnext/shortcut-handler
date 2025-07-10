export interface Key {
	key: string;
	isModifier?: boolean;
	type: "key" | "command";
}

export interface Shortcut {
	id: string;
	name: string;
	description?: string;
	keys: {
		default: Key[][];
		mac?: Key[][];
		windows?: Key[][];
		linux?: Key[][];
	};
	category: string;
	configFile?: string;
}

export interface Tool {
	name: string;
	description?: string;
	website?: string;
	icon?: string;
}

export interface ToolFile {
	tool: Tool;
	shortcuts: Shortcut[];
}

export interface Category {
	id: string;
	name: string;
	description?: string;
}

export interface Platform {
	id: string;
	name: string;
	modifierKeys: Record<string, string>;
}

export interface Metadata {
	categories: Category[];
	platforms: Platform[];
}

export type SearchType = "function" | "keys" | "description";

export interface SearchFilters {
	query?: string;
	capturedKeys?: string; // Separate field for keyboard-captured keys
	tools?: string[];
	categories?: string[];
	searchType?: SearchType;
}

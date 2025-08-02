import type { Key, Shortcut } from "~/types/shortcuts";

export type KeyVisualizationType = "key-press" | "command" | "sequence";

export function getVisualizationType(keys: Key[][]): KeyVisualizationType {
	if (keys.length === 0) return "key-press";

	// If it's a sequence (multiple key combinations)
	if (keys.length > 1) {
		return "sequence";
	}

	// Single key combination - check if it's a command
	const firstCombo = keys[0];
	if (firstCombo && firstCombo.length === 1 && firstCombo[0]?.type === "command") {
		return "command";
	}

	return "key-press";
}

export function normalizeModifierKey(
	modifier: string,
	platform: "mac" | "windows" | "linux" = "mac",
): string {
	const normalized = modifier.toLowerCase();

	if (platform === "mac") {
		switch (normalized) {
			case "cmd":
			case "command":
			case "meta":
				return "⌘";
			case "ctrl":
			case "control":
				return "⌃";
			case "opt":
			case "option":
			case "alt":
				return "⌥";
			case "shift":
				return "⇧";
			default:
				return modifier;
		}
	}
	if (platform === "windows") {
		switch (normalized) {
			case "win":
			case "windows":
			case "meta":
				return "⊞";
			case "ctrl":
			case "control":
				return "Ctrl";
			case "alt":
				return "Alt";
			case "shift":
				return "Shift";
			default:
				return modifier;
		}
	}
	// linux
	switch (normalized) {
		case "super":
		case "meta":
			return "Super";
		case "ctrl":
		case "control":
			return "Ctrl";
		case "alt":
			return "Alt";
		case "shift":
			return "Shift";
		default:
			return modifier;
	}
}

export function detectPlatform(): "mac" | "windows" | "linux" {
	if (typeof window === "undefined") return "mac";

	const platform = window.navigator.platform.toLowerCase();
	if (platform.includes("mac")) return "mac";
	if (platform.includes("win")) return "windows";
	return "linux";
}

export function getShortcutKeys(
	shortcut: Shortcut,
	platform?: "mac" | "windows" | "linux",
): Key[][] {
	const detectedPlatform = platform || detectPlatform();

	// Check for platform-specific keys
	if (detectedPlatform === "mac" && shortcut.keys.mac) {
		return shortcut.keys.mac;
	}
	if (detectedPlatform === "windows" && shortcut.keys.windows) {
		return shortcut.keys.windows;
	}
	if (detectedPlatform === "linux" && shortcut.keys.linux) {
		return shortcut.keys.linux;
	}

	// Fall back to default
	return shortcut.keys.default;
}

// Helper function to convert old string format to new Key format (for migration)
export function parseKeyString(keyStr: string): Key[] {
	// Command pattern
	if (keyStr.startsWith(":") || keyStr.startsWith("/")) {
		return [{ key: keyStr, type: "command" }];
	}

	// Handle escape sequences - just return the escaped string as-is for KeyPress to handle
	if (keyStr.includes("\\")) {
		return [{
			key: keyStr,
			isModifier: false,
			type: "key" as const,
		}];
	}

	// Check if the entire string is just a single special character
	if (keyStr === "+" || keyStr === "," || keyStr === " ") {
		return [{
			key: keyStr,
			isModifier: false,
			type: "key" as const,
		}];
	}

	const modifierNames = [
		"ctrl",
		"cmd",
		"alt",
		"opt",
		"shift",
		"meta",
		"win",
		"super",
		"control",
		"command",
		"option",
	];

	// First try to split by + for modifier combinations
	// But only if the string contains actual modifiers
	const hasModifier = modifierNames.some(mod => 
		keyStr.toLowerCase().includes(mod)
	);

	if (hasModifier && keyStr.includes("+")) {
		// Split by + and check each part
		const parts = keyStr.split("+").map(p => p.trim()).filter(p => p);
		
		// Validate that we have valid parts
		if (parts.length > 1) {
			return parts.map((part) => {
				const isModifier = modifierNames.includes(part.toLowerCase());
				return {
					key: part,
					isModifier,
					type: "key" as const,
				};
			});
		}
	}

	// For strings without modifiers, check if it's space-separated
	// This handles cases like "g d" or "[ d"
	if (keyStr.includes(" ") && !hasModifier) {
		const parts = keyStr.split(" ").filter(p => p);
		if (parts.length > 1) {
			return parts.map((part) => ({
				key: part,
				isModifier: false,
				type: "key" as const,
			}));
		}
	}

	// Default case: return the whole string as a single key
	return [{
		key: keyStr,
		isModifier: modifierNames.includes(keyStr.toLowerCase()),
		type: "key" as const,
	}];
}

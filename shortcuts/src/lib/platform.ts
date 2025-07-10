// Platform detection utilities

export type Platform = "mac" | "windows" | "linux";

export function detectPlatform(): Platform {
	if (typeof window === "undefined") {
		return "mac"; // Default for SSR
	}

	const userAgent = window.navigator.userAgent.toLowerCase();
	const platform = window.navigator.platform.toLowerCase();

	if (platform.includes("mac") || userAgent.includes("mac")) {
		return "mac";
	}

	if (platform.includes("win") || userAgent.includes("win")) {
		return "windows";
	}

	return "linux";
}

// Key mappings for different platforms
export const PLATFORM_KEY_MAP: Record<Platform, Record<string, string>> = {
	mac: {
		cmd: "⌘",
		command: "⌘",
		ctrl: "⌃",
		control: "⌃",
		alt: "⌥",
		option: "⌥",
		shift: "⇧",
		meta: "⌘",
		enter: "⏎",
		return: "⏎",
		delete: "⌫",
		backspace: "⌫",
		tab: "⇥",
		escape: "⎋",
		esc: "⎋",
		space: "␣",
		up: "↑",
		down: "↓",
		left: "←",
		right: "→",
		pageup: "⇞",
		pagedown: "⇟",
		home: "↖",
		end: "↘",
	},
	windows: {
		cmd: "Win",
		command: "Win",
		ctrl: "Ctrl",
		control: "Ctrl",
		alt: "Alt",
		option: "Alt",
		shift: "Shift",
		meta: "Win",
		enter: "Enter",
		return: "Enter",
		delete: "Del",
		backspace: "Backspace",
		tab: "Tab",
		escape: "Esc",
		esc: "Esc",
		space: "Space",
		up: "↑",
		down: "↓",
		left: "←",
		right: "→",
		pageup: "PgUp",
		pagedown: "PgDn",
		home: "Home",
		end: "End",
	},
	linux: {
		cmd: "Super",
		command: "Super",
		ctrl: "Ctrl",
		control: "Ctrl",
		alt: "Alt",
		option: "Alt",
		shift: "Shift",
		meta: "Super",
		enter: "Enter",
		return: "Enter",
		delete: "Del",
		backspace: "Backspace",
		tab: "Tab",
		escape: "Esc",
		esc: "Esc",
		space: "Space",
		up: "↑",
		down: "↓",
		left: "←",
		right: "→",
		pageup: "PgUp",
		pagedown: "PgDn",
		home: "Home",
		end: "End",
	},
};

export function getPlatformKey(key: string, platform: Platform): string {
	const keyLower = key.toLowerCase();
	const platformMap = PLATFORM_KEY_MAP[platform];

	// Check if we have a platform-specific symbol
	if (platformMap[keyLower]) {
		return platformMap[keyLower];
	}

	// For single letters/numbers, return as uppercase
	if (key.length === 1) {
		return key.toUpperCase();
	}

	// For function keys and other special keys, return as-is
	return key;
}

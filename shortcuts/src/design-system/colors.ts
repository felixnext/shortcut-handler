export interface ColorScale {
	50: string;
	100: string;
	200: string;
	300: string;
	400: string;
	500: string;
	600: string;
	700: string;
	800: string;
	900: string;
	950: string;
}

// Base color scales
export const gray: ColorScale = {
	50: "#f9fafb",
	100: "#f3f4f6",
	200: "#e5e7eb",
	300: "#d1d5db",
	400: "#9ca3af",
	500: "#6b7280",
	600: "#4b5563",
	700: "#374151",
	800: "#1f2937",
	900: "#111827",
	950: "#030712",
};

export const blue: ColorScale = {
	50: "#eff6ff",
	100: "#dbeafe",
	200: "#bfdbfe",
	300: "#93c5fd",
	400: "#60a5fa",
	500: "#3b82f6",
	600: "#2563eb",
	700: "#1d4ed8",
	800: "#1e40af",
	900: "#1e3a8a",
	950: "#172554",
};

export const green: ColorScale = {
	50: "#f0fdf4",
	100: "#dcfce7",
	200: "#bbf7d0",
	300: "#86efac",
	400: "#4ade80",
	500: "#22c55e",
	600: "#16a34a",
	700: "#15803d",
	800: "#166534",
	900: "#14532d",
	950: "#052e16",
};

export const purple: ColorScale = {
	50: "#faf5ff",
	100: "#f3e8ff",
	200: "#e9d5ff",
	300: "#d8b4fe",
	400: "#c084fc",
	500: "#a855f7",
	600: "#9333ea",
	700: "#7c3aed",
	800: "#6b21a8",
	900: "#581c87",
	950: "#3b0764",
};

export const red: ColorScale = {
	50: "#fef2f2",
	100: "#fee2e2",
	200: "#fecaca",
	300: "#fca5a5",
	400: "#f87171",
	500: "#ef4444",
	600: "#dc2626",
	700: "#b91c1c",
	800: "#991b1b",
	900: "#7f1d1d",
	950: "#450a0a",
};

export const amber: ColorScale = {
	50: "#fffbeb",
	100: "#fef3c7",
	200: "#fde68a",
	300: "#fcd34d",
	400: "#fbbf24",
	500: "#f59e0b",
	600: "#d97706",
	700: "#b45309",
	800: "#92400e",
	900: "#78350f",
	950: "#451a03",
};

export interface ThemeColors {
	// Core background colors
	background: {
		primary: string; // Main app background
		secondary: string; // Cards, elevated surfaces
		tertiary: string; // Subtle backgrounds, hover states
		inverse: string; // Inverted (tooltips, popovers)
	};

	// Core text colors
	foreground: {
		primary: string; // Main text
		secondary: string; // Muted text
		tertiary: string; // Very muted text
		inverse: string; // Inverted text
	};

	// Border colors
	border: {
		primary: string; // Main borders
		secondary: string; // Subtle borders
		tertiary: string; // Very subtle borders
		focus: string; // Focus rings
	};

	// Card component
	card: {
		background: string;
		backgroundHover: string;
		border: string;
		shadow: string;
	};

	// Button variants
	button: {
		primary: {
			background: string;
			backgroundHover: string;
			foreground: string;
			border: string;
		};
		secondary: {
			background: string;
			backgroundHover: string;
			foreground: string;
			border: string;
		};
		ghost: {
			backgroundHover: string;
			foreground: string;
		};
	};

	// Badge/Pill variants
	badge: {
		tool: {
			background: string;
			backgroundHover: string;
			foreground: string;
			border: string;
		};
		category: {
			background: string;
			backgroundHover: string;
			foreground: string;
			border: string;
		};
	};

	// Key visualizations
	key: {
		background: string;
		backgroundTop: string; // For gradient
		backgroundBottom: string; // For gradient
		foreground: string;
		border: string;
		shadow: string;
		shadowInset: string;
		modifier: {
			foreground: string;
		};
	};

	// Terminal/Command display
	terminal: {
		background: string;
		foreground: string;
		border: string;
	};

	// Sidebar
	sidebar: {
		background: string;
		itemBackground: string;
		itemBackgroundHover: string;
		itemBackgroundActive: string;
		itemForeground: string;
		itemForegroundActive: string;
		border: string;
	};

	// Input fields
	input: {
		background: string;
		border: string;
		borderFocus: string;
		placeholder: string;
		foreground: string;
	};

	// State colors
	state: {
		hover: string;
		active: string;
		selected: string;
		focus: string;
		error: string;
		errorLight: string;
		warning: string;
		warningLight: string;
		success: string;
		successLight: string;
		info: string;
		infoLight: string;
	};
}

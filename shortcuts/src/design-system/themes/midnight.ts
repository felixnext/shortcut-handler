import { amber, blue, gray, green, purple, red } from "../colors";
import type { Theme } from "./base";

// A deep blue-tinted dark theme
export const midnightTheme: Theme = {
	name: "Midnight",
	isDark: true,
	colors: {
		background: {
			primary: "#0f172a", // slate-900
			secondary: "#1e293b", // slate-800
			tertiary: "#334155", // slate-700
			inverse: "#f1f5f9", // slate-100
		},

		foreground: {
			primary: "#f1f5f9", // slate-100
			secondary: "#cbd5e1", // slate-300
			tertiary: "#94a3b8", // slate-400
			inverse: "#0f172a", // slate-900
		},

		border: {
			primary: "#334155", // slate-700
			secondary: "#334155", // slate-700
			tertiary: "#1e293b", // slate-800
			focus: "#60a5fa", // blue-400
		},

		card: {
			background: "#1e293b", // slate-800
			backgroundHover: "#334155", // slate-700
			border: "#334155", // slate-700
			shadow: "rgba(0, 0, 0, 0.5)",
		},

		button: {
			primary: {
				background: "#3b82f6", // blue-500
				backgroundHover: "#2563eb", // blue-600
				foreground: "#ffffff",
				border: "#3b82f6", // blue-500
			},
			secondary: {
				background: "#1e293b", // slate-800
				backgroundHover: "#334155", // slate-700
				foreground: "#e2e8f0", // slate-200
				border: "#475569", // slate-600
			},
			ghost: {
				backgroundHover: "#334155", // slate-700
				foreground: "#e2e8f0", // slate-200
			},
		},

		badge: {
			tool: {
				background: "#1e293b", // slate-800
				backgroundHover: "#334155", // slate-700
				foreground: "#cbd5e1", // slate-300
				border: "#334155", // slate-700
			},
			category: {
				background: "#1e3a8a", // blue-900
				backgroundHover: "#1e40af", // blue-800
				foreground: "#bfdbfe", // blue-200
				border: "#1e40af", // blue-800
			},
		},

		key: {
			background: "linear-gradient(to bottom, #334155, #1e293b)",
			backgroundTop: "#334155", // slate-700
			backgroundBottom: "#1e293b", // slate-800
			foreground: "#e2e8f0", // slate-200
			border: "#475569", // slate-600
			shadow: "0 2px 4px rgba(0, 0, 0, 0.5)",
			shadowInset: "inset 0 1px 0 rgba(255, 255, 255, 0.1)",
			modifier: {
				foreground: "#f1f5f9", // slate-100
			},
		},

		terminal: {
			background: "#020617", // slate-950
			foreground: "#4ade80", // green-400
			border: "#1e293b", // slate-800
		},

		sidebar: {
			background: "#1e293b", // slate-800
			itemBackground: "transparent",
			itemBackgroundHover: "#334155", // slate-700
			itemBackgroundActive: "#3b82f6", // blue-500
			itemForeground: "#cbd5e1", // slate-300
			itemForegroundActive: "#ffffff",
			border: "#334155", // slate-700
		},

		input: {
			background: "#1e293b", // slate-800
			border: "#475569", // slate-600
			borderFocus: "#60a5fa", // blue-400
			placeholder: "#64748b", // slate-500
			foreground: "#f1f5f9", // slate-100
		},

		state: {
			hover: "#334155", // slate-700
			active: "#475569", // slate-600
			selected: "#172554", // blue-950
			focus: "#60a5fa", // blue-400
			error: "#ef4444", // red-500
			errorLight: "#7f1d1d", // red-900
			warning: "#f59e0b", // amber-500
			warningLight: "#78350f", // amber-900
			success: "#22c55e", // green-500
			successLight: "#14532d", // green-900
			info: "#3b82f6", // blue-500
			infoLight: "#1e3a8a", // blue-900
		},
	},
};

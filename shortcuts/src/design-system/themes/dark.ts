import { amber, blue, gray, green, purple, red } from "../colors";
import type { Theme } from "./base";

export const darkTheme: Theme = {
	name: "Dark",
	isDark: true,
	colors: {
		background: {
			primary: gray[900],
			secondary: gray[800],
			tertiary: gray[700],
			inverse: gray[50],
		},

		foreground: {
			primary: gray[50],
			secondary: gray[300],
			tertiary: gray[400],
			inverse: gray[900],
		},

		border: {
			primary: gray[700],
			secondary: gray[700],
			tertiary: gray[800],
			focus: blue[400],
		},

		card: {
			background: gray[800],
			backgroundHover: gray[700],
			border: gray[700],
			shadow: "rgba(0, 0, 0, 0.3)",
		},

		button: {
			primary: {
				background: gray[50],
				backgroundHover: gray[200],
				foreground: gray[900],
				border: gray[50],
			},
			secondary: {
				background: gray[800],
				backgroundHover: gray[700],
				foreground: gray[100],
				border: gray[600],
			},
			ghost: {
				backgroundHover: gray[800],
				foreground: gray[100],
			},
		},

		badge: {
			tool: {
				background: gray[800],
				backgroundHover: gray[700],
				foreground: gray[200],
				border: gray[700],
			},
			category: {
				background: blue[900],
				backgroundHover: blue[800],
				foreground: blue[200],
				border: blue[800],
			},
		},

		key: {
			background: "linear-gradient(to bottom, #374151, #1f2937)",
			backgroundTop: gray[700],
			backgroundBottom: gray[800],
			foreground: gray[200],
			border: gray[600],
			shadow: "0 2px 4px rgba(0, 0, 0, 0.3)",
			shadowInset: "inset 0 1px 0 rgba(255, 255, 255, 0.1)",
			modifier: {
				foreground: gray[100],
			},
		},

		terminal: {
			background: gray[950],
			foreground: green[400],
			border: gray[800],
		},

		sidebar: {
			background: gray[800],
			itemBackground: "transparent",
			itemBackgroundHover: gray[700],
			itemBackgroundActive: gray[50],
			itemForeground: gray[300],
			itemForegroundActive: gray[900],
			border: gray[700],
		},

		input: {
			background: gray[800],
			border: gray[600],
			borderFocus: blue[400],
			placeholder: gray[500],
			foreground: gray[50],
		},

		state: {
			hover: gray[800],
			active: gray[700],
			selected: blue[950],
			focus: blue[400],
			error: red[500],
			errorLight: red[950],
			warning: amber[500],
			warningLight: amber[950],
			success: green[500],
			successLight: green[950],
			info: blue[500],
			infoLight: blue[950],
		},
	},
};

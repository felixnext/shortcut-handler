import { amber, blue, gray, green, purple, red } from "../colors";
import type { Theme } from "./base";

export const lightTheme: Theme = {
	name: "Light",
	isDark: false,
	colors: {
		background: {
			primary: gray[50],
			secondary: "#ffffff",
			tertiary: gray[100],
			inverse: gray[900],
		},

		foreground: {
			primary: gray[900],
			secondary: gray[600],
			tertiary: gray[500],
			inverse: gray[50],
		},

		border: {
			primary: gray[200],
			secondary: gray[200],
			tertiary: gray[100],
			focus: blue[500],
		},

		card: {
			background: "#ffffff",
			backgroundHover: gray[50],
			border: gray[200],
			shadow: "rgba(0, 0, 0, 0.05)",
		},

		button: {
			primary: {
				background: gray[900],
				backgroundHover: gray[800],
				foreground: "#ffffff",
				border: gray[900],
			},
			secondary: {
				background: "#ffffff",
				backgroundHover: gray[50],
				foreground: gray[700],
				border: gray[300],
			},
			ghost: {
				backgroundHover: gray[100],
				foreground: gray[700],
			},
		},

		badge: {
			tool: {
				background: gray[100],
				backgroundHover: gray[200],
				foreground: gray[700],
				border: gray[200],
			},
			category: {
				background: blue[100],
				backgroundHover: blue[200],
				foreground: blue[700],
				border: blue[200],
			},
		},

		key: {
			background: "linear-gradient(to bottom, #ffffff, #f9fafb)",
			backgroundTop: "#ffffff",
			backgroundBottom: gray[50],
			foreground: gray[700],
			border: gray[300],
			shadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
			shadowInset: "inset 0 1px 0 rgba(255, 255, 255, 0.5)",
			modifier: {
				foreground: gray[900],
			},
		},

		terminal: {
			background: gray[900],
			foreground: green[400],
			border: gray[700],
		},

		sidebar: {
			background: gray[50],
			itemBackground: "transparent",
			itemBackgroundHover: gray[100],
			itemBackgroundActive: gray[900],
			itemForeground: gray[700],
			itemForegroundActive: "#ffffff",
			border: gray[200],
		},

		input: {
			background: "#ffffff",
			border: gray[300],
			borderFocus: blue[500],
			placeholder: gray[400],
			foreground: gray[900],
		},

		state: {
			hover: gray[100],
			active: gray[200],
			selected: blue[50],
			focus: blue[500],
			error: red[600],
			errorLight: red[50],
			warning: amber[600],
			warningLight: amber[50],
			success: green[600],
			successLight: green[50],
			info: blue[600],
			infoLight: blue[50],
		},
	},
};

export * from "./tokens";
export * from "./colors";
export * from "./themes";
import type { Theme } from "./themes";

// Helper function to apply theme as CSS variables
export function applyTheme(theme: Theme): void {
	const root = document.documentElement;

	// Apply color variables
	const setColorVar = (path: string[], value: string) => {
		const varName = `--color-${path.join("-")}`;
		root.style.setProperty(varName, value);
	};

	// Recursively set color variables
	const applyColors = (obj: any, path: string[] = []) => {
		for (const [key, value] of Object.entries(obj)) {
			if (typeof value === "string") {
				setColorVar([...path, key], value);
			} else if (typeof value === "object" && value !== null) {
				applyColors(value, [...path, key]);
			}
		}
	};

	applyColors(theme.colors);

	// Apply theme mode
	root.setAttribute("data-theme", theme.name.toLowerCase());
	root.classList.toggle("dark", theme.isDark);
}

// Get CSS variable value
export function getCSSVariable(name: string): string {
	return getComputedStyle(document.documentElement)
		.getPropertyValue(`--${name}`)
		.trim();
}

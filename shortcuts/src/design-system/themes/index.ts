export type { Theme, ThemeMode } from "./base";
export { lightTheme } from "./light";
export { darkTheme } from "./dark";
export { midnightTheme } from "./midnight";

import type { Theme, ThemeMode } from "./base";
import { darkTheme } from "./dark";
import { lightTheme } from "./light";
import { midnightTheme } from "./midnight";

export const themes: Record<ThemeMode, Theme> = {
	light: lightTheme,
	dark: darkTheme,
	midnight: midnightTheme,
	sunset: lightTheme, // Placeholder for future theme
};

export function getTheme(mode: ThemeMode): Theme {
	return themes[mode] || lightTheme;
}

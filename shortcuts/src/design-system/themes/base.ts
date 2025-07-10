import type { ThemeColors } from "../colors";

export interface Theme {
	name: string;
	colors: ThemeColors;
	isDark: boolean;
}

export type ThemeMode = "light" | "dark" | "midnight" | "sunset";

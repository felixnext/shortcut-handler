"use client";

import {
	type ReactNode,
	createContext,
	useContext,
	useEffect,
	useState,
} from "react";
import {
	type Theme,
	type ThemeMode,
	applyTheme,
	getTheme,
} from "~/design-system";

interface ThemeContextValue {
	theme: Theme;
	themeMode: ThemeMode;
	setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const THEME_STORAGE_KEY = "keyboard-shortcuts-theme";

export function ThemeProvider({ children }: { children: ReactNode }) {
	const [themeMode, setThemeMode] = useState<ThemeMode>("light");
	const [theme, setTheme] = useState<Theme>(getTheme("light"));
	const [mounted, setMounted] = useState(false);

	// Load theme from localStorage on mount
	useEffect(() => {
		setMounted(true);
		const savedTheme = localStorage.getItem(
			THEME_STORAGE_KEY,
		) as ThemeMode | null;
		if (
			savedTheme &&
			["light", "dark", "midnight", "sunset"].includes(savedTheme)
		) {
			setThemeMode(savedTheme);
			setTheme(getTheme(savedTheme));
		} else {
			// Check system preference
			const prefersDark = window.matchMedia(
				"(prefers-color-scheme: dark)",
			).matches;
			const defaultMode = prefersDark ? "dark" : "light";
			setThemeMode(defaultMode);
			setTheme(getTheme(defaultMode));
		}
	}, []);

	// Apply theme when it changes (only after mount to prevent hydration issues)
	useEffect(() => {
		if (mounted) {
			applyTheme(theme);
		}
	}, [theme, mounted]);

	const handleSetThemeMode = (mode: ThemeMode) => {
		setThemeMode(mode);
		setTheme(getTheme(mode));
		localStorage.setItem(THEME_STORAGE_KEY, mode);
	};

	// Use a stable theme value during SSR to prevent hydration mismatches
	const contextValue = mounted
		? { theme, themeMode, setThemeMode: handleSetThemeMode }
		: {
				theme: getTheme("light"),
				themeMode: "light" as ThemeMode,
				setThemeMode: handleSetThemeMode,
			};

	return (
		<ThemeContext.Provider value={contextValue}>
			{children}
		</ThemeContext.Provider>
	);
}

export function useTheme() {
	const context = useContext(ThemeContext);
	if (!context) {
		throw new Error("useTheme must be used within a ThemeProvider");
	}
	return context;
}

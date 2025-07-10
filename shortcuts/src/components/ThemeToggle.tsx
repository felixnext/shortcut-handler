"use client";

import { Monitor, Moon, Sun, Sunset } from "lucide-react";
import { useTheme } from "~/contexts/ThemeContext";
import type { ThemeMode } from "~/design-system";
import { cn } from "~/lib/utils";

const themeIcons: Record<ThemeMode, typeof Sun> = {
	light: Sun,
	dark: Moon,
	midnight: Moon,
	sunset: Sunset,
};

const themeLabels: Record<ThemeMode, string> = {
	light: "Light",
	dark: "Dark",
	midnight: "Midnight",
	sunset: "Sunset",
};

export function ThemeToggle() {
	const { themeMode, setThemeMode } = useTheme();
	const Icon = themeIcons[themeMode];

	const themes: ThemeMode[] = ["light", "dark", "midnight"];

	return (
		<div className="group relative">
			<button
				type="button"
				className={cn(
					"rounded-md p-2",
					"text-[var(--color-foreground-secondary)]",
					"hover:text-[var(--color-foreground-primary)]",
					"hover:bg-[var(--color-state-hover)]",
					"transition-colors",
				)}
				title="Change theme"
			>
				<Icon className="h-5 w-5" />
			</button>

			{/* Theme dropdown */}
			<div
				className={cn(
					"absolute top-full right-0 mt-2",
					"w-32",
					"rounded-md",
					"bg-[var(--color-background-secondary)]",
					"border border-[var(--color-border-primary)]",
					"shadow-lg",
					"invisible opacity-0",
					"group-hover:visible group-hover:opacity-100",
					"transition-all duration-200",
					"z-50",
				)}
			>
				<div className="p-1">
					{themes.map((mode) => {
						const ModeIcon = themeIcons[mode];
						const isActive = themeMode === mode;

						return (
							<button
								key={mode}
								type="button"
								onClick={() => setThemeMode(mode)}
								className={cn(
									"flex w-full items-center gap-2",
									"px-3 py-2",
									"rounded",
									"text-sm",
									"transition-colors",
									isActive
										? [
												"bg-[var(--color-state-selected)]",
												"text-[var(--color-foreground-primary)]",
											]
										: [
												"text-[var(--color-foreground-secondary)]",
												"hover:bg-[var(--color-state-hover)]",
												"hover:text-[var(--color-foreground-primary)]",
											],
								)}
							>
								<ModeIcon className="h-4 w-4" />
								<span>{themeLabels[mode]}</span>
							</button>
						);
					})}
				</div>
			</div>
		</div>
	);
}

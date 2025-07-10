import { detectPlatform, normalizeModifierKey } from "~/lib/shortcut-utils";
import { cn } from "~/lib/utils";
import type { Key } from "~/types/shortcuts";

interface KeyPressProps {
	keyData: Key;
	className?: string;
	size?: "sm" | "md" | "lg";
}

export function KeyPress({ keyData, className, size = "md" }: KeyPressProps) {
	const platform = detectPlatform();
	const displayKey = keyData.isModifier
		? normalizeModifierKey(keyData.key, platform)
		: keyData.key;

	const sizeClasses = {
		sm: "px-2 py-1 text-xs min-w-[24px] h-6",
		md: "px-3 py-1.5 text-sm min-w-[32px] h-8",
		lg: "px-4 py-2 text-base min-w-[40px] h-10",
	};

	return (
		<kbd
			className={cn(
				"inline-flex items-center justify-center",
				"font-sans",
				keyData.isModifier ? "font-semibold" : "font-medium",
				"rounded-md",
				"transition-theme",
				// Use CSS variables from theme
				"bg-gradient-to-b",
				"from-[var(--color-key-backgroundTop)] to-[var(--color-key-backgroundBottom)]",
				"text-[var(--color-key-foreground)]",
				"border border-[var(--color-key-border)]",
				"shadow-[var(--color-key-shadow)]",
				// Hover state
				"hover:shadow-md",
				"hover:scale-105",
				"transition-all duration-150",
				sizeClasses[size],
				className,
			)}
			style={{
				boxShadow: "var(--color-key-shadow), var(--color-key-shadowInset)",
			}}
		>
			<span
				className={
					keyData.isModifier
						? "text-[var(--color-key-modifier-foreground)]"
						: ""
				}
			>
				{displayKey}
			</span>
		</kbd>
	);
}

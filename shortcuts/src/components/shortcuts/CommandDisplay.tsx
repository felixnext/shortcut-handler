import { cn } from "~/lib/utils";
import type { Key } from "~/types/shortcuts";

interface CommandDisplayProps {
	command: Key;
	className?: string;
	size?: "sm" | "md" | "lg";
}

export function CommandDisplay({
	command,
	className,
	size = "md",
}: CommandDisplayProps) {
	const sizeClasses = {
		sm: "px-2 py-1 text-xs",
		md: "px-3 py-1.5 text-sm",
		lg: "px-4 py-2 text-base",
	};

	return (
		<code
			className={cn(
				"inline-flex items-center",
				"font-mono",
				"rounded",
				"transition-theme",
				// Use CSS variables from theme
				"bg-[var(--color-terminal-background)]",
				"text-[var(--color-terminal-foreground)]",
				"border border-[var(--color-terminal-border)]",
				sizeClasses[size],
				className,
			)}
		>
			{command.key}
		</code>
	);
}

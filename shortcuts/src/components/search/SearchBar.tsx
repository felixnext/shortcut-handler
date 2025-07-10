"use client";

import { Search, X } from "lucide-react";
import { cn } from "~/lib/utils";

interface SearchBarProps {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	className?: string;
}

export function SearchBar({
	value,
	onChange,
	placeholder = "Search shortcuts...",
	className,
}: SearchBarProps) {
	return (
		<div className={cn("relative", className)}>
			<Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-[var(--color-foreground-tertiary)]" />
			<input
				type="text"
				value={value}
				onChange={(e) => onChange(e.target.value)}
				placeholder={placeholder}
				className={cn(
					"h-10 w-full",
					"pr-10 pl-10",
					"rounded-md",
					"text-sm",
					"transition-colors duration-200",
					// Theme colors
					"bg-[var(--color-input-background)]",
					"text-[var(--color-input-foreground)]",
					"border border-[var(--color-input-border)]",
					"placeholder:text-[var(--color-input-placeholder)]",
					"focus:border-[var(--color-input-borderFocus)]",
					"focus:outline-none focus:ring-1 focus:ring-[var(--color-input-borderFocus)]",
				)}
			/>
			{value && (
				<button
					type="button"
					onClick={() => onChange("")}
					className={cn(
						"-translate-y-1/2 absolute top-1/2 right-2",
						"p-1",
						"rounded",
						"text-[var(--color-foreground-tertiary)]",
						"hover:text-[var(--color-foreground-secondary)]",
						"hover:bg-[var(--color-state-hover)]",
						"transition-colors",
					)}
				>
					<X className="h-4 w-4" />
				</button>
			)}
		</div>
	);
}

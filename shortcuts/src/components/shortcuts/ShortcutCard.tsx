import { Edit, Hash, Wrench as ToolIcon, Trash2 } from "lucide-react";
import { useState } from "react";
import { getShortcutKeys } from "~/lib/shortcut-utils";
import { cn } from "~/lib/utils";
import type { Shortcut, Tool } from "~/types/shortcuts";
import { KeyVisualizer } from "./KeyVisualizer";

interface ShortcutCardProps {
	shortcut: Shortcut;
	tool: Tool;
	category?: string;
	onEdit?: () => void;
	onDelete?: () => void;
	onToolClick?: (tool: string) => void;
	onCategoryClick?: (category: string) => void;
	className?: string;
}

export function ShortcutCard({
	shortcut,
	tool,
	category,
	onEdit,
	onDelete,
	onToolClick,
	onCategoryClick,
	className,
}: ShortcutCardProps) {
	const keys = getShortcutKeys(shortcut);
	const [showTooltip, setShowTooltip] = useState(false);

	return (
		<div
			className={cn(
				"group relative",
				"p-4", // Consistent 16px padding
				"rounded-lg",
				"transition-all duration-200",
				"overflow-visible", // Allow tooltips to show outside bounds
				// Theme-aware colors
				"bg-[var(--color-card-background)]",
				"border border-[var(--color-card-border)]",
				"hover:bg-[var(--color-card-backgroundHover)]",
				"hover:shadow-md",
				className,
			)}
			onMouseEnter={() => setShowTooltip(true)}
			onMouseLeave={() => setShowTooltip(false)}
		>
			{/* Header section with consistent spacing */}
			<div className="space-y-3">
				{/* Title and actions row */}
				<div className="flex items-start justify-between gap-2">
					<h3 className="font-medium text-[var(--color-foreground-primary)] text-base leading-tight">
						{shortcut.name}
					</h3>

					{/* Actions - always visible on mobile, hover on desktop */}
					{(onEdit || onDelete) && (
						<div className="flex shrink-0 items-center gap-1 transition-opacity md:opacity-0 md:group-hover:opacity-100">
							{onEdit && (
								<button
									type="button"
									onClick={onEdit}
									className={cn(
										"rounded-md p-1.5",
										"text-[var(--color-foreground-tertiary)]",
										"hover:text-[var(--color-foreground-secondary)]",
										"hover:bg-[var(--color-state-hover)]",
										"transition-colors",
									)}
									title="Edit shortcut"
								>
									<Edit className="h-3.5 w-3.5" />
								</button>
							)}
							{onDelete && (
								<button
									type="button"
									onClick={onDelete}
									className={cn(
										"rounded-md p-1.5",
										"text-[var(--color-foreground-tertiary)]",
										"hover:text-[var(--color-state-error)]",
										"hover:bg-[var(--color-state-errorLight)]",
										"transition-colors",
									)}
									title="Delete shortcut"
								>
									<Trash2 className="h-3.5 w-3.5" />
								</button>
							)}
						</div>
					)}
				</div>

				{/* Pills row */}
				<div className="flex flex-wrap items-center gap-2">
					{/* Tool pill */}
					<button
						type="button"
						onClick={() => onToolClick?.(tool.name)}
						className={cn(
							"inline-flex items-center gap-1.5",
							"px-2.5 py-1",
							"rounded-md",
							"font-medium text-xs",
							"transition-all duration-150",
							// Theme colors
							"bg-[var(--color-badge-tool-background)]",
							"text-[var(--color-badge-tool-foreground)]",
							"border border-[var(--color-badge-tool-border)]",
							"hover:bg-[var(--color-badge-tool-backgroundHover)]",
							"hover:scale-105",
							"cursor-pointer",
						)}
					>
						<ToolIcon className="h-3 w-3" />
						<span>{tool.name}</span>
					</button>

					{/* Category pill */}
					{category && (
						<button
							type="button"
							onClick={() => onCategoryClick?.(shortcut.category)}
							className={cn(
								"inline-flex items-center gap-1.5",
								"px-2.5 py-1",
								"rounded-md",
								"font-medium text-xs",
								"transition-all duration-150",
								// Theme colors
								"bg-[var(--color-badge-category-background)]",
								"text-[var(--color-badge-category-foreground)]",
								"border border-[var(--color-badge-category-border)]",
								"hover:bg-[var(--color-badge-category-backgroundHover)]",
								"hover:scale-105",
								"cursor-pointer",
							)}
						>
							<Hash className="h-3 w-3" />
							<span>{category}</span>
						</button>
					)}
				</div>
			</div>

			{/* Key visualization with proper spacing */}
			<div className="mt-4">
				<KeyVisualizer keys={keys} size="md" />
			</div>

			{/* Tooltip for description and config file */}
			{showTooltip && (shortcut.description || shortcut.configFile) && (
				<div
					className={cn(
						"-bottom-2 absolute right-0 left-0 z-50 translate-y-full",
						"mx-2 p-3",
						"rounded-md shadow-lg",
						"bg-[var(--color-background-inverse)]",
						"text-[var(--color-foreground-inverse)]",
						"text-xs",
						"opacity-0 group-hover:opacity-100",
						"transition-opacity duration-200",
						"pointer-events-none",
					)}
				>
					{shortcut.description && (
						<p className="text-[var(--color-foreground-inverse)]">
							{shortcut.description}
						</p>
					)}
					{shortcut.configFile && (
						<p className="mt-1 text-[var(--color-foreground-inverse)] opacity-70">
							Config: {shortcut.configFile}
						</p>
					)}
				</div>
			)}
		</div>
	);
}

"use client";

import { Bookmark, Check, X } from "lucide-react";
import { cn } from "~/lib/utils";
import type { Category } from "~/types/shortcuts";

interface FilterSidebarProps {
	tools: Array<{ name: string; count: number }>;
	categories: Array<{ category: Category; count: number }>;
	selectedTools: string[];
	selectedCategories: string[];
	learningCount: number;
	isLearningFilterActive: boolean;
	onToolToggle: (tool: string) => void;
	onCategoryToggle: (category: string) => void;
	onLearningToggle: () => void;
	onClearAll?: () => void;
	className?: string;
}

export function FilterSidebar({
	tools,
	categories,
	selectedTools,
	selectedCategories,
	learningCount,
	isLearningFilterActive,
	onToolToggle,
	onCategoryToggle,
	onLearningToggle,
	onClearAll,
	className,
}: FilterSidebarProps) {
	const hasActiveFilters =
		selectedTools.length > 0 || selectedCategories.length > 0 || isLearningFilterActive;
	const activeFilterCount = selectedTools.length + selectedCategories.length + (isLearningFilterActive ? 1 : 0);

	return (
		<aside className={cn("space-y-6", className)}>
			{/* Active filters header */}
			{hasActiveFilters && (
				<div className="flex items-center justify-between">
					<span className="font-medium text-[var(--color-foreground-secondary)] text-sm">
						{activeFilterCount} active filter
						{activeFilterCount !== 1 ? "s" : ""}
					</span>
					{onClearAll && (
						<button
							type="button"
							onClick={onClearAll}
							className={cn(
								"font-medium text-xs",
								"text-[var(--color-foreground-tertiary)]",
								"hover:text-[var(--color-foreground-primary)]",
								"transition-colors",
								"flex items-center gap-1",
							)}
						>
							<X className="h-3 w-3" />
							Clear all
						</button>
					)}
				</div>
			)}

			{/* Learning Filter */}
			<div>
				<h3 className="mb-3 font-semibold text-[var(--color-foreground-primary)] text-sm">
					Learning
				</h3>
				<button
					type="button"
					onClick={onLearningToggle}
					className={cn(
						"flex w-full items-center justify-between",
						"rounded-md px-3 py-2",
						"font-medium text-sm",
						"transition-all duration-150",
						"group",
						isLearningFilterActive
							? [
									"bg-gradient-to-r from-violet-500/20 to-pink-500/20",
									"text-violet-700 dark:text-violet-300",
									"border border-violet-500/30",
									"shadow-sm",
								]
							: [
									"bg-[var(--color-sidebar-itemBackground)]",
									"text-[var(--color-sidebar-itemForeground)]",
									"hover:bg-[var(--color-sidebar-itemBackgroundHover)]",
									"border border-transparent",
								],
					)}
				>
					<span className="flex items-center gap-2">
						<Bookmark 
							className={cn(
								"h-3.5 w-3.5",
								isLearningFilterActive && "fill-current"
							)} 
						/>
						<span>Currently Learning</span>
					</span>
					<span
						className={cn(
							"text-xs",
							"rounded px-1.5 py-0.5",
							isLearningFilterActive
								? "bg-violet-500/30"
								: "bg-[var(--color-background-tertiary)]",
						)}
					>
						{learningCount}
					</span>
				</button>
			</div>

			{/* Tools Filter */}
			<div>
				<h3 className="mb-3 font-semibold text-[var(--color-foreground-primary)] text-sm">
					Tools
				</h3>
				<div className="space-y-1">
					{tools.map(({ name, count }) => {
						// Convert to lowercase kebab-case to match the stored format
						const toolKey = name.toLowerCase().replace(/\s+/g, "-");
						const isSelected = selectedTools.includes(toolKey);
						return (
							<button
								key={name}
								type="button"
								onClick={() => onToolToggle(name)}
								className={cn(
									"flex w-full items-center justify-between",
									"rounded-md px-3 py-2",
									"font-medium text-sm",
									"transition-all duration-150",
									"group",
									isSelected
										? [
												"bg-[var(--color-sidebar-itemBackgroundActive)]",
												"text-[var(--color-sidebar-itemForegroundActive)]",
												"shadow-sm",
											]
										: [
												"bg-[var(--color-sidebar-itemBackground)]",
												"text-[var(--color-sidebar-itemForeground)]",
												"hover:bg-[var(--color-sidebar-itemBackgroundHover)]",
											],
								)}
							>
								<span className="flex items-center gap-2">
									{isSelected && <Check className="h-3 w-3" />}
									<span>{name}</span>
								</span>
								<span
									className={cn(
										"text-xs",
										"rounded px-1.5 py-0.5",
										isSelected
											? "bg-white/20"
											: "bg-[var(--color-background-tertiary)]",
									)}
								>
									{count}
								</span>
							</button>
						);
					})}
				</div>
			</div>

			{/* Categories Filter */}
			<div>
				<h3 className="mb-3 font-semibold text-[var(--color-foreground-primary)] text-sm">
					Categories
				</h3>
				<div className="space-y-1">
					{categories.map(({ category, count }) => {
						const isSelected = selectedCategories.includes(category.id);
						return (
							<button
								key={category.id}
								type="button"
								onClick={() => onCategoryToggle(category.id)}
								className={cn(
									"flex w-full items-center justify-between",
									"rounded-md px-3 py-2",
									"font-medium text-sm",
									"transition-all duration-150",
									"group",
									isSelected
										? [
												"bg-[var(--color-sidebar-itemBackgroundActive)]",
												"text-[var(--color-sidebar-itemForegroundActive)]",
												"shadow-sm",
											]
										: [
												"bg-[var(--color-sidebar-itemBackground)]",
												"text-[var(--color-sidebar-itemForeground)]",
												"hover:bg-[var(--color-sidebar-itemBackgroundHover)]",
											],
								)}
							>
								<span className="flex items-center gap-2">
									{isSelected && <Check className="h-3 w-3" />}
									<span>{category.name}</span>
								</span>
								<span
									className={cn(
										"text-xs",
										"rounded px-1.5 py-0.5",
										isSelected
											? "bg-white/20"
											: "bg-[var(--color-background-tertiary)]",
									)}
								>
									{count}
								</span>
							</button>
						);
					})}
				</div>
			</div>
		</aside>
	);
}

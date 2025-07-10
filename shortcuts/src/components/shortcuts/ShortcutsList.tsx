"use client";

import { Grid3x3, Layers } from "lucide-react";
import { useState } from "react";
import { groupByCategory } from "~/lib/search";
import type { SearchableShortcut } from "~/lib/search";
import { cn } from "~/lib/utils";
import type { Category } from "~/types/shortcuts";
import { ShortcutCard } from "./ShortcutCard";

interface ShortcutsListProps {
	shortcuts: SearchableShortcut[];
	categories: Category[];
	onToolClick?: (tool: string) => void;
	onCategoryClick?: (category: string) => void;
	onEdit?: (shortcut: SearchableShortcut) => void;
	onDelete?: (shortcut: SearchableShortcut) => void;
}

type ViewMode = "grid" | "swimlanes";

export function ShortcutsList({
	shortcuts,
	categories,
	onToolClick,
	onCategoryClick,
	onEdit,
	onDelete,
}: ShortcutsListProps) {
	const [viewMode, setViewMode] = useState<ViewMode>("grid");

	const getCategoryName = (categoryId: string) => {
		return categories.find((c) => c.id === categoryId)?.name || categoryId;
	};

	if (shortcuts.length === 0) {
		return (
			<div className="flex h-64 items-center justify-center">
				<div className="space-y-2 text-center">
					<p className="text-[var(--color-foreground-secondary)]">
						No shortcuts found
					</p>
					<p className="text-[var(--color-foreground-tertiary)] text-sm">
						Try adjusting your filters or search query
					</p>
				</div>
			</div>
		);
	}

	// View mode toggle
	const ViewToggle = () => (
		<div className="mb-4 flex items-center justify-between">
			<h2 className="font-semibold text-[var(--color-foreground-primary)] text-lg">
				{shortcuts.length} shortcut{shortcuts.length !== 1 ? "s" : ""}
			</h2>
			<div className="inline-flex rounded-md shadow-sm" role="group">
				<button
					type="button"
					onClick={() => setViewMode("grid")}
					className={cn(
						"inline-flex items-center gap-2",
						"px-3 py-1.5",
						"rounded-l-md",
						"border",
						"font-medium text-sm",
						"transition-colors",
						viewMode === "grid"
							? [
									"bg-[var(--color-state-selected)]",
									"text-[var(--color-foreground-primary)]",
									"border-[var(--color-border-focus)]",
								]
							: [
									"bg-[var(--color-background-secondary)]",
									"text-[var(--color-foreground-secondary)]",
									"border-[var(--color-border-primary)]",
									"hover:bg-[var(--color-state-hover)]",
									"hover:text-[var(--color-foreground-primary)]",
								],
					)}
				>
					<Grid3x3 className="h-4 w-4" />
					Grid
				</button>
				<button
					type="button"
					onClick={() => setViewMode("swimlanes")}
					className={cn(
						"inline-flex items-center gap-2",
						"px-3 py-1.5",
						"rounded-r-md",
						"border-y border-r",
						"font-medium text-sm",
						"transition-colors",
						viewMode === "swimlanes"
							? [
									"bg-[var(--color-state-selected)]",
									"text-[var(--color-foreground-primary)]",
									"border-[var(--color-border-focus)]",
								]
							: [
									"bg-[var(--color-background-secondary)]",
									"text-[var(--color-foreground-secondary)]",
									"border-[var(--color-border-primary)]",
									"hover:bg-[var(--color-state-hover)]",
									"hover:text-[var(--color-foreground-primary)]",
								],
					)}
				>
					<Layers className="h-4 w-4" />
					Swimlanes
				</button>
			</div>
		</div>
	);

	// Grid view
	const GridView = () => (
		<div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
			{shortcuts.map((item) => (
				<ShortcutCard
					key={`${item.tool}-${item.shortcut.id}`}
					shortcut={item.shortcut}
					tool={item.toolInfo}
					category={getCategoryName(item.shortcut.category)}
					onToolClick={onToolClick}
					onCategoryClick={onCategoryClick}
					onEdit={() => onEdit?.(item)}
					onDelete={() => onDelete?.(item)}
				/>
			))}
		</div>
	);

	// Swimlanes view
	const SwimlanesView = () => {
		const grouped = groupByCategory(shortcuts);
		const sortedCategories = categories.filter((cat) => grouped.has(cat.id));

		return (
			<div className="space-y-8">
				{sortedCategories.map((category) => {
					const categoryShortcuts = grouped.get(category.id) || [];
					return (
						<div key={category.id} className="space-y-3">
							{/* Category header */}
							<div className="flex items-center gap-3 border-[var(--color-border-secondary)] border-b pb-2">
								<h3 className="font-semibold text-[var(--color-foreground-primary)] text-lg">
									{category.name}
								</h3>
								<span className="text-[var(--color-foreground-tertiary)] text-sm">
									({categoryShortcuts.length})
								</span>
								{category.description && (
									<p className="text-[var(--color-foreground-tertiary)] text-sm">
										— {category.description}
									</p>
								)}
							</div>

							{/* Grid of cards for this category */}
							<div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
								{categoryShortcuts.map((item) => (
									<ShortcutCard
										key={`${item.tool}-${item.shortcut.id}`}
										shortcut={item.shortcut}
										tool={item.toolInfo}
										category={category.name}
										onToolClick={onToolClick}
										onCategoryClick={onCategoryClick}
										onEdit={() => onEdit?.(item)}
										onDelete={() => onDelete?.(item)}
									/>
								))}
							</div>
						</div>
					);
				})}

				{/* Uncategorized shortcuts */}
				{grouped.has("") && (
					<div className="space-y-3">
						<div className="flex items-center gap-3 border-[var(--color-border-secondary)] border-b pb-2">
							<h3 className="font-semibold text-[var(--color-foreground-primary)] text-lg">
								Uncategorized
							</h3>
							<span className="text-[var(--color-foreground-tertiary)] text-sm">
								({(grouped.get("") || []).length})
							</span>
						</div>
						<div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
							{(grouped.get("") || []).map((item) => (
								<ShortcutCard
									key={`${item.tool}-${item.shortcut.id}`}
									shortcut={item.shortcut}
									tool={item.toolInfo}
									onToolClick={onToolClick}
									onCategoryClick={onCategoryClick}
									onEdit={() => onEdit?.(item)}
									onDelete={() => onDelete?.(item)}
								/>
							))}
						</div>
					</div>
				)}
			</div>
		);
	};

	return (
		<div>
			<ViewToggle />
			{viewMode === "grid" ? <GridView /> : <SwimlanesView />}
		</div>
	);
}

"use client";

import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { HeaderMenu } from "~/components/HeaderMenu";
import { FilterSidebar } from "~/components/search/FilterSidebar";
import { KeyboardCapture } from "~/components/search/KeyboardCapture";
import { SearchBar } from "~/components/search/SearchBar";
import { ShortcutDialog } from "~/components/shortcuts/ShortcutDialog";
import { ShortcutsList } from "~/components/shortcuts/ShortcutsList";
import {
	type SearchableShortcut,
	createSearchIndex,
	filterShortcuts,
} from "~/lib/search";
import { cn } from "~/lib/utils";
import { stringifyKeys } from "~/lib/yaml-parser";
import type {
	Category,
	Metadata,
	SearchFilters,
	Shortcut,
	Tool,
} from "~/types/shortcuts";

export default function HomePage() {
	const [shortcuts, setShortcuts] = useState<SearchableShortcut[]>([]);
	const [metadata, setMetadata] = useState<Metadata>({
		categories: [],
		platforms: [],
	});
	const [filters, setFilters] = useState<SearchFilters>({
		query: "",
		capturedKeys: "",
		tools: [],
		categories: [],
	});
	const [loading, setLoading] = useState(true);

	// Dialog state
	const [dialogOpen, setDialogOpen] = useState(false);
	const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
	const [editingShortcut, setEditingShortcut] =
		useState<SearchableShortcut | null>(null);

	// Load data on mount
	useEffect(() => {
		async function loadData() {
			try {
				const [shortcutsRes, metadataRes] = await Promise.all([
					fetch("/api/shortcuts"),
					fetch("/api/metadata"),
				]);

				const shortcutsData = await shortcutsRes.json();
				const metadataData = await metadataRes.json();

				// Enrich shortcuts with keyStrings for filtering
				const enrichedShortcuts = shortcutsData.map(
					(item: SearchableShortcut) => ({
						...item,
						keyStrings: stringifyKeys(item.shortcut.keys.default),
					}),
				);

				setShortcuts(enrichedShortcuts);
				setMetadata(metadataData);
			} catch (error) {
				console.error("Failed to load data:", error);
			} finally {
				setLoading(false);
			}
		}

		loadData();
	}, []);

	// Create search index
	const searchIndex =
		shortcuts.length > 0
			? createSearchIndex(shortcuts, metadata.categories)
			: null;

	// Filter shortcuts
	const filteredShortcuts = searchIndex
		? filterShortcuts(shortcuts, filters, searchIndex)
		: shortcuts;

	// Calculate counts for filters
	const toolCounts = new Map<string, number>();
	const categoryCounts = new Map<string, number>();

	for (const shortcut of shortcuts) {
		// Tool counts
		const count = toolCounts.get(shortcut.toolInfo.name) || 0;
		toolCounts.set(shortcut.toolInfo.name, count + 1);

		// Category counts
		const catCount = categoryCounts.get(shortcut.shortcut.category) || 0;
		categoryCounts.set(shortcut.shortcut.category, catCount + 1);
	}

	const toolsWithCounts = Array.from(toolCounts.entries()).map(
		([name, count]) => ({
			name,
			count,
		}),
	);

	const categoriesWithCounts = metadata.categories.map((category) => ({
		category,
		count: categoryCounts.get(category.id) || 0,
	}));

	// Filter handlers
	const handleToolToggle = (tool: string) => {
		// Convert to lowercase kebab-case to match the tool field format
		const toolKey = tool.toLowerCase().replace(/\s+/g, "-");
		setFilters((prev) => ({
			...prev,
			tools: prev.tools?.includes(toolKey)
				? prev.tools.filter((t) => t !== toolKey)
				: [...(prev.tools || []), toolKey],
		}));
	};

	const handleCategoryToggle = (category: string) => {
		setFilters((prev) => ({
			...prev,
			categories: prev.categories?.includes(category)
				? prev.categories.filter((c) => c !== category)
				: [...(prev.categories || []), category],
		}));
	};

	const handleClearFilters = () => {
		setFilters({
			query: "",
			capturedKeys: "",
			tools: [],
			categories: [],
		});
	};

	// Handle pill clicks from shortcut cards
	const handleToolClick = (tool: string) => {
		// Convert to lowercase kebab-case to match the tool field format
		const toolKey = tool.toLowerCase().replace(/\s+/g, "-");
		if (!filters.tools?.includes(toolKey)) {
			setFilters((prev) => ({
				...prev,
				tools: [...(prev.tools || []), toolKey],
			}));
		}
	};

	const handleCategoryClick = (categoryId: string) => {
		if (!filters.categories?.includes(categoryId)) {
			setFilters((prev) => ({
				...prev,
				categories: [...(prev.categories || []), categoryId],
			}));
		}
	};

	// CRUD handlers
	const handleCreate = () => {
		setDialogMode("create");
		setEditingShortcut(null);
		setDialogOpen(true);
	};

	const handleCreateTool = async (tool: Tool) => {
		try {
			// Create the tool file with the new tool
			const toolNameKebab = tool.name.toLowerCase().replace(/\s+/g, "-");
			await fetch(`/api/tools/${toolNameKebab}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ tool, shortcuts: [] }),
			});

			// Reload data to get the updated tools list
			const [shortcutsRes, metadataRes] = await Promise.all([
				fetch("/api/shortcuts"),
				fetch("/api/metadata"),
			]);

			const shortcutsData = await shortcutsRes.json();
			const metadataData = await metadataRes.json();

			// Enrich shortcuts with keyStrings for filtering
			const enrichedShortcuts = shortcutsData.map(
				(item: SearchableShortcut) => ({
					...item,
					keyStrings: stringifyKeys(item.shortcut.keys.default),
				}),
			);

			setShortcuts(enrichedShortcuts);
			setMetadata(metadataData);
		} catch (error) {
			console.error("Failed to create tool:", error);
		}
	};

	const handleCreateCategory = async (category: Category) => {
		try {
			// For now, we'll just add it to the local state
			// In a real implementation, you might want to persist this to a config file
			setMetadata((prev) => ({
				...prev,
				categories: [...prev.categories, category],
			}));
		} catch (error) {
			console.error("Failed to create category:", error);
		}
	};

	const handleEdit = (shortcut: SearchableShortcut) => {
		setDialogMode("edit");
		setEditingShortcut(shortcut);
		setDialogOpen(true);
	};

	const handleSave = async (shortcut: Shortcut, toolName: string) => {
		try {
			const toolNameKebab = toolName.toLowerCase().replace(/\s+/g, "-");

			if (dialogMode === "create") {
				// Create new shortcut
				await fetch(`/api/shortcuts/${toolNameKebab}`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(shortcut),
				});
			} else {
				// Update existing shortcut
				await fetch(`/api/shortcuts/${toolNameKebab}/${shortcut.id}`, {
					method: "PUT",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(shortcut),
				});
			}

			// Reload data
			const [shortcutsRes, metadataRes] = await Promise.all([
				fetch("/api/shortcuts"),
				fetch("/api/metadata"),
			]);

			const shortcutsData = await shortcutsRes.json();
			const metadataData = await metadataRes.json();

			// Enrich shortcuts with keyStrings for filtering
			const enrichedShortcuts = shortcutsData.map(
				(item: SearchableShortcut) => ({
					...item,
					keyStrings: stringifyKeys(item.shortcut.keys.default),
				}),
			);

			setShortcuts(enrichedShortcuts);
			setMetadata(metadataData);
		} catch (error) {
			console.error("Failed to save shortcut:", error);
		}
	};

	const handleDelete = async (shortcut: SearchableShortcut) => {
		try {
			const toolNameKebab = shortcut.tool;

			await fetch(`/api/shortcuts/${toolNameKebab}/${shortcut.shortcut.id}`, {
				method: "DELETE",
			});

			// Remove from local state
			setShortcuts((prev) =>
				prev.filter((s) => s.shortcut.id !== shortcut.shortcut.id),
			);
		} catch (error) {
			console.error("Failed to delete shortcut:", error);
		}
	};

	// Get unique tools for the dialog
	const uniqueTools = Array.from(
		new Map(shortcuts.map((s) => [s.toolInfo.name, s.toolInfo])).values(),
	);

	if (loading) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-[var(--color-background-primary)]">
				<div className="space-y-2 text-center">
					<div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-current border-r-transparent border-solid motion-reduce:animate-[spin_1.5s_linear_infinite]" />
					<p className="text-[var(--color-foreground-secondary)]">
						Loading shortcuts...
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-[var(--color-background-primary)] transition-theme">
			{/* Header */}
			<header
				className={cn(
					"sticky top-0 z-10",
					"border-[var(--color-border-primary)] border-b",
					"bg-[var(--color-background-primary)]/95",
					"backdrop-blur supports-[backdrop-filter]:bg-[var(--color-background-primary)]/60",
				)}
			>
				<div className="container mx-auto px-4">
					<div className="flex h-16 items-center justify-between gap-4">
						<h1 className="shrink-0 font-semibold text-[var(--color-foreground-primary)] text-xl">
							Keyboard Shortcuts
						</h1>
						<div className="flex max-w-2xl flex-1 items-center gap-2">
							<SearchBar
								value={filters.query || ""}
								onChange={(query) => setFilters((prev) => ({ ...prev, query }))}
								className="flex-1"
							/>
							<KeyboardCapture
								value={filters.capturedKeys}
								onCapture={(keys) =>
									setFilters((prev) => ({ ...prev, capturedKeys: keys }))
								}
								onClear={() =>
									setFilters((prev) => ({ ...prev, capturedKeys: "" }))
								}
							/>
						</div>
						<div className="flex items-center gap-2">
							<button
								type="button"
								onClick={handleCreate}
								className={cn(
									"inline-flex items-center gap-2",
									"px-3 py-1.5",
									"rounded-md",
									"font-medium text-sm",
									"bg-[var(--color-state-selected)]",
									"text-[var(--color-foreground-primary)]",
									"hover:opacity-90",
									"transition-opacity",
								)}
							>
								<Plus className="h-4 w-4" />
								<span className="hidden sm:inline">Add Shortcut</span>
							</button>
							<HeaderMenu />
						</div>
					</div>
				</div>
			</header>

			{/* Main Content */}
			<div className="container mx-auto px-4 py-8">
				<div className="flex gap-8">
					{/* Sidebar */}
					<FilterSidebar
						tools={toolsWithCounts}
						categories={categoriesWithCounts}
						selectedTools={filters.tools || []}
						selectedCategories={filters.categories || []}
						onToolToggle={handleToolToggle}
						onCategoryToggle={handleCategoryToggle}
						onClearAll={handleClearFilters}
						className={cn(
							"hidden w-64 shrink-0 lg:block",
							"sticky top-24 h-[calc(100vh-8rem)] overflow-y-auto",
						)}
					/>

					{/* Shortcuts Grid */}
					<main className="flex-1">
						<ShortcutsList
							shortcuts={filteredShortcuts}
							categories={metadata.categories}
							onToolClick={handleToolClick}
							onCategoryClick={handleCategoryClick}
							onEdit={handleEdit}
							onDelete={handleDelete}
						/>
					</main>
				</div>
			</div>

			{/* Shortcut Dialog */}
			<ShortcutDialog
				isOpen={dialogOpen}
				onClose={() => setDialogOpen(false)}
				onSave={handleSave}
				onDelete={
					dialogMode === "edit" && editingShortcut
						? (shortcut: Shortcut, toolName: string) => handleDelete(editingShortcut)
						: undefined
				}
				onCreateTool={handleCreateTool}
				onCreateCategory={handleCreateCategory}
				shortcut={editingShortcut?.shortcut}
				tool={editingShortcut?.toolInfo}
				tools={uniqueTools}
				categories={metadata.categories}
				mode={dialogMode}
			/>
		</div>
	);
}

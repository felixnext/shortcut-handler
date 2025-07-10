"use client";

import { Plus, Save, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "~/lib/utils";
import type { Category, Key, Shortcut, Tool } from "~/types/shortcuts";
import { KeyCaptureInput } from "./KeyCaptureInput";
import { NewCategoryDialog } from "./NewCategoryDialog";
import { NewToolDialog } from "./NewToolDialog";

interface ShortcutDialogProps {
	isOpen: boolean;
	onClose: () => void;
	onSave: (shortcut: Shortcut, toolName: string) => void;
	onDelete?: (shortcut: Shortcut, toolName: string) => void;
	onCreateTool?: (tool: Tool) => void;
	onCreateCategory?: (category: Category) => void;
	shortcut?: Shortcut;
	tool?: Tool;
	tools: Tool[];
	categories: { id: string; name: string }[];
	mode: "create" | "edit";
}

export function ShortcutDialog({
	isOpen,
	onClose,
	onSave,
	onDelete,
	onCreateTool,
	onCreateCategory,
	shortcut,
	tool,
	tools,
	categories,
	mode,
}: ShortcutDialogProps) {
	const [formData, setFormData] = useState<{
		id: string;
		name: string;
		description: string;
		category: string;
		toolName: string;
		keysInput: string;
		configFile: string;
	}>({
		id: "",
		name: "",
		description: "",
		category: "",
		toolName: "",
		keysInput: "",
		configFile: "",
	});

	const [showNewToolDialog, setShowNewToolDialog] = useState(false);
	const [showNewCategoryDialog, setShowNewCategoryDialog] = useState(false);

	// Initialize form data when dialog opens
	useEffect(() => {
		if (isOpen) {
			if (mode === "edit" && shortcut && tool) {
				// Convert keys to string format for editing
				const keysString = shortcut.keys.default
					.map((combo) => combo.map((k) => k.key).join("+"))
					.join(", ");

				setFormData({
					id: shortcut.id,
					name: shortcut.name,
					description: shortcut.description || "",
					category: shortcut.category,
					toolName: tool.name,
					keysInput: keysString,
					configFile: shortcut.configFile || "",
				});
			} else {
				// Reset for create mode
				setFormData({
					id: "",
					name: "",
					description: "",
					category: categories[0]?.id || "",
					toolName: tools[0]?.name || "",
					keysInput: "",
					configFile: "",
				});
			}
		}
	}, [isOpen, mode, shortcut, tool, tools, categories]);

	// Parse keys input string into Key[][] format
	const parseKeysInput = (input: string): Key[][] => {
		if (!input.trim()) return [];

		return input.split(",").map((sequence) => {
			const keys = sequence
				.trim()
				.split("+")
				.map((keyStr) => {
					const key = keyStr.trim();
					const isModifier = [
						"cmd",
						"ctrl",
						"alt",
						"shift",
						"option",
						"meta",
					].includes(key.toLowerCase());
					// Detect if it's a command (starts with : or contains spaces)
					const isCommand = key.startsWith(":") || key.includes(" ");

					return {
						key,
						isModifier,
						type: isCommand ? "command" : "key",
					} as Key;
				});

			return keys;
		});
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		const keys = parseKeysInput(formData.keysInput);

		const newShortcut: Shortcut = {
			id: formData.id || `${formData.toolName}-${Date.now()}`,
			name: formData.name,
			description: formData.description || undefined,
			category: formData.category,
			keys: {
				default: keys,
			},
			configFile: formData.configFile || undefined,
		};

		onSave(newShortcut, formData.toolName);
		onClose();
	};

	const handleDelete = () => {
		if (shortcut && tool && onDelete) {
			if (confirm(`Delete shortcut "${shortcut.name}"?`)) {
				onDelete(shortcut, tool.name);
				onClose();
			}
		}
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
			{/* Backdrop */}
			<div
				className="absolute inset-0 bg-black/50 backdrop-blur-sm"
				onClick={onClose}
			/>

			{/* Dialog */}
			<div
				className={cn(
					"relative z-10 w-full max-w-2xl",
					"rounded-lg",
					"bg-[var(--color-background-secondary)]",
					"border border-[var(--color-border-primary)]",
					"shadow-xl",
				)}
			>
				{/* Header */}
				<div className="flex items-center justify-between border-[var(--color-border-primary)] border-b p-4">
					<h2 className="font-semibold text-[var(--color-foreground-primary)] text-lg">
						{mode === "create" ? "Create New Shortcut" : "Edit Shortcut"}
					</h2>
					<button
						type="button"
						onClick={onClose}
						className={cn(
							"rounded p-1",
							"text-[var(--color-foreground-tertiary)]",
							"hover:text-[var(--color-foreground-primary)]",
							"hover:bg-[var(--color-state-hover)]",
							"transition-colors",
						)}
					>
						<X className="h-5 w-5" />
					</button>
				</div>

				{/* Form */}
				<form onSubmit={handleSubmit} className="p-4">
					<div className="space-y-4">
						{/* Tool Selection (only for create mode) */}
						{mode === "create" && (
							<div>
								<label className="mb-2 block font-medium text-[var(--color-foreground-primary)] text-sm">
									Tool
								</label>
								<div className="flex gap-2">
									<select
										value={formData.toolName}
										onChange={(e) =>
											setFormData({ ...formData, toolName: e.target.value })
										}
										className={cn(
											"flex-1 rounded-md px-3 py-2",
											"bg-[var(--color-background-primary)]",
											"border border-[var(--color-border-primary)]",
											"text-[var(--color-foreground-primary)]",
											"focus:border-[var(--color-border-focus)]",
											"focus:outline-none focus:ring-2 focus:ring-[var(--color-border-focus)]/20",
										)}
										required
									>
										{tools.map((t) => (
											<option key={t.name} value={t.name}>
												{t.name}
											</option>
										))}
									</select>
									<button
										type="button"
										onClick={() => setShowNewToolDialog(true)}
										className={cn(
											"inline-flex items-center gap-2",
											"px-3 py-2",
											"rounded-md",
											"font-medium text-sm",
											"bg-[var(--color-background-tertiary)]",
											"text-[var(--color-foreground-secondary)]",
											"hover:bg-[var(--color-state-hover)]",
											"hover:text-[var(--color-foreground-primary)]",
											"border border-[var(--color-border-primary)]",
											"transition-colors",
										)}
									>
										<Plus className="h-4 w-4" />
										New
									</button>
								</div>
							</div>
						)}

						{/* Name */}
						<div>
							<label className="mb-2 block font-medium text-[var(--color-foreground-primary)] text-sm">
								Name
							</label>
							<input
								type="text"
								value={formData.name}
								onChange={(e) =>
									setFormData({ ...formData, name: e.target.value })
								}
								className={cn(
									"w-full rounded-md px-3 py-2",
									"bg-[var(--color-background-primary)]",
									"border border-[var(--color-border-primary)]",
									"text-[var(--color-foreground-primary)]",
									"placeholder:text-[var(--color-foreground-tertiary)]",
									"focus:border-[var(--color-border-focus)]",
									"focus:outline-none focus:ring-2 focus:ring-[var(--color-border-focus)]/20",
								)}
								placeholder="e.g., Save file"
								required
							/>
						</div>

						{/* Keys */}
						<div>
							<label className="mb-2 block font-medium text-[var(--color-foreground-primary)] text-sm">
								Keys
							</label>
							<KeyCaptureInput
								value={formData.keysInput}
								onChange={(value) =>
									setFormData({ ...formData, keysInput: value })
								}
								placeholder="e.g., cmd+s or :w (separate sequences with comma)"
							/>
							<p className="mt-1 text-[var(--color-foreground-tertiary)] text-xs">
								Use + for combinations (cmd+s), comma for sequences (g+g, g+t)
							</p>
						</div>

						{/* Category */}
						<div>
							<label className="mb-2 block font-medium text-[var(--color-foreground-primary)] text-sm">
								Category
							</label>
							<div className="flex gap-2">
								<select
									value={formData.category}
									onChange={(e) =>
										setFormData({ ...formData, category: e.target.value })
									}
									className={cn(
										"flex-1 rounded-md px-3 py-2",
										"bg-[var(--color-background-primary)]",
										"border border-[var(--color-border-primary)]",
										"text-[var(--color-foreground-primary)]",
										"focus:border-[var(--color-border-focus)]",
										"focus:outline-none focus:ring-2 focus:ring-[var(--color-border-focus)]/20",
									)}
									required
								>
									{categories.map((cat) => (
										<option key={cat.id} value={cat.id}>
											{cat.name}
										</option>
									))}
								</select>
								<button
									type="button"
									onClick={() => setShowNewCategoryDialog(true)}
									className={cn(
										"inline-flex items-center gap-2",
										"px-3 py-2",
										"rounded-md",
										"font-medium text-sm",
										"bg-[var(--color-background-tertiary)]",
										"text-[var(--color-foreground-secondary)]",
										"hover:bg-[var(--color-state-hover)]",
										"hover:text-[var(--color-foreground-primary)]",
										"border border-[var(--color-border-primary)]",
										"transition-colors",
									)}
								>
									<Plus className="h-4 w-4" />
									New
								</button>
							</div>
						</div>

						{/* Description (optional) */}
						<div>
							<label className="mb-2 block font-medium text-[var(--color-foreground-primary)] text-sm">
								Description (optional)
							</label>
							<textarea
								value={formData.description}
								onChange={(e) =>
									setFormData({ ...formData, description: e.target.value })
								}
								className={cn(
									"w-full rounded-md px-3 py-2",
									"bg-[var(--color-background-primary)]",
									"border border-[var(--color-border-primary)]",
									"text-[var(--color-foreground-primary)]",
									"placeholder:text-[var(--color-foreground-tertiary)]",
									"focus:border-[var(--color-border-focus)]",
									"focus:outline-none focus:ring-2 focus:ring-[var(--color-border-focus)]/20",
									"resize-none",
								)}
								rows={3}
								placeholder="Additional information about this shortcut"
							/>
						</div>

						{/* Config File (optional) */}
						<div>
							<label className="mb-2 block font-medium text-[var(--color-foreground-primary)] text-sm">
								Config File (optional)
							</label>
							<input
								type="text"
								value={formData.configFile}
								onChange={(e) =>
									setFormData({ ...formData, configFile: e.target.value })
								}
								className={cn(
									"w-full rounded-md px-3 py-2",
									"bg-[var(--color-background-primary)]",
									"border border-[var(--color-border-primary)]",
									"text-[var(--color-foreground-primary)]",
									"placeholder:text-[var(--color-foreground-tertiary)]",
									"focus:border-[var(--color-border-focus)]",
									"focus:outline-none focus:ring-2 focus:ring-[var(--color-border-focus)]/20",
								)}
								placeholder="e.g., ~/.vimrc"
							/>
						</div>
					</div>

					{/* Actions */}
					<div className="mt-6 flex items-center justify-between">
						<div>
							{mode === "edit" && onDelete && (
								<button
									type="button"
									onClick={handleDelete}
									className={cn(
										"inline-flex items-center gap-2",
										"px-4 py-2",
										"rounded-md",
										"font-medium text-sm",
										"text-[var(--color-state-error)]",
										"hover:bg-[var(--color-state-errorLight)]",
										"transition-colors",
									)}
								>
									<Trash2 className="h-4 w-4" />
									Delete
								</button>
							)}
						</div>
						<div className="flex items-center gap-2">
							<button
								type="button"
								onClick={onClose}
								className={cn(
									"px-4 py-2",
									"rounded-md",
									"font-medium text-sm",
									"text-[var(--color-foreground-secondary)]",
									"hover:bg-[var(--color-state-hover)]",
									"transition-colors",
								)}
							>
								Cancel
							</button>
							<button
								type="submit"
								className={cn(
									"inline-flex items-center gap-2",
									"px-4 py-2",
									"rounded-md",
									"font-medium text-sm",
									"bg-[var(--color-state-selected)]",
									"text-[var(--color-foreground-primary)]",
									"hover:opacity-90",
									"transition-opacity",
								)}
							>
								{mode === "create" ? (
									<>
										<Plus className="h-4 w-4" />
										Create
									</>
								) : (
									<>
										<Save className="h-4 w-4" />
										Save
									</>
								)}
							</button>
						</div>
					</div>
				</form>
			</div>

			{/* Sub-dialogs */}
			<NewToolDialog
				isOpen={showNewToolDialog}
				onClose={() => setShowNewToolDialog(false)}
				onSave={(newTool) => {
					if (onCreateTool) {
						onCreateTool(newTool);
						// Update the form with the new tool
						setFormData({ ...formData, toolName: newTool.name });
					}
					setShowNewToolDialog(false);
				}}
			/>

			<NewCategoryDialog
				isOpen={showNewCategoryDialog}
				onClose={() => setShowNewCategoryDialog(false)}
				onSave={(newCategory) => {
					if (onCreateCategory) {
						onCreateCategory(newCategory);
						// Update the form with the new category
						setFormData({ ...formData, category: newCategory.id });
					}
					setShowNewCategoryDialog(false);
				}}
			/>
		</div>
	);
}

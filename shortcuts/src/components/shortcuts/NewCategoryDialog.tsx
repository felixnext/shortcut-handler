"use client";

import { Plus, X } from "lucide-react";
import { useState } from "react";
import { cn } from "~/lib/utils";
import type { Category } from "~/types/shortcuts";

interface NewCategoryDialogProps {
	isOpen: boolean;
	onClose: () => void;
	onSave: (category: Category) => void;
}

export function NewCategoryDialog({
	isOpen,
	onClose,
	onSave,
}: NewCategoryDialogProps) {
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		const newCategory: Category = {
			id: name.toLowerCase().replace(/\s+/g, "-"),
			name,
			description: description || undefined,
		};

		onSave(newCategory);

		// Reset form
		setName("");
		setDescription("");
		onClose();
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
					"relative z-10 w-full max-w-md",
					"rounded-lg",
					"bg-[var(--color-background-secondary)]",
					"border border-[var(--color-border-primary)]",
					"shadow-xl",
				)}
			>
				{/* Header */}
				<div className="flex items-center justify-between border-[var(--color-border-primary)] border-b p-4">
					<h2 className="font-semibold text-[var(--color-foreground-primary)] text-lg">
						Create New Category
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
						{/* Name */}
						<div>
							<label className="mb-2 block font-medium text-[var(--color-foreground-primary)] text-sm">
								Name
							</label>
							<input
								type="text"
								value={name}
								onChange={(e) => setName(e.target.value)}
								className={cn(
									"w-full rounded-md px-3 py-2",
									"bg-[var(--color-background-primary)]",
									"border border-[var(--color-border-primary)]",
									"text-[var(--color-foreground-primary)]",
									"placeholder:text-[var(--color-foreground-tertiary)]",
									"focus:border-[var(--color-border-focus)]",
									"focus:outline-none focus:ring-2 focus:ring-[var(--color-border-focus)]/20",
								)}
								placeholder="e.g., Text Manipulation"
								required
								autoFocus
							/>
						</div>

						{/* Description (optional) */}
						<div>
							<label className="mb-2 block font-medium text-[var(--color-foreground-primary)] text-sm">
								Description (optional)
							</label>
							<textarea
								value={description}
								onChange={(e) => setDescription(e.target.value)}
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
								rows={2}
								placeholder="Brief description of this category"
							/>
						</div>
					</div>

					{/* Actions */}
					<div className="mt-6 flex items-center justify-end gap-2">
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
							<Plus className="h-4 w-4" />
							Create Category
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}

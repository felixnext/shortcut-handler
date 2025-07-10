"use client";

import { Download, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { cn } from "~/lib/utils";

interface ExportImportProps {
	onImportComplete?: () => void;
}

export function ExportImport({ onImportComplete }: ExportImportProps) {
	const [importing, setImporting] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleExport = async () => {
		try {
			const response = await fetch("/api/export");
			if (!response.ok) {
				throw new Error("Export failed");
			}

			// Get the filename from the Content-Disposition header
			const contentDisposition = response.headers.get("Content-Disposition");
			const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
			const filename = filenameMatch?.[1] || "shortcuts-backup.json";

			// Download the file
			const blob = await response.blob();
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = filename;
			document.body.appendChild(a);
			a.click();
			window.URL.revokeObjectURL(url);
			document.body.removeChild(a);
		} catch (error) {
			console.error("Export error:", error);
			alert("Failed to export shortcuts");
		}
	};

	const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) return;

		setImporting(true);
		try {
			// Read file content
			const text = await file.text();
			const data = JSON.parse(text);

			// Send to import API
			const response = await fetch("/api/import", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(data),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Import failed");
			}

			const result = await response.json();
			alert(result.message || "Import successful!");

			// Reload the page to show new data
			if (onImportComplete) {
				onImportComplete();
			} else {
				window.location.reload();
			}
		} catch (error) {
			console.error("Import error:", error);
			alert(
				error instanceof Error ? error.message : "Failed to import shortcuts",
			);
		} finally {
			setImporting(false);
			// Reset file input
			if (fileInputRef.current) {
				fileInputRef.current.value = "";
			}
		}
	};

	return (
		<div className="flex items-center gap-2">
			<button
				type="button"
				onClick={handleExport}
				className={cn(
					"inline-flex items-center gap-2",
					"px-3 py-1.5",
					"rounded-md",
					"font-medium text-sm",
					"bg-[var(--color-background-tertiary)]",
					"text-[var(--color-foreground-secondary)]",
					"hover:bg-[var(--color-state-hover)]",
					"hover:text-[var(--color-foreground-primary)]",
					"transition-colors",
				)}
				title="Export all shortcuts"
			>
				<Download className="h-4 w-4" />
				<span className="hidden sm:inline">Export</span>
			</button>

			<label
				className={cn(
					"inline-flex items-center gap-2",
					"px-3 py-1.5",
					"rounded-md",
					"font-medium text-sm",
					"bg-[var(--color-background-tertiary)]",
					"text-[var(--color-foreground-secondary)]",
					"hover:bg-[var(--color-state-hover)]",
					"hover:text-[var(--color-foreground-primary)]",
					"transition-colors",
					"cursor-pointer",
					importing && "cursor-not-allowed opacity-50",
				)}
				title="Import shortcuts from backup"
			>
				<Upload className="h-4 w-4" />
				<span className="hidden sm:inline">
					{importing ? "Importing..." : "Import"}
				</span>
				<input
					ref={fileInputRef}
					type="file"
					accept=".json"
					onChange={handleImport}
					disabled={importing}
					className="sr-only"
				/>
			</label>
		</div>
	);
}

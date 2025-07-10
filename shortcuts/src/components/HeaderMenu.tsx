"use client";

import {
	CloudMoon,
	Download,
	Monitor,
	Moon,
	MoreVertical,
	Sun,
	Sunrise,
	Upload,
} from "lucide-react";
import { useRef, useState } from "react";
import { useTheme } from "~/contexts/ThemeContext";
import type { ThemeMode } from "~/design-system";
import { detectPlatform } from "~/lib/shortcut-utils";
import { cn } from "~/lib/utils";

type Platform = "mac" | "windows" | "linux";

interface HeaderMenuProps {
	onImportComplete?: () => void;
}

export function HeaderMenu({ onImportComplete }: HeaderMenuProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [importing, setImporting] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const { themeMode, setThemeMode } = useTheme();
	const [platform, setPlatform] = useState<Platform>(() => {
		if (typeof window === "undefined") return "mac";
		const saved = localStorage.getItem("preferredPlatform");
		if (saved && ["mac", "windows", "linux"].includes(saved)) {
			return saved as Platform;
		}
		return detectPlatform();
	});

	const handleExport = async () => {
		try {
			const response = await fetch("/api/export");
			if (!response.ok) {
				throw new Error("Export failed");
			}

			const contentDisposition = response.headers.get("Content-Disposition");
			const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
			const filename = filenameMatch?.[1] || "shortcuts-backup.json";

			const blob = await response.blob();
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = filename;
			document.body.appendChild(a);
			a.click();
			window.URL.revokeObjectURL(url);
			document.body.removeChild(a);
			setIsOpen(false);
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
			const text = await file.text();
			const data = JSON.parse(text);

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
			if (fileInputRef.current) {
				fileInputRef.current.value = "";
			}
			setIsOpen(false);
		}
	};

	const handlePlatformChange = (newPlatform: Platform) => {
		setPlatform(newPlatform);
		localStorage.setItem("preferredPlatform", newPlatform);
		window.location.reload();
	};

	const themes: { value: ThemeMode; label: string; icon: React.ReactNode }[] = [
		{ value: "light", label: "Light", icon: <Sun className="h-4 w-4" /> },
		{ value: "dark", label: "Dark", icon: <Moon className="h-4 w-4" /> },
		{
			value: "midnight",
			label: "Midnight",
			icon: <CloudMoon className="h-4 w-4" />,
		},
		{
			value: "sunset",
			label: "Sunset",
			icon: <Sunrise className="h-4 w-4" />,
		},
	];

	const platforms = [
		{ value: "mac" as Platform, label: "macOS" },
		{ value: "windows" as Platform, label: "Windows" },
		{ value: "linux" as Platform, label: "Linux" },
	];

	return (
		<div className="relative">
			<button
				type="button"
				onClick={() => setIsOpen(!isOpen)}
				className={cn(
					"inline-flex items-center justify-center",
					"p-2",
					"rounded-md",
					"text-[var(--color-foreground-secondary)]",
					"hover:bg-[var(--color-state-hover)]",
					"hover:text-[var(--color-foreground-primary)]",
					"transition-colors",
				)}
				aria-label="Menu"
			>
				<MoreVertical className="h-5 w-5" />
			</button>

			{isOpen && (
				<>
					<div
						className="fixed inset-0 z-10"
						onClick={() => setIsOpen(false)}
					/>
					<div
						className={cn(
							"absolute top-full right-0 z-20 mt-1",
							"min-w-[200px]",
							"rounded-md",
							"bg-[var(--color-background-secondary)]",
							"border border-[var(--color-border-primary)]",
							"shadow-lg",
							"py-1",
						)}
					>
						{/* Import/Export Section */}
						<div className="mb-1 border-[var(--color-border-primary)] border-b pb-1">
							<button
								type="button"
								onClick={handleExport}
								className={cn(
									"w-full px-3 py-2",
									"flex items-center gap-3",
									"text-sm",
									"text-[var(--color-foreground-secondary)]",
									"hover:bg-[var(--color-state-hover)]",
									"hover:text-[var(--color-foreground-primary)]",
									"transition-colors",
								)}
							>
								<Download className="h-4 w-4" />
								Export Shortcuts
							</button>

							<label
								className={cn(
									"w-full px-3 py-2",
									"flex items-center gap-3",
									"text-sm",
									"text-[var(--color-foreground-secondary)]",
									"hover:bg-[var(--color-state-hover)]",
									"hover:text-[var(--color-foreground-primary)]",
									"transition-colors",
									"cursor-pointer",
									importing && "cursor-not-allowed opacity-50",
								)}
							>
								<Upload className="h-4 w-4" />
								{importing ? "Importing..." : "Import Shortcuts"}
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

						{/* Theme Section */}
						<div className="mb-1 border-[var(--color-border-primary)] border-b pb-1">
							<div className="px-3 py-1.5 font-medium text-[var(--color-foreground-tertiary)] text-xs">
								Theme
							</div>
							{themes.map(({ value, label, icon }) => (
								<button
									key={value}
									type="button"
									onClick={() => {
										setThemeMode(value);
										setIsOpen(false);
									}}
									className={cn(
										"w-full px-3 py-2",
										"flex items-center gap-3",
										"text-sm",
										"transition-colors",
										"hover:bg-[var(--color-state-hover)]",
										themeMode === value
											? "font-medium text-[var(--color-state-selected)]"
											: "text-[var(--color-foreground-secondary)]",
									)}
								>
									{icon}
									{label}
									{themeMode === value && (
										<span className="ml-auto text-xs">✓</span>
									)}
								</button>
							))}
						</div>

						{/* Platform Section */}
						<div>
							<div className="px-3 py-1.5 font-medium text-[var(--color-foreground-tertiary)] text-xs">
								Platform Keys
							</div>
							{platforms.map(({ value, label }) => (
								<button
									key={value}
									type="button"
									onClick={() => handlePlatformChange(value)}
									className={cn(
										"w-full px-3 py-2",
										"flex items-center gap-3",
										"text-sm",
										"transition-colors",
										"hover:bg-[var(--color-state-hover)]",
										platform === value
											? "font-medium text-[var(--color-state-selected)]"
											: "text-[var(--color-foreground-secondary)]",
									)}
								>
									<Monitor className="h-4 w-4" />
									{label}
									{platform === value && (
										<span className="ml-auto text-xs">✓</span>
									)}
								</button>
							))}
						</div>
					</div>
				</>
			)}
		</div>
	);
}

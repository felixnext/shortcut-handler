"use client";

import { Keyboard, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "~/lib/utils";
import type { Key } from "~/types/shortcuts";

interface KeyboardCaptureProps {
	value?: string;
	onCapture: (keys: string) => void;
	onClear?: () => void;
	className?: string;
}

export function KeyboardCapture({
	value,
	onCapture,
	onClear,
	className,
}: KeyboardCaptureProps) {
	const [isCapturing, setIsCapturing] = useState(false);
	const [capturedKeys, setCapturedKeys] = useState<string[]>([]);
	const timeoutRef = useRef<NodeJS.Timeout>();

	// Convert key event to display string
	const keyEventToString = useCallback((e: KeyboardEvent): string | null => {
		const parts: string[] = [];

		// Add modifiers in consistent order
		if (e.metaKey) parts.push("cmd");
		if (e.ctrlKey && !e.metaKey) parts.push("ctrl");
		if (e.altKey) parts.push("alt");
		if (e.shiftKey) parts.push("shift");

		// Add the main key (but not Enter, which is used to trigger search)
		if (
			e.key &&
			!["Control", "Alt", "Shift", "Meta", "Enter"].includes(e.key)
		) {
			// Normalize key names
			let key = e.key;
			if (key === " ") key = "space";
			else if (key === "ArrowUp") key = "up";
			else if (key === "ArrowDown") key = "down";
			else if (key === "ArrowLeft") key = "left";
			else if (key === "ArrowRight") key = "right";
			else if (key.length === 1) key = key.toLowerCase();

			parts.push(key);
		}

		// Return null if only modifiers were pressed
		if (parts.every((p) => ["cmd", "ctrl", "alt", "shift"].includes(p))) {
			return null;
		}

		return parts.join("+");
	}, []);

	// Handle key capture
	const handleKeyDown = useCallback(
		(e: KeyboardEvent) => {
			if (!isCapturing) return;

			// Prevent default for most keys except Escape
			if (e.key !== "Escape") {
				e.preventDefault();
				e.stopPropagation();
			}

			// Stop capturing on Escape
			if (e.key === "Escape") {
				setIsCapturing(false);
				setCapturedKeys([]);
				return;
			}

			// Trigger search on Enter
			if (e.key === "Enter") {
				if (capturedKeys.length > 0) {
					const searchQuery = capturedKeys.join(" ");
					onCapture(searchQuery);
					setIsCapturing(false);
					setCapturedKeys([]);
				}
				return;
			}

			const keyString = keyEventToString(e);
			if (keyString) {
				setCapturedKeys((prev) => [...prev, keyString]);

				// Clear previous timeout
				if (timeoutRef.current) {
					clearTimeout(timeoutRef.current);
				}

				// Set new timeout to trigger search after 1500ms of no input
				timeoutRef.current = setTimeout(() => {
					if (capturedKeys.length > 0 || keyString) {
						const searchQuery = [...capturedKeys, keyString].join(" ");
						onCapture(searchQuery);
						setIsCapturing(false);
						setCapturedKeys([]);
					}
				}, 1500);
			}
		},
		[isCapturing, capturedKeys, onCapture, keyEventToString],
	);

	// Set up event listeners
	useEffect(() => {
		if (isCapturing) {
			window.addEventListener("keydown", handleKeyDown, true);
			return () => {
				window.removeEventListener("keydown", handleKeyDown, true);
				if (timeoutRef.current) {
					clearTimeout(timeoutRef.current);
				}
			};
		}
	}, [isCapturing, handleKeyDown]);

	// Start capturing
	const startCapture = () => {
		setIsCapturing(true);
		setCapturedKeys([]);
	};

	// Stop capturing
	const stopCapture = () => {
		setIsCapturing(false);
		setCapturedKeys([]);
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
		}
	};

	// Clear captured value
	const handleClear = () => {
		onClear?.();
	};

	// Show captured value if exists
	if (value && !isCapturing) {
		return (
			<div
				className={cn(
					"inline-flex items-center gap-2",
					"px-3 py-1.5",
					"rounded-md",
					"font-medium text-sm",
					"bg-[var(--color-state-selected)]",
					"text-[var(--color-foreground-primary)]",
					"border border-[var(--color-border-focus)]",
					className,
				)}
			>
				<Keyboard className="h-4 w-4" />
				<span className="hidden sm:inline">{value}</span>
				<button
					type="button"
					onClick={handleClear}
					className={cn(
						"-mr-1 ml-1",
						"rounded p-0.5",
						"hover:bg-[var(--color-state-hover)]",
						"transition-colors",
					)}
					title="Clear captured keys"
				>
					<X className="h-3.5 w-3.5" />
				</button>
			</div>
		);
	}

	return (
		<div className={cn("relative", className)}>
			{!isCapturing ? (
				<button
					type="button"
					onClick={startCapture}
					className={cn(
						"inline-flex items-center gap-2",
						"px-3 py-1.5",
						"rounded-md",
						"font-medium text-sm",
						"transition-colors",
						"bg-[var(--color-background-tertiary)]",
						"text-[var(--color-foreground-secondary)]",
						"hover:bg-[var(--color-state-hover)]",
						"hover:text-[var(--color-foreground-primary)]",
						"border border-[var(--color-border-primary)]",
					)}
					title="Capture keyboard shortcut"
				>
					<Keyboard className="h-4 w-4" />
					<span className="hidden sm:inline">Capture Keys</span>
				</button>
			) : (
				<div
					className={cn(
						"inline-flex items-center gap-2",
						"px-3 py-1.5",
						"rounded-md",
						"font-medium text-sm",
						"bg-[var(--color-state-focus)]",
						"text-[var(--color-foreground-primary)]",
						"border-2 border-[var(--color-border-focus)]",
						"animate-pulse",
					)}
				>
					<Keyboard className="h-4 w-4" />
					<span className="hidden sm:inline">
						{capturedKeys.length > 0
							? capturedKeys.join(" → ")
							: "Press keys..."}
					</span>
					{capturedKeys.length > 0 && (
						<span className="text-xs opacity-70">(Enter to search)</span>
					)}
					<button
						type="button"
						onClick={stopCapture}
						className={cn(
							"-mr-1 ml-1",
							"rounded p-0.5",
							"hover:bg-[var(--color-state-hover)]",
							"transition-colors",
						)}
						title="Cancel capture"
					>
						<X className="h-3.5 w-3.5" />
					</button>
				</div>
			)}
		</div>
	);
}

"use client";

import { Keyboard, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "~/lib/utils";

interface KeyCaptureInputProps {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	className?: string;
}

export function KeyCaptureInput({
	value,
	onChange,
	placeholder,
	className,
}: KeyCaptureInputProps) {
	const [isCapturing, setIsCapturing] = useState(false);
	const [capturedKeys, setCapturedKeys] = useState<string[]>([]);
	const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

	// Convert key event to display string
	const keyEventToString = useCallback((e: KeyboardEvent): string | null => {
		const parts: string[] = [];

		// Add modifiers in consistent order
		if (e.metaKey) parts.push("cmd");
		if (e.ctrlKey && !e.metaKey) parts.push("ctrl");
		if (e.altKey) parts.push("alt");
		if (e.shiftKey) parts.push("shift");

		// Add the main key (but not Enter, which is used to finish)
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

			// Finish on Enter
			if (e.key === "Enter") {
				if (capturedKeys.length > 0) {
					const newValue = value
						? `${value}, ${capturedKeys.join(", ")}`
						: capturedKeys.join(", ");
					onChange(newValue);
					setIsCapturing(false);
					setCapturedKeys([]);
				}
				return;
			}

			const keyString = keyEventToString(e);
			if (keyString) {
				setCapturedKeys((prev) => [...prev, keyString]);
			}
		},
		[isCapturing, capturedKeys, value, onChange, keyEventToString],
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

	return (
		<div className={cn("relative", className)}>
			<div className="flex gap-2">
				<input
					type="text"
					value={value}
					onChange={(e) => onChange(e.target.value)}
					className={cn(
						"flex-1 rounded-md px-3 py-2",
						"bg-[var(--color-background-primary)]",
						"border border-[var(--color-border-primary)]",
						"text-[var(--color-foreground-primary)]",
						"placeholder:text-[var(--color-foreground-tertiary)]",
						"focus:border-[var(--color-border-focus)]",
						"focus:outline-none focus:ring-2 focus:ring-[var(--color-border-focus)]/20",
					)}
					placeholder={placeholder}
					disabled={isCapturing}
				/>
				<button
					type="button"
					onClick={() => setIsCapturing(true)}
					disabled={isCapturing}
					className={cn(
						"inline-flex items-center gap-2",
						"px-3 py-2",
						"rounded-md",
						"font-medium text-sm",
						"transition-colors",
						isCapturing
							? [
									"bg-[var(--color-state-focus)]",
									"text-[var(--color-foreground-primary)]",
									"border-2 border-[var(--color-border-focus)]",
									"animate-pulse",
								]
							: [
									"bg-[var(--color-background-tertiary)]",
									"text-[var(--color-foreground-secondary)]",
									"hover:bg-[var(--color-state-hover)]",
									"hover:text-[var(--color-foreground-primary)]",
									"border border-[var(--color-border-primary)]",
								],
					)}
					title="Capture keys"
				>
					<Keyboard className="h-4 w-4" />
					<span className="hidden sm:inline">
						{isCapturing ? "Capturing..." : "Capture"}
					</span>
				</button>
			</div>
			{isCapturing && (
				<div className="absolute top-full z-10 mt-1 w-full">
					<div
						className={cn(
							"rounded-md p-3",
							"bg-[var(--color-background-inverse)]",
							"text-[var(--color-foreground-inverse)]",
							"text-sm",
							"shadow-lg",
						)}
					>
						<div className="flex items-center justify-between">
							<span>
								{capturedKeys.length > 0
									? `Captured: ${capturedKeys.join(", ")}`
									: "Press keys to capture..."}
							</span>
							<button
								type="button"
								onClick={() => {
									setIsCapturing(false);
									setCapturedKeys([]);
								}}
								className="ml-2 rounded p-1 hover:bg-white/20"
							>
								<X className="h-3 w-3" />
							</button>
						</div>
						<p className="mt-1 text-xs opacity-80">
							Press Enter to add • Escape to cancel
						</p>
					</div>
				</div>
			)}
		</div>
	);
}

import { Space, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Plus, Minus } from "lucide-react";
import { detectPlatform, normalizeModifierKey } from "~/lib/shortcut-utils";
import { cn } from "~/lib/utils";
import type { Key } from "~/types/shortcuts";

interface KeyPressProps {
	keyData: Key;
	className?: string;
	size?: "sm" | "md" | "lg";
}

export function KeyPress({ keyData, className, size = "md" }: KeyPressProps) {
	const platform = detectPlatform();
	
	// Handle escape sequences first
	let displayKey = keyData.key;
	let iconComponent = null;
	
	// Check for escape sequences and special icons
	switch (displayKey) {
		case "\\s":
		case "\\space":
			iconComponent = <Space className="w-4 h-4" />;
			displayKey = "";
			break;
		case "\\+":
		case "\\plus":
			iconComponent = <Plus className="w-4 h-4" />;
			displayKey = "";
			break;
		case "\\-":
		case "\\minus":
			iconComponent = <Minus className="w-4 h-4" />;
			displayKey = "";
			break;
		case "\\up":
		case "\\uparrow":
			iconComponent = <ArrowUp className="w-4 h-4" />;
			displayKey = "";
			break;
		case "\\down":
		case "\\downarrow":
			iconComponent = <ArrowDown className="w-4 h-4" />;
			displayKey = "";
			break;
		case "\\left":
		case "\\leftarrow":
			iconComponent = <ArrowLeft className="w-4 h-4" />;
			displayKey = "";
			break;
		case "\\right":
		case "\\rightarrow":
			iconComponent = <ArrowRight className="w-4 h-4" />;
			displayKey = "";
			break;
		case "\\,":
			displayKey = ",";
			break;
		case "\\\\":
			displayKey = "\\";
			break;
		default:
			if (keyData.isModifier) {
				displayKey = normalizeModifierKey(keyData.key, platform);
			}
	}
	
	const isSpaceBar = displayKey === "" && iconComponent?.type === Space;

	const sizeClasses = {
		sm: "px-2.5 py-1 text-xs min-w-[28px] h-7",
		md: "px-3.5 py-1.5 text-sm min-w-[36px] h-9",
		lg: "px-4.5 py-2 text-base min-w-[44px] h-11",
	};

	// Special styling for single character keys
	const isSingleChar = displayKey.length === 1;
	const isSpecialKey = ["⌘", "⌃", "⌥", "⇧", "⊞", "↵", "⇥", "⎋", "⌫", "⌦"].includes(displayKey) || iconComponent !== null;

	return (
		<kbd
			className={cn(
				"inline-flex items-center justify-center",
				"font-mono",
				keyData.isModifier || isSpecialKey ? "font-bold" : "font-semibold",
				"rounded-lg", // More rounded for modern look
				"relative", // For pseudo-element effects
				// Modern gradient background
				"bg-gradient-to-b from-gray-50 to-gray-100",
				"dark:from-gray-800 dark:to-gray-900",
				// Text color with better contrast
				"text-gray-800 dark:text-gray-100",
				// Modern border with subtle gradient
				"border border-gray-300 dark:border-gray-700",
				// Enhanced shadow for depth
				"shadow-[0_2px_4px_rgba(0,0,0,0.1),0_1px_2px_rgba(0,0,0,0.06)]",
				"dark:shadow-[0_2px_4px_rgba(0,0,0,0.3),0_1px_2px_rgba(0,0,0,0.2)]",
				// Hover state with glow effect
				"hover:shadow-[0_4px_8px_rgba(0,0,0,0.15),0_2px_4px_rgba(0,0,0,0.1)]",
				"dark:hover:shadow-[0_4px_8px_rgba(0,0,0,0.4),0_2px_4px_rgba(0,0,0,0.3)]",
				"hover:scale-105",
				"hover:border-gray-400 dark:hover:border-gray-600",
				// Smooth transitions
				"transition-all duration-200 ease-out",
				// Active state
				"active:scale-95 active:shadow-inner",
				sizeClasses[size],
				// Make single chars more square, space bar wider
				isSingleChar && !isSpecialKey ? "aspect-square" : "",
				isSpaceBar ? "min-w-[60px]" : "",
				className,
			)}
			style={{
				// Add inset shadow for 3D effect
				boxShadow: `
					inset 0 1px 0 0 rgba(255,255,255,0.1),
					inset 0 -1px 0 0 rgba(0,0,0,0.1),
					0 2px 4px rgba(0,0,0,0.1),
					0 1px 2px rgba(0,0,0,0.06)
				`,
			}}
		>
			{/* Shine effect overlay */}
			<div className="absolute inset-0 rounded-lg overflow-hidden pointer-events-none">
				<div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-60" />
			</div>
			
			<span
				className={cn(
					"relative z-10", // Above shine effect
					keyData.isModifier || isSpecialKey
						? "text-blue-600 dark:text-blue-400"
						: "",
					// Make modifier keys slightly larger
					keyData.isModifier && "text-[1.1em]",
				)}
			>
				{iconComponent || displayKey}
			</span>
		</kbd>
	);
}

import { Bookmark, Edit, Hash, Wrench as ToolIcon, Trash2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { getShortcutKeys } from "~/lib/shortcut-utils";
import { cn } from "~/lib/utils";
import type { Shortcut, Tool } from "~/types/shortcuts";
import { KeyVisualizer } from "./KeyVisualizer";

interface ShortcutCardProps {
	shortcut: Shortcut;
	tool: Tool;
	category?: string;
	isLearning?: boolean;
	onEdit?: () => void;
	onDelete?: () => void;
	onToggleLearning?: () => void;
	onToolClick?: (tool: string) => void;
	onCategoryClick?: (category: string) => void;
	className?: string;
}

export function ShortcutCard({
	shortcut,
	tool,
	category,
	isLearning,
	onEdit,
	onDelete,
	onToggleLearning,
	onToolClick,
	onCategoryClick,
	className,
}: ShortcutCardProps) {
	const keys = getShortcutKeys(shortcut);
	const [showTooltip, setShowTooltip] = useState(false);
	const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
	const cardRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (showTooltip && cardRef.current) {
			const rect = cardRef.current.getBoundingClientRect();
			const tooltipX = rect.left + rect.width / 2;
			const tooltipY = rect.bottom + 8; // 8px below the card
			
			setTooltipPosition({ x: tooltipX, y: tooltipY });
		}
	}, [showTooltip]);

	return (
		<>
			<div className={cn("relative", isLearning && "magical-learning-card")}>
				{/* Magical glowing border for learning items */}
				{isLearning && (
					<>
						{/* Animated gradient background */}
						<div className="absolute -inset-[1px] rounded-xl bg-gradient-to-r from-violet-600 via-pink-600 to-cyan-600 opacity-75 blur animate-gradient-xy" />
						{/* Pulsing glow effect */}
						<div className="absolute -inset-[2px] rounded-xl bg-gradient-to-r from-violet-600 via-pink-600 to-cyan-600 opacity-30 blur-md animate-pulse-glow" />
					</>
				)}
				<div
					ref={cardRef}
					className={cn(
						"group relative",
					"p-5", // Increased padding for breathing room
					"rounded-xl", // More modern rounded corners
					"transition-all duration-300 ease-out", // Smoother transitions
					"overflow-visible", // Allow tooltips to show outside
					"h-full flex flex-col", // Consistent height and vertical layout
					// Enhanced theme-aware colors with gradient border
					"bg-gradient-to-br from-[var(--color-card-background)] to-[var(--color-card-backgroundSecondary,var(--color-card-background))]",
					"border border-[var(--color-card-border)]",
					"hover:border-[var(--color-card-borderHover,var(--color-primary-border))]",
					"hover:shadow-xl hover:shadow-[var(--color-card-shadow,rgba(0,0,0,0.1))]",
					// Removed lift effect to prevent clipping
					// Modern backdrop blur support
					"backdrop-blur-sm",
					className,
				)}
				onMouseEnter={() => setShowTooltip(true)}
				onMouseLeave={() => setShowTooltip(false)}
			>
			{/* Header section with consistent spacing */}
			<div className="space-y-3 flex-1 flex flex-col">
				{/* Title and actions row */}
				<div className="flex items-start justify-between gap-2">
					<h3 className="font-medium text-[var(--color-foreground-primary)] text-base leading-tight">
						{shortcut.name}
					</h3>

					{/* Actions - always visible on mobile, hover on desktop */}
					{(onEdit || onDelete || onToggleLearning) && (
						<div className="flex shrink-0 items-center gap-1 transition-opacity md:opacity-0 md:group-hover:opacity-100">
							{onToggleLearning && (
								<button
									type="button"
									onClick={onToggleLearning}
									className={cn(
										"rounded-md p-1.5",
										"transition-colors",
										isLearning ? [
											"text-violet-600 dark:text-violet-400",
											"hover:text-violet-700 dark:hover:text-violet-300",
											"hover:bg-violet-500/10",
										] : [
											"text-[var(--color-foreground-tertiary)]",
											"hover:text-violet-600 dark:hover:text-violet-400",
											"hover:bg-[var(--color-state-hover)]",
										],
									)}
									title={isLearning ? "Remove from learning" : "Mark as learning"}
								>
									<Bookmark className={cn(
										"h-3.5 w-3.5",
										isLearning && "fill-current"
									)} />
								</button>
							)}
							{onEdit && (
								<button
									type="button"
									onClick={onEdit}
									className={cn(
										"rounded-md p-1.5",
										"text-[var(--color-foreground-tertiary)]",
										"hover:text-[var(--color-foreground-secondary)]",
										"hover:bg-[var(--color-state-hover)]",
										"transition-colors",
									)}
									title="Edit shortcut"
								>
									<Edit className="h-3.5 w-3.5" />
								</button>
							)}
							{onDelete && (
								<button
									type="button"
									onClick={onDelete}
									className={cn(
										"rounded-md p-1.5",
										"text-[var(--color-foreground-tertiary)]",
										"hover:text-[var(--color-state-error)]",
										"hover:bg-[var(--color-state-errorLight)]",
										"transition-colors",
									)}
									title="Delete shortcut"
								>
									<Trash2 className="h-3.5 w-3.5" />
								</button>
							)}
						</div>
					)}
				</div>

				{/* Pills row */}
				<div className="flex flex-wrap items-start gap-2">
					{/* Tool pill - modern glass morphism style */}
					<button
						type="button"
						onClick={() => onToolClick?.(tool.name)}
						className={cn(
							"inline-flex items-center gap-1.5",
							"px-3 py-1.5",
							"rounded-full", // Fully rounded for modern look
							"font-semibold text-xs tracking-wide",
							"transition-all duration-200",
							// Modern glass morphism effect
							"bg-gradient-to-r from-blue-500/20 to-purple-500/20",
							"backdrop-blur-md",
							"text-blue-700 dark:text-blue-300",
							"border border-blue-500/30",
							"hover:from-blue-500/30 hover:to-purple-500/30",
							"hover:border-blue-500/50",
							"hover:shadow-lg",
							"hover:shadow-blue-500/25",
							"cursor-pointer",
							"relative overflow-hidden",
							// Shine effect
							"before:absolute before:inset-0",
							"before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent",
							"before:translate-x-[-200%] hover:before:translate-x-[200%]",
							"before:transition-transform before:duration-700",
						)}
					>
						<ToolIcon className="h-3.5 w-3.5" />
						<span>{tool.name}</span>
					</button>

					{/* Category pill - modern glass morphism style */}
					{category && (
						<button
							type="button"
							onClick={() => onCategoryClick?.(shortcut.category)}
							className={cn(
								"inline-flex items-center gap-1.5",
								"px-3 py-1.5",
								"rounded-full", // Fully rounded for modern look
								"font-semibold text-xs tracking-wide",
								"transition-all duration-200",
								// Modern glass morphism effect
								"bg-gradient-to-r from-emerald-500/20 to-teal-500/20",
								"backdrop-blur-md",
								"text-emerald-700 dark:text-emerald-300",
								"border border-emerald-500/30",
								"hover:from-emerald-500/30 hover:to-teal-500/30",
								"hover:border-emerald-500/50",
								"hover:shadow-lg",
								"hover:shadow-emerald-500/25",
								"cursor-pointer",
								"relative overflow-hidden",
								// Shine effect
								"before:absolute before:inset-0",
								"before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent",
								"before:translate-x-[-200%] hover:before:translate-x-[200%]",
								"before:transition-transform before:duration-700",
							)}
						>
							<Hash className="h-3.5 w-3.5" />
							<span>{category}</span>
						</button>
					)}
				</div>
			</div>

			{/* Key visualization with scaling - at bottom */}
			<div className="mt-auto pt-4">
				<KeyVisualizer 
					keys={keys} 
					size="md"
				/>
			</div>

			</div>
			</div>

			{/* Fixed positioned tooltip with portal */}
			{showTooltip && (shortcut.description || shortcut.configFile) && typeof document !== 'undefined' && createPortal(
				<div
					className={cn(
						"fixed z-[9999]",
						"w-64 p-4",
						"rounded-xl",
						// Frosted glass effect
						"bg-black/80 dark:bg-gray-900/80",
						"backdrop-blur-xl",
						"border border-gray-700/30",
						"shadow-2xl shadow-black/50",
						// Content styling
						"text-white",
						"text-sm leading-relaxed",
						// Animation
						"transition-opacity duration-200 ease-out",
						"pointer-events-none",
						// Arrow pointing up
						"before:content-[''] before:absolute before:-top-2 before:left-1/2 before:-translate-x-1/2",
						"before:w-0 before:h-0",
						"before:border-l-[8px] before:border-l-transparent",
						"before:border-r-[8px] before:border-r-transparent",
						"before:border-b-[8px] before:border-b-black/80 dark:before:border-b-gray-900/80",
					)}
					style={{
						left: `${tooltipPosition.x}px`,
						top: `${tooltipPosition.y}px`,
						transform: 'translateX(-50%)',
						opacity: 1,
					}}
				>
					{shortcut.description && (
						<p className="text-white font-medium">
							{shortcut.description}
						</p>
					)}
					{shortcut.configFile && (
						<p className="mt-2 text-gray-300 text-xs font-mono">
							<span className="text-gray-400">Config:</span> {shortcut.configFile}
						</p>
					)}
				</div>,
				document.body
			)}
		</>
	);
}

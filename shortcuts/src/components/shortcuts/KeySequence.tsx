import { ArrowRight } from "lucide-react";
import { cn } from "~/lib/utils";
import type { Key } from "~/types/shortcuts";
import { CommandDisplay } from "./CommandDisplay";
import { KeyPress } from "./KeyPress";

interface KeySequenceProps {
	sequence: Key[][];
	className?: string;
	size?: "sm" | "md" | "lg";
}

export function KeySequence({
	sequence,
	className,
	size = "md",
}: KeySequenceProps) {
	const arrowSizeClasses = {
		sm: "w-3 h-3",
		md: "w-4 h-4",
		lg: "w-5 h-5",
	};

	return (
		<div className={cn("inline-flex items-center gap-2", className)}>
			{sequence.map((combo, index) => (
				// biome-ignore lint/suspicious/noArrayIndexKey: Sequence order is stable
				<div key={`seq-${index}`} className="inline-flex items-center gap-2">
					{index > 0 && (
						<ArrowRight
							className={cn(
								"text-gray-400 dark:text-gray-500",
								arrowSizeClasses[size],
							)}
						/>
					)}
					<div className="inline-flex items-center gap-1">
						{combo.map((key, keyIndex) => (
							<span key={`key-${keyIndex}-${key.key}`}>
								{key.type === "command" ? (
									<CommandDisplay command={key} size={size} />
								) : (
									<KeyPress keyData={key} size={size} />
								)}
							</span>
						))}
					</div>
				</div>
			))}
		</div>
	);
}

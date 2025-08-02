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

	// Calculate scale based on total complexity
	const totalKeys = sequence.reduce((acc, combo) => acc + combo.length, 0);
	const sequenceLength = sequence.length;
	let scaleMultiplier = 1;
	let keySize = size;
	
	// Much more aggressive scaling for sequences
	if (sequenceLength > 1 || totalKeys > 3) {
		const scaleFactor = Math.max(sequenceLength - 1, (totalKeys - 3) / 2);
		scaleMultiplier = Math.max(0.35, 1 - scaleFactor * 0.25);
		// Also reduce key size for very complex sequences
		if (totalKeys > 5 && size === "md") keySize = "sm";
	}
	
	return (
		<div className={cn("inline-flex items-center gap-2 overflow-hidden w-full", className)}>
			<div className="inline-flex items-center gap-1 min-w-0" style={{
				transform: `scale(${scaleMultiplier})`,
				transformOrigin: 'left center',
				width: 'max-content'
			}}>
				{sequence.map((combo, index) => (
					// biome-ignore lint/suspicious/noArrayIndexKey: Sequence order is stable
					<div key={`seq-${index}`} className="inline-flex items-center gap-1">
						{index > 0 && (
							<ArrowRight
								className={cn(
									"text-gray-400 dark:text-gray-500 mx-1",
									arrowSizeClasses[size],
								)}
							/>
						)}
						<div className="inline-flex items-center gap-1">
							{combo.map((key, keyIndex) => (
								<span key={`key-${keyIndex}-${key.key}`}>
									{key.type === "command" ? (
										<CommandDisplay command={key} size={keySize} />
									) : (
										<KeyPress keyData={key} size={keySize} />
									)}
								</span>
							))}
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

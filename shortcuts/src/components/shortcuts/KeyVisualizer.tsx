import { getVisualizationType } from "~/lib/shortcut-utils";
import { cn } from "~/lib/utils";
import type { Key } from "~/types/shortcuts";
import { CommandDisplay } from "./CommandDisplay";
import { KeyPress } from "./KeyPress";
import { KeySequence } from "./KeySequence";

interface KeyVisualizerProps {
	keys: Key[][];
	className?: string;
	size?: "sm" | "md" | "lg";
}

export function KeyVisualizer({
	keys,
	className,
	size = "md",
}: KeyVisualizerProps) {
	const visualizationType = getVisualizationType(keys);

	if (visualizationType === "command" && keys[0]?.length === 1 && keys[0][0]) {
		return (
			<CommandDisplay command={keys[0][0]} size={size} className={className} />
		);
	}

	if (visualizationType === "sequence") {
		return <KeySequence sequence={keys} size={size} className={className} />;
	}

	// Single key combination
	if (keys[0]) {
		// Much more aggressive scaling based on key count
		const keyCount = keys[0].length;
		let scaleMultiplier = 1;
		let keySize = size;
		
		// Progressive scaling - start earlier and scale more aggressively
		if (keyCount > 2) {
			scaleMultiplier = Math.max(0.4, 1 - (keyCount - 2) * 0.2);
			// Also reduce key size for very long sequences
			if (keyCount > 4 && size === "md") keySize = "sm";
		}
		
		return (
			<div className={cn("inline-flex items-center gap-1 overflow-hidden w-full", className)}>
				<div className="inline-flex items-center gap-0.5 min-w-0" style={{
					transform: `scale(${scaleMultiplier})`,
					transformOrigin: 'left center',
					width: 'max-content'
				}}>
					{keys[0].map((key, index) => (
						<KeyPress key={`key-${index}-${key.key}`} keyData={key} size={keySize} />
					))}
				</div>
			</div>
		);
	}

	return null;
}

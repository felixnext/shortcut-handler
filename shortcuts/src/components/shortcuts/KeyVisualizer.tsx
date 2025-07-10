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

	if (visualizationType === "command" && keys[0]?.length === 1) {
		return (
			<CommandDisplay command={keys[0][0]} size={size} className={className} />
		);
	}

	if (visualizationType === "sequence") {
		return <KeySequence sequence={keys} size={size} className={className} />;
	}

	// Single key combination
	if (keys[0]) {
		return (
			<div className={cn("inline-flex items-center gap-1", className)}>
				{keys[0].map((key, index) => (
					<KeyPress key={`key-${index}-${key.key}`} keyData={key} size={size} />
				))}
			</div>
		);
	}

	return null;
}

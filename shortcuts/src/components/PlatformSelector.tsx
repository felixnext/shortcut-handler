"use client";

import {
	AppleLogo,
	LinuxLogo,
	Monitor,
	WindowsLogo,
} from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { detectPlatform } from "~/lib/shortcut-utils";
import { cn } from "~/lib/utils";

type Platform = "mac" | "windows" | "linux";

interface PlatformSelectorProps {
	onPlatformChange?: (platform: Platform) => void;
}

export function PlatformSelector({ onPlatformChange }: PlatformSelectorProps) {
	const [platform, setPlatform] = useState<Platform>("mac");
	const [isOpen, setIsOpen] = useState(false);
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
		// Detect and set initial platform
		const detected = detectPlatform();
		setPlatform(detected);

		// Check localStorage for saved preference
		const saved = localStorage.getItem("preferredPlatform");
		if (saved && ["mac", "windows", "linux"].includes(saved)) {
			setPlatform(saved as Platform);
		}
	}, []);

	const handlePlatformChange = (newPlatform: Platform) => {
		setPlatform(newPlatform);
		localStorage.setItem("preferredPlatform", newPlatform);
		setIsOpen(false);
		onPlatformChange?.(newPlatform);

		// Force re-render of the entire app to update key displays
		window.location.reload();
	};

	const platforms = [
		{ value: "mac" as Platform, label: "macOS", icon: AppleLogo },
		{ value: "windows" as Platform, label: "Windows", icon: WindowsLogo },
		{ value: "linux" as Platform, label: "Linux", icon: LinuxLogo },
	];

	const currentPlatform = platforms.find((p) => p.value === platform);
	const Icon = currentPlatform?.icon || Monitor;

	return (
		<div className="relative">
			<button
				type="button"
				onClick={() => setIsOpen(!isOpen)}
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
				title={`Platform: ${currentPlatform?.label}`}
			>
				<Icon className="h-4 w-4" />
				<span className="hidden sm:inline">{currentPlatform?.label}</span>
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
							"min-w-[140px]",
							"rounded-md",
							"bg-[var(--color-background-secondary)]",
							"border border-[var(--color-border-primary)]",
							"shadow-lg",
							"py-1",
						)}
					>
						{platforms.map(({ value, label, icon: ItemIcon }) => (
							<button
								key={value}
								type="button"
								onClick={() => handlePlatformChange(value)}
								className={cn(
									"w-full px-3 py-2",
									"flex items-center gap-2",
									"text-sm",
									"transition-colors",
									"hover:bg-[var(--color-state-hover)]",
									platform === value
										? "font-medium text-[var(--color-state-selected)]"
										: "text-[var(--color-foreground-secondary)]",
								)}
							>
								<ItemIcon className="h-4 w-4" />
								{label}
								{platform === value && (
									<span className="ml-auto text-xs">✓</span>
								)}
							</button>
						))}
					</div>
				</>
			)}
		</div>
	);
}

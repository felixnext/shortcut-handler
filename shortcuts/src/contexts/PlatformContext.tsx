"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { type Platform, detectPlatform } from "~/lib/platform";

interface PlatformContextType {
	platform: Platform;
	setPlatform: (platform: Platform) => void;
}

const PlatformContext = createContext<PlatformContextType | undefined>(
	undefined,
);

export function PlatformProvider({ children }: { children: React.ReactNode }) {
	const [platform, setPlatform] = useState<Platform>("mac");

	useEffect(() => {
		// Detect platform on mount
		const detected = detectPlatform();
		setPlatform(detected);

		// Also check localStorage for user preference
		const stored = localStorage.getItem("preferredPlatform");
		if (stored && ["mac", "windows", "linux"].includes(stored)) {
			setPlatform(stored as Platform);
		}
	}, []);

	const handleSetPlatform = (newPlatform: Platform) => {
		setPlatform(newPlatform);
		localStorage.setItem("preferredPlatform", newPlatform);
	};

	return (
		<PlatformContext.Provider
			value={{ platform, setPlatform: handleSetPlatform }}
		>
			{children}
		</PlatformContext.Provider>
	);
}

export function usePlatform() {
	const context = useContext(PlatformContext);
	if (!context) {
		throw new Error("usePlatform must be used within a PlatformProvider");
	}
	return context;
}

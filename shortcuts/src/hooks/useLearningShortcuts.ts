"use client";

import { useCallback, useEffect, useState } from "react";

const LEARNING_STORAGE_KEY = "keyboard-shortcuts-learning";

export function useLearningShortcuts() {
	const [learningIds, setLearningIds] = useState<Set<string>>(new Set());
	const [isLoaded, setIsLoaded] = useState(false);

	// Load learning shortcuts from localStorage on mount
	useEffect(() => {
		const stored = localStorage.getItem(LEARNING_STORAGE_KEY);
		if (stored) {
			try {
				const ids = JSON.parse(stored) as string[];
				setLearningIds(new Set(ids));
			} catch (error) {
				console.error("Failed to parse learning shortcuts:", error);
			}
		}
		setIsLoaded(true);
	}, []);

	// Save to localStorage whenever learningIds changes
	useEffect(() => {
		if (isLoaded) {
			const ids = Array.from(learningIds);
			localStorage.setItem(LEARNING_STORAGE_KEY, JSON.stringify(ids));
		}
	}, [learningIds, isLoaded]);

	const toggleLearning = useCallback((shortcutId: string) => {
		setLearningIds((prev) => {
			const newSet = new Set(prev);
			if (newSet.has(shortcutId)) {
				newSet.delete(shortcutId);
			} else {
				newSet.add(shortcutId);
			}
			return newSet;
		});
	}, []);

	const isLearning = useCallback(
		(shortcutId: string) => {
			return learningIds.has(shortcutId);
		},
		[learningIds],
	);

	const clearAllLearning = useCallback(() => {
		setLearningIds(new Set());
	}, []);

	return {
		learningIds,
		toggleLearning,
		isLearning,
		clearAllLearning,
		learningCount: learningIds.size,
	};
}
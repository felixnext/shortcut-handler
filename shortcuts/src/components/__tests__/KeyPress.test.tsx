import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { Key } from "~/types/shortcuts";
import { KeyPress } from "../shortcuts/KeyPress";

// Mock the detectPlatform function
vi.mock("~/lib/shortcut-utils", () => ({
	detectPlatform: () => "mac",
	normalizeModifierKey: (key: string, platform: string) => {
		if (platform === "mac" && key === "cmd") return "⌘";
		if (platform === "mac" && key === "shift") return "⇧";
		return key.toUpperCase();
	},
}));

describe("KeyPress", () => {
	it("should render a regular key", () => {
		const key: Key = { key: "s", type: "key" };
		render(<KeyPress keyData={key} />);

		const span = screen.getByText("s");
		expect(span).toBeInTheDocument();
		const kbd = span.parentElement;
		expect(kbd?.tagName).toBe("KBD");
	});

	it("should render a modifier key with special symbol", () => {
		const key: Key = { key: "cmd", isModifier: true, type: "key" };
		render(<KeyPress keyData={key} />);

		const kbd = screen.getByText("⌘");
		expect(kbd).toBeInTheDocument();
	});

	it("should apply modifier styling", () => {
		const key: Key = { key: "shift", isModifier: true, type: "key" };
		render(<KeyPress keyData={key} />);

		const span = screen.getByText("⇧");
		expect(span.className).toContain("modifier");
	});

	it("should support different sizes", () => {
		const key: Key = { key: "a", type: "key" };
		const { rerender } = render(<KeyPress keyData={key} size="sm" />);

		let span = screen.getByText("a");
		let kbd = span.parentElement;
		expect(kbd?.className).toContain("text-xs");

		rerender(<KeyPress keyData={key} size="lg" />);
		span = screen.getByText("a");
		kbd = span.parentElement;
		expect(kbd?.className).toContain("text-base");
	});
});

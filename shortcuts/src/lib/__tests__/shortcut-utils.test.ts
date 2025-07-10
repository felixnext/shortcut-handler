import { describe, expect, it } from "vitest";
import type { Key } from "~/types/shortcuts";
import {
	detectPlatform,
	getVisualizationType,
	normalizeModifierKey,
	parseKeyString,
} from "../shortcut-utils";

describe("shortcut-utils", () => {
	describe("getVisualizationType", () => {
		it("should return 'command' for single command key", () => {
			const keys: Key[][] = [[{ key: ":w", type: "command" }]];
			expect(getVisualizationType(keys)).toBe("command");
		});

		it("should return 'sequence' for multiple key combinations", () => {
			const keys: Key[][] = [
				[{ key: "g", type: "key" }],
				[{ key: "g", type: "key" }],
			];
			expect(getVisualizationType(keys)).toBe("sequence");
		});

		it("should return 'key-press' for single key combination", () => {
			const keys: Key[][] = [
				[
					{ key: "cmd", isModifier: true, type: "key" },
					{ key: "s", type: "key" },
				],
			];
			expect(getVisualizationType(keys)).toBe("key-press");
		});

		it("should return 'key-press' for empty keys", () => {
			expect(getVisualizationType([])).toBe("key-press");
		});
	});

	describe("normalizeModifierKey", () => {
		describe("macOS", () => {
			it("should normalize cmd variations", () => {
				expect(normalizeModifierKey("cmd", "mac")).toBe("⌘");
				expect(normalizeModifierKey("command", "mac")).toBe("⌘");
				expect(normalizeModifierKey("meta", "mac")).toBe("⌘");
			});

			it("should normalize ctrl", () => {
				expect(normalizeModifierKey("ctrl", "mac")).toBe("⌃");
				expect(normalizeModifierKey("control", "mac")).toBe("⌃");
			});

			it("should normalize alt/option", () => {
				expect(normalizeModifierKey("alt", "mac")).toBe("⌥");
				expect(normalizeModifierKey("opt", "mac")).toBe("⌥");
				expect(normalizeModifierKey("option", "mac")).toBe("⌥");
			});

			it("should normalize shift", () => {
				expect(normalizeModifierKey("shift", "mac")).toBe("⇧");
			});
		});

		describe("Windows", () => {
			it("should normalize windows key", () => {
				expect(normalizeModifierKey("win", "windows")).toBe("⊞");
				expect(normalizeModifierKey("windows", "windows")).toBe("⊞");
				expect(normalizeModifierKey("meta", "windows")).toBe("⊞");
			});

			it("should normalize other modifiers", () => {
				expect(normalizeModifierKey("ctrl", "windows")).toBe("Ctrl");
				expect(normalizeModifierKey("alt", "windows")).toBe("Alt");
				expect(normalizeModifierKey("shift", "windows")).toBe("Shift");
			});
		});

		describe("Linux", () => {
			it("should normalize super key", () => {
				expect(normalizeModifierKey("super", "linux")).toBe("Super");
				expect(normalizeModifierKey("meta", "linux")).toBe("Super");
			});

			it("should normalize other modifiers", () => {
				expect(normalizeModifierKey("ctrl", "linux")).toBe("Ctrl");
				expect(normalizeModifierKey("alt", "linux")).toBe("Alt");
				expect(normalizeModifierKey("shift", "linux")).toBe("Shift");
			});
		});
	});

	describe("parseKeyString", () => {
		it("should parse command strings", () => {
			const result = parseKeyString(":wq");
			expect(result).toEqual([{ key: ":wq", type: "command" }]);
		});

		it("should parse single key", () => {
			const result = parseKeyString("a");
			expect(result).toEqual([{ key: "a", isModifier: false, type: "key" }]);
		});

		it("should parse key combination with modifiers", () => {
			const result = parseKeyString("cmd+shift+s");
			expect(result).toEqual([
				{ key: "cmd", isModifier: true, type: "key" },
				{ key: "shift", isModifier: true, type: "key" },
				{ key: "s", isModifier: false, type: "key" },
			]);
		});

		it("should recognize common modifiers", () => {
			const modifiers = [
				"ctrl",
				"cmd",
				"alt",
				"opt",
				"shift",
				"meta",
				"win",
				"super",
			];
			for (const mod of modifiers) {
				const result = parseKeyString(mod);
				expect(result[0].isModifier).toBe(true);
			}
		});
	});
});

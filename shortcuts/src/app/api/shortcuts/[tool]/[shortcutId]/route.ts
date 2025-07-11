import { NextResponse } from "next/server";
import { loadTool, saveTool } from "~/lib/shortcuts";
import type { Shortcut } from "~/types/shortcuts";

// PUT /api/shortcuts/[tool]/[shortcutId] - Update a specific shortcut
export async function PUT(
	request: Request,
	{ params }: { params: Promise<{ tool: string; shortcutId: string }> },
) {
	try {
		const body = await request.json();
		const updatedShortcut = body as Shortcut;
		
		// Await params
		const { tool, shortcutId } = await params;

		// Load the tool
		const toolFile = await loadTool(tool);
		if (!toolFile) {
			return NextResponse.json({ error: "Tool not found" }, { status: 404 });
		}

		// Update the shortcut
		const shortcutIndex = toolFile.shortcuts.findIndex(
			(s) => s.id === shortcutId,
		);

		if (shortcutIndex === -1) {
			return NextResponse.json(
				{ error: "Shortcut not found" },
				{ status: 404 },
			);
		}

		toolFile.shortcuts[shortcutIndex] = updatedShortcut;

		// Save the tool
		await saveTool(tool, toolFile);

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error updating shortcut:", error);
		return NextResponse.json(
			{ error: "Failed to update shortcut" },
			{ status: 500 },
		);
	}
}

// DELETE /api/shortcuts/[tool]/[shortcutId] - Delete a specific shortcut
export async function DELETE(
	request: Request,
	{ params }: { params: Promise<{ tool: string; shortcutId: string }> },
) {
	try {
		// Await params
		const { tool, shortcutId } = await params;
		
		// Load the tool
		const toolFile = await loadTool(tool);
		if (!toolFile) {
			return NextResponse.json({ error: "Tool not found" }, { status: 404 });
		}

		// Remove the shortcut
		toolFile.shortcuts = toolFile.shortcuts.filter(
			(s) => s.id !== shortcutId,
		);

		// Save the tool
		await saveTool(tool, toolFile);

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error deleting shortcut:", error);
		return NextResponse.json(
			{ error: "Failed to delete shortcut" },
			{ status: 500 },
		);
	}
}

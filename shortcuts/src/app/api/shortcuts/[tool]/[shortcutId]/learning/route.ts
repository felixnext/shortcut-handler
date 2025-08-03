import { NextResponse } from "next/server";
import { loadTool, saveTool } from "~/lib/shortcuts";
import type { Shortcut } from "~/types/shortcuts";

export async function PATCH(
	request: Request,
	props: { params: Promise<{ tool: string; shortcutId: string }> },
) {
	const params = await props.params;
	const { tool, shortcutId } = params;

	try {
		const body = await request.json();
		const { learning } = body;

		console.log("PATCH learning status:", { tool, shortcutId, learning });

		// Load the tool using the shared utility
		const toolFile = await loadTool(tool);
		if (!toolFile) {
			return NextResponse.json({ error: "Tool not found" }, { status: 404 });
		}

		// Find and update the shortcut
		const shortcutIndex = toolFile.shortcuts.findIndex((s) => s.id === shortcutId);
		if (shortcutIndex === -1) {
			return NextResponse.json(
				{ error: "Shortcut not found" },
				{ status: 404 },
			);
		}

		// Update the learning status
		if (toolFile.shortcuts[shortcutIndex]) {
			toolFile.shortcuts[shortcutIndex].learning = learning;
		}

		// Save the tool using the shared utility
		await saveTool(tool, toolFile);

		return NextResponse.json({
			success: true,
			shortcut: toolFile.shortcuts[shortcutIndex],
		});
	} catch (error) {
		console.error("Error updating learning status:", error);
		return NextResponse.json(
			{ error: "Failed to update learning status" },
			{ status: 500 },
		);
	}
}
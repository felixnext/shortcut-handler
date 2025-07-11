import { NextResponse } from "next/server";
import { deleteTool, loadTool, saveTool } from "~/lib/shortcuts";
import type { Shortcut, ToolFile } from "~/types/shortcuts";

// GET /api/shortcuts/[tool] - Get a specific tool's shortcuts
export async function GET(
	request: Request,
	{ params }: { params: Promise<{ tool: string }> },
) {
	try {
		const { tool: toolName } = await params;
		const tool = await loadTool(toolName);
		if (!tool) {
			return NextResponse.json({ error: "Tool not found" }, { status: 404 });
		}
		return NextResponse.json(tool);
	} catch (error) {
		console.error("Error loading tool:", error);
		return NextResponse.json({ error: "Failed to load tool" }, { status: 500 });
	}
}

// PUT /api/shortcuts/[tool] - Update a tool's shortcuts
export async function PUT(
	request: Request,
	{ params }: { params: Promise<{ tool: string }> },
) {
	try {
		const body = await request.json();
		const toolFile = body as ToolFile;
		const { tool } = await params;

		await saveTool(tool, toolFile);

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error saving tool:", error);
		return NextResponse.json({ error: "Failed to save tool" }, { status: 500 });
	}
}

// POST /api/shortcuts/[tool] - Create a new shortcut for a tool
export async function POST(
	request: Request,
	{ params }: { params: Promise<{ tool: string }> },
) {
	try {
		const body = await request.json();
		const newShortcut = body as Shortcut;
		const { tool } = await params;

		// Load the tool
		const toolFile = await loadTool(tool);
		if (!toolFile) {
			return NextResponse.json({ error: "Tool not found" }, { status: 404 });
		}

		// Add the new shortcut
		toolFile.shortcuts.push(newShortcut);

		// Save the tool
		await saveTool(tool, toolFile);

		return NextResponse.json({ success: true, shortcut: newShortcut });
	} catch (error) {
		console.error("Error creating shortcut:", error);
		return NextResponse.json(
			{ error: "Failed to create shortcut" },
			{ status: 500 },
		);
	}
}

// DELETE /api/shortcuts/[tool] - Delete a tool
export async function DELETE(
	request: Request,
	{ params }: { params: Promise<{ tool: string }> },
) {
	try {
		const { tool } = await params;
		await deleteTool(tool);
		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error deleting tool:", error);
		return NextResponse.json(
			{ error: "Failed to delete tool" },
			{ status: 500 },
		);
	}
}

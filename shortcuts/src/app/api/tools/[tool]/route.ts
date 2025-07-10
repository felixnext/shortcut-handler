import { promises as fs } from "node:fs";
import path from "node:path";
import * as yaml from "js-yaml";
import { NextResponse } from "next/server";
import type { ToolFile } from "~/types/shortcuts";

const DATA_DIR = path.join(process.cwd(), "data", "shortcuts");

// Update or create a tool file
export async function PUT(
	_request: Request,
	{ params }: { params: { tool: string } },
) {
	try {
		const body = await _request.json();
		const { tool, shortcuts } = body as ToolFile;

		// Ensure data directory exists
		await fs.mkdir(DATA_DIR, { recursive: true });

		const filePath = path.join(DATA_DIR, `${params.tool}.yaml`);

		// Create the YAML content
		const yamlContent = yaml.dump(
			{ tool, shortcuts },
			{
				indent: 2,
				lineWidth: -1,
				noRefs: true,
				sortKeys: false,
			},
		);

		// Write the file
		await fs.writeFile(filePath, yamlContent, "utf-8");

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error creating/updating tool:", error);
		return NextResponse.json(
			{ error: "Failed to create/update tool" },
			{ status: 500 },
		);
	}
}

import { promises as fs } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { SHORTCUTS_DIR, METADATA_FILE } from "~/lib/paths";

export async function GET() {
	try {
		// Read all YAML files from the shortcuts directory
		const files = await fs.readdir(SHORTCUTS_DIR);
		const yamlFiles = files.filter((file) => file.endsWith(".yaml"));

		// Read content of all YAML files
		const exportData: Record<string, string> = {};

		for (const file of yamlFiles) {
			const filePath = path.join(SHORTCUTS_DIR, file);
			const content = await fs.readFile(filePath, "utf-8");
			exportData[file] = content;
		}

		// Also include metadata file
		try {
			const metadataContent = await fs.readFile(METADATA_FILE, "utf-8");
			exportData["metadata.yaml"] = metadataContent;
		} catch (error) {
			// Metadata file might not exist
			console.warn("Metadata file not found:", error);
		}

		// Create timestamp for filename
		const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
		const filename = `shortcuts-backup-${timestamp}.json`;

		// Return as JSON download
		return new NextResponse(JSON.stringify(exportData, null, 2), {
			headers: {
				"Content-Type": "application/json",
				"Content-Disposition": `attachment; filename="${filename}"`,
			},
		});
	} catch (error) {
		console.error("Error exporting shortcuts:", error);
		return NextResponse.json(
			{ error: "Failed to export shortcuts" },
			{ status: 500 },
		);
	}
}

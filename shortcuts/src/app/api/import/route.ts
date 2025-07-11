import { promises as fs } from "node:fs";
import path from "node:path";
import * as yaml from "js-yaml";
import { NextResponse } from "next/server";
import type { ToolFile } from "~/types/shortcuts";
import { SHORTCUTS_DIR, METADATA_FILE } from "~/lib/paths";

export async function POST(request: Request) {
	try {
		const body = await request.json();
		const importData = body as Record<string, string>;

		// Ensure shortcuts directory exists
		await fs.mkdir(SHORTCUTS_DIR, { recursive: true });

		// Validate the import data
		for (const [filename, content] of Object.entries(importData)) {
			if (!filename.endsWith(".yaml")) {
				return NextResponse.json(
					{ error: `Invalid filename: ${filename}` },
					{ status: 400 },
				);
			}

			// Try to parse the YAML to validate it (skip metadata.yaml)
			try {
				if (filename !== "metadata.yaml") {
					yaml.load(content) as ToolFile;
				}
			} catch (error) {
				return NextResponse.json(
					{ error: `Invalid YAML in file ${filename}: ${error}` },
					{ status: 400 },
				);
			}
		}

		// Backup existing files
		const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
		const backupDir = path.join(SHORTCUTS_DIR, `backup-${timestamp}`);
		await fs.mkdir(backupDir, { recursive: true });

		// Move existing files to backup
		const existingFiles = await fs.readdir(SHORTCUTS_DIR);
		for (const file of existingFiles) {
			if (file.endsWith(".yaml")) {
				const oldPath = path.join(SHORTCUTS_DIR, file);
				const newPath = path.join(backupDir, file);
				await fs.rename(oldPath, newPath);
			}
		}

		// Write the imported files
		for (const [filename, content] of Object.entries(importData)) {
			if (filename === "metadata.yaml") {
				// Write metadata to the correct location
				await fs.writeFile(METADATA_FILE, content, "utf-8");
			} else {
				// Write tool files to shortcuts directory
				const filePath = path.join(SHORTCUTS_DIR, filename);
				await fs.writeFile(filePath, content, "utf-8");
			}
		}

		return NextResponse.json({
			success: true,
			message: `Imported ${Object.keys(importData).length} files. Previous data backed up to ${backupDir}`,
		});
	} catch (error) {
		console.error("Error importing shortcuts:", error);
		return NextResponse.json(
			{ error: "Failed to import shortcuts" },
			{ status: 500 },
		);
	}
}

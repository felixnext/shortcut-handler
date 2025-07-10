import { promises as fs } from "node:fs";
import path from "node:path";
import * as yaml from "js-yaml";
import { NextResponse } from "next/server";
import type { ToolFile } from "~/types/shortcuts";

const DATA_DIR = path.join(process.cwd(), "data", "shortcuts");

export async function POST(request: Request) {
	try {
		const body = await request.json();
		const importData = body as Record<string, string>;

		// Ensure data directory exists
		await fs.mkdir(DATA_DIR, { recursive: true });

		// Validate the import data
		for (const [filename, content] of Object.entries(importData)) {
			if (!filename.endsWith(".yaml")) {
				return NextResponse.json(
					{ error: `Invalid filename: ${filename}` },
					{ status: 400 },
				);
			}

			// Try to parse the YAML to validate it
			try {
				yaml.load(content) as ToolFile;
			} catch (error) {
				return NextResponse.json(
					{ error: `Invalid YAML in file ${filename}: ${error}` },
					{ status: 400 },
				);
			}
		}

		// Backup existing files
		const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
		const backupDir = path.join(DATA_DIR, `backup-${timestamp}`);
		await fs.mkdir(backupDir, { recursive: true });

		// Move existing files to backup
		const existingFiles = await fs.readdir(DATA_DIR);
		for (const file of existingFiles) {
			if (file.endsWith(".yaml")) {
				const oldPath = path.join(DATA_DIR, file);
				const newPath = path.join(backupDir, file);
				await fs.rename(oldPath, newPath);
			}
		}

		// Write the imported files
		for (const [filename, content] of Object.entries(importData)) {
			const filePath = path.join(DATA_DIR, filename);
			await fs.writeFile(filePath, content, "utf-8");
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

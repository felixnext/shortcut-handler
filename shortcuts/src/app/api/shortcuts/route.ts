import { NextResponse } from "next/server";
import { getAllShortcuts } from "~/lib/shortcuts";

export async function GET() {
	try {
		const shortcuts = await getAllShortcuts();
		return NextResponse.json(shortcuts);
	} catch (error) {
		console.error("Failed to fetch shortcuts:", error);
		return NextResponse.json(
			{ error: "Failed to fetch shortcuts" },
			{ status: 500 },
		);
	}
}

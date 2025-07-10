import { NextResponse } from "next/server";
import { loadMetadata } from "~/lib/shortcuts";

export async function GET() {
	try {
		const metadata = await loadMetadata();
		return NextResponse.json(metadata);
	} catch (error) {
		console.error("Failed to fetch metadata:", error);
		return NextResponse.json(
			{ error: "Failed to fetch metadata" },
			{ status: 500 },
		);
	}
}

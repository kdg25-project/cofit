import { NextResponse } from "next/server";

const API_BASE = process.env.API_BASE ?? "http://localhost:8787";

export async function GET(req: Request) {
	const cookie = req.headers.get("cookie") ?? "";

	const res = await fetch(`${API_BASE}/api/missions`, {
		headers: {
			cookie,
		},
	});

	const text = await res.text();
	return new NextResponse(text, {
		status: res.status,
		headers: {
			"content-type": res.headers.get("content-type") ?? "application/json",
		},
	});
}

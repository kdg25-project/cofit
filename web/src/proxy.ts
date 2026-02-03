import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
	const sessionCookie =
		request.cookies.get("better-auth.session_token") ||
		request.cookies.get("__secure-better-auth.session_token");

	const { pathname } = request.nextUrl;

	if (
		pathname.startsWith("/login") ||
		pathname.startsWith("/sign-up") ||
		pathname.startsWith("/_next") ||
		pathname.startsWith("/api") ||
		pathname.includes(".")
	) {
		return NextResponse.next();
	}

	if (!sessionCookie) {
		return NextResponse.redirect(new URL("/login", request.url));
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

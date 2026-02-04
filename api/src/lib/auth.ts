import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "../db/schema";
import type { Bindings } from "../types";

export const createAuth = (env: Bindings) => {
	const db = drizzle(env.DB, { schema });

	return betterAuth({
		database: drizzleAdapter(db, {
			provider: "sqlite",
			schema: schema,
		}),
		user: {
			additionalFields: {
				displayName: {
					type: "string",
					required: false,
				},
				partyId: {
					type: "number",
					required: false,
				},
			},
		},
		secret: env.BETTER_AUTH_SECRET,
		baseURL: env.BETTER_AUTH_URL,
		crossOrigin: true,
		trustedOrigins: [
			"http://localhost:3000",
			"http://localhost:8787",
			"https://cofit.kdgn.tech",
		],
		advanced: {
			crossSubDomainCookies: {
				enabled: true,
			},
		},
		emailAndPassword: {
			enabled: true,
			password: {
				// パスワードのハッシュ化（サインアップ時）
				hash: async (password: string) => {
					const encoder = new TextEncoder();
					const data = encoder.encode(password);
					const hashBuffer = await crypto.subtle.digest("SHA-256", data);
					return btoa(String.fromCharCode(...new Uint8Array(hashBuffer)));
				},
				// パスワードの照合（サインイン時）
				verify: async ({ password, hash }) => {
					const encoder = new TextEncoder();
					const data = encoder.encode(password);
					const hashBuffer = await crypto.subtle.digest("SHA-256", data);
					const currentHash = btoa(
						String.fromCharCode(...new Uint8Array(hashBuffer)),
					);
					return currentHash === hash;
				},
			},
		},
		socialProviders: {
			google: {
				clientId: env.GOOGLE_CLIENT_ID,
				clientSecret: env.GOOGLE_CLIENT_SECRET,
			},
		},
	});
};

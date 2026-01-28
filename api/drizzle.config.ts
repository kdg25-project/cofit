import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
	out: "./drizzle",
	schema: "./src/db/schema.ts",
	dialect: "sqlite",
	driver: "d1-http",
	dbCredentials: {
		// @ts-ignore
		accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
		// @ts-ignore
		databaseId: process.env.CLOUDFLARE_DATABASE_ID!,
		// @ts-ignore
		token: process.env.CLOUDFLARE_D1_TOKEN!,
	},
});

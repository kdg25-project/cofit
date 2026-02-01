import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { createDb } from "./db";
import { user } from "./db/schema";
import { createAuth } from "./lib/auth";
import badgeRoute from "./routes/badge";
import chat from "./routes/chat";
import friendRoute from "./routes/friend";
import missionRoute, { ensureGlobalMissions } from "./routes/mission";
import partyRoute from "./routes/party";
import uploadRoute from "./routes/upload";
import userRoute from "./routes/user";
import type { Bindings } from "./types";

const app = new Hono<{ Bindings: Bindings }>();

app.use(
	"/*",
	cors({
		origin: [
			"http://localhost:3000",
			"http://localhost:8787",
			"https://cofit.kdgn.tech",
		],
		allowHeaders: ["Content-Type", "Authorization", "x-requested-with"],
		allowMethods: ["POST", "GET", "OPTIONS", "PATCH", "DELETE"],
		exposeHeaders: ["Content-Length", "Set-Cookie"],
		maxAge: 600,
		credentials: true,
	}),
);

const authRoute = new Hono<{ Bindings: Bindings }>()
	.on(["POST", "GET"], "/*", (c) => {
		const auth = createAuth(c.env);
		return auth.handler(c.req.raw);
	})
	.patch("/me", async (c) => {
		const auth = createAuth(c.env);
		const session = await auth.api.getSession({ headers: c.req.raw.headers });

		if (!session) {
			return c.json({ error: "Unauthorized" }, 401);
		}

		const body = await c.req.json();
		const db = createDb(c.env.DB);

		try {
			const result = await db.query.user.findFirst({
				where: eq(user.name, body.name),
			});
			if (result && result.id !== session.user.id) {
				return c.json({ error: "User name already exists" }, 400);
			}
			await db
				.update(user)
				.set({
					name: body.name,
					displayName: body.displayName,
					image: body.image,
					updatedAt: new Date(),
				})
				.where(eq(user.id, session.user.id));

			return c.json({ success: true });
		} catch (_e) {
			return c.json({ error: "Failed to update profile" }, 500);
		}
	});

const routes = app
	.get("/api/users", async (c) => {
		const db = createDb(c.env.DB);
		const result = await db.query.user.findMany();
		return c.json(result);
	})
	.route("/api/chat", chat)
	.route("/api/user", userRoute)
	.route("/api/parties", partyRoute)
	.route("/api/missions", missionRoute)
	.route("/api/friends", friendRoute)
	.route("/api/badges", badgeRoute)
	.route("/api/upload", uploadRoute)
	.route("/api/auth", authRoute);

export default {
	fetch: app.fetch,
	async scheduled(_event: any, env: Bindings, _ctx: any) {
		const db = createDb(env.DB);

		try {
			await ensureGlobalMissions(db);
			console.log("Global missions ensured via scheduled task");
		} catch (e) {
			console.error("Failed to ensure global missions:", e);
		}
	},
};

export type AppType = typeof routes;

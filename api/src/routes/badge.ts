import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { createDb } from "../db";
import { badge, userBadge } from "../db/schema";
import { createAuth } from "../lib/auth";
import type { Bindings } from "../types";

const badgeRoute = new Hono<{ Bindings: Bindings }>();

badgeRoute.get("/", async (c) => {
	const auth = createAuth(c.env);
	const session = await auth.api.getSession({ headers: c.req.raw.headers });
	const db = createDb(c.env.DB);
	const userId = session?.user.id;

	try {
		const allBadges = await db.query.badge.findMany();

		if (!userId) {
			return c.json(allBadges.map((b) => ({ ...b, isEarned: false })));
		}

		const earned = await db
			.select({ badgeId: userBadge.badgeId })
			.from(userBadge)
			.where((eq as any)(userBadge.userId, userId));

		const earnedIds = new Set(earned.map((e) => e.badgeId));

		return c.json(
			allBadges.map((b) => ({
				...b,
				isEarned: earnedIds.has(b.id),
			})),
		);
	} catch (_e) {
		console.error(_e);
		return c.json({ error: "Internal Server Error" }, 500);
	}
});

badgeRoute.get("/me", async (c) => {
	const auth = createAuth(c.env);
	const session = await auth.api.getSession({ headers: c.req.raw.headers });

	if (!session) {
		return c.json({ error: "Unauthorized" }, 401);
	}

	const db = createDb(c.env.DB);
	const userId = session.user.id;

	try {
		const results = await db
			.select({
				id: badge.id,
				name: badge.name,
				image: badge.image,
				description: badge.description,
				earnedAt: userBadge.createdAt,
			})
			.from(userBadge)
			.innerJoin(badge, (eq as any)(userBadge.badgeId, badge.id))
			.where((eq as any)(userBadge.userId, userId));

		return c.json(results);
	} catch (_e) {
		console.error(_e);
		return c.json({ error: "Internal Server Error" }, 500);
	}
});

badgeRoute.get("/:id", async (c) => {
	const id = Number(c.req.param("id"));
	const db = createDb(c.env.DB);

	try {
		const result = await db.query.badge.findFirst({
			where: (eq as any)(badge.id, id),
		});

		if (!result) {
			return c.json({ error: "Badge not found" }, 404);
		}

		return c.json(result);
	} catch (_e) {
		return c.json({ error: "Internal Server Error" }, 500);
	}
});

export default badgeRoute;

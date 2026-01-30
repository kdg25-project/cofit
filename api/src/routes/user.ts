import { and, count, desc, eq, or } from "drizzle-orm";
import { Hono } from "hono";
import { createDb } from "../db";
import {
	badge,
	friend,
	party,
	partyMember,
	user,
	userActivity,
	userBadge,
} from "../db/schema";
import { createAuth } from "../lib/auth";
import type { Bindings } from "../types";

const userRoute = new Hono<{ Bindings: Bindings }>();

userRoute.get("/me", async (c) => {
	const auth = createAuth(c.env);
	const session = await auth.api.getSession({ headers: c.req.raw.headers });

	if (!session) {
		return c.json({ error: "Unauthorized" }, 401);
	}

	const userId = session.user.id;
	const db = createDb(c.env.DB);

	try {
		const userData = await db.query.user.findFirst({
			where: eq(user.id, userId),
		});

		if (!userData) {
			return c.json({ error: "User not found" }, 404);
		}

		const userParties = await db
			.select({
				id: party.id,
				name: party.name,
				image: party.image,
			})
			.from(partyMember)
			.innerJoin(party, eq(partyMember.partyId, party.id))
			.where(eq(partyMember.userId, userId));

		const recentActivities = await db.query.userActivity.findMany({
			where: eq(userActivity.userId, userId),
			orderBy: [desc(userActivity.createdAt)],
			limit: 5,
		});

		const friendCountResult = await db
			.select({ value: count() })
			.from(friend)
			.where(
				and(
					eq(friend.status, "accepted"),
					or(eq(friend.requesterId, userId), eq(friend.addresseeId, userId)),
				),
			);

		const earnedBadges = await db
			.select({
				id: badge.id,
				name: badge.name,
				image: badge.image,
				earnedAt: userBadge.createdAt,
			})
			.from(userBadge)
			.innerJoin(badge, eq(userBadge.badgeId, badge.id))
			.where(eq(userBadge.userId, userId))
			.orderBy(desc(userBadge.createdAt))
			.limit(5);

		return c.json({
			...userData,
			parties: userParties,
			recentActivities,
			earnedBadges,
			friendCount: friendCountResult[0]?.value || 0,
		});
	} catch (_e) {
		console.error(_e);
		return c.json({ error: "Internal Server Error" }, 500);
	}
});

userRoute.patch("/me", async (c) => {
	const auth = createAuth(c.env);
	const session = await auth.api.getSession({ headers: c.req.raw.headers });

	if (!session) {
		return c.json({ error: "Unauthorized" }, 401);
	}

	const body = await c.req.json();
	const db = createDb(c.env.DB);

	try {
		await db
			.update(user)
			.set({
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

userRoute.get("/:id", async (c) => {
	const id = c.req.param("id");
	const db = createDb(c.env.DB);

	try {
		const result = await db.query.user.findFirst({
			where: eq(user.id, id),
			columns: {
				id: true,
				name: true,
				displayName: true,
				image: true,
				createdAt: true,
			},
		});

		if (!result) {
			return c.json({ error: "User not found" }, 404);
		}

		const earnedBadges = await db
			.select({
				id: badge.id,
				name: badge.name,
				image: badge.image,
			})
			.from(userBadge)
			.innerJoin(badge, eq(userBadge.badgeId, badge.id))
			.where(eq(userBadge.userId, id))
			.orderBy(desc(userBadge.createdAt));

		return c.json({
			...result,
			earnedBadges,
		});
	} catch (_e) {
		return c.json({ error: "Internal Server Error" }, 500);
	}
});

export default userRoute;

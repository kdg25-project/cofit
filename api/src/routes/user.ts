import { and, count, desc, eq, or, sql, sum } from "drizzle-orm";
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

const userRoute = new Hono<{ Bindings: Bindings }>()
	.get("/me", async (c) => {
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
	})
	.get("/:id", async (c) => {
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
	})
	.post("/activities", async (c) => {
		const auth = createAuth(c.env);
		const session = await auth.api.getSession({ headers: c.req.raw.headers });

		if (!session) {
			return c.json({ error: "Unauthorized" }, 401);
		}

		const userId = session.user.id;
		const body = await c.req.json();
		const db = createDb(c.env.DB);

		if (!body.activity || typeof body.count !== "number") {
			return c.json({ error: "Invalid activity data" }, 400);
		}

		try {
			const [newActivity] = await db
				.insert(userActivity)
				.values({
					userId,
					activity: body.activity,
					count: body.count,
					startTime: body.startTime ? new Date(body.startTime) : new Date(),
					endTime: body.endTime ? new Date(body.endTime) : new Date(),
					createdAt: new Date(),
					updatedAt: new Date(),
				})
				.returning();

			const newlyEarnedBadges: any[] = [];
			const now = new Date();

			const existingBadges = await db
				.select({ badgeId: userBadge.badgeId })
				.from(userBadge)
				.where(eq(userBadge.userId, userId));
			const existingBadgeIds = new Set(existingBadges.map((b) => b.badgeId));

			const totalResult = await db
				.select({ total: sum(userActivity.count) })
				.from(userActivity)
				.where(
					and(
						eq(userActivity.userId, userId),
						eq(userActivity.activity, body.activity),
					),
				);

			const totalCount = Number(totalResult[0]?.total || 0);

			const checkAndAddBadge = async (badgeId: number, criteria: boolean) => {
				if (criteria && !existingBadgeIds.has(badgeId)) {
					const [badgeInfo] = await db
						.select()
						.from(badge)
						.where(eq(badge.id, badgeId));
					if (badgeInfo) {
						await db.insert(userBadge).values({
							userId,
							badgeId,
							createdAt: now,
							updatedAt: now,
						});
						newlyEarnedBadges.push(badgeInfo);
					}
				}
			};

			if (body.activity === "squat") {
				await checkAndAddBadge(4, totalCount >= 100);
				await checkAndAddBadge(5, totalCount >= 1000);
				await checkAndAddBadge(6, totalCount >= 10000);
			} else if (body.activity === "abs") {
				await checkAndAddBadge(7, totalCount >= 100);
				await checkAndAddBadge(8, totalCount >= 1000);
				await checkAndAddBadge(9, totalCount >= 10000);
			}

			const datesResult = await db
				.select({
					date: sql<string>`DATE(${userActivity.createdAt}, 'unixepoch')`,
				})
				.from(userActivity)
				.where(eq(userActivity.userId, userId))
				.groupBy(sql`DATE(${userActivity.createdAt}, 'unixepoch')`)
				.orderBy(desc(sql`DATE(${userActivity.createdAt}, 'unixepoch')`));

			const activityDates = datesResult.map((r) => r.date);

			const calculateStreak = (dates: string[]) => {
				if (dates.length === 0) return 0;
				let streak = 0;
				const today = new Date().toISOString().split("T")[0];
				const yesterday = new Date(Date.now() - 86400000)
					.toISOString()
					.split("T")[0];

				if (dates[0] !== today && dates[0] !== yesterday) return 0;

				for (let i = 0; i < dates.length; i++) {
					const current = new Date(dates[i]);
					const nextExpected = new Date(Date.now() - i * 86400000);
					if (
						current.toISOString().split("T")[0] ===
						nextExpected.toISOString().split("T")[0]
					) {
						streak++;
					} else {
						break;
					}
				}
				return streak;
			};

			const currentStreak = calculateStreak(activityDates);
			await checkAndAddBadge(1, currentStreak >= 7);
			await checkAndAddBadge(2, currentStreak >= 14);
			await checkAndAddBadge(3, currentStreak >= 30);

			return c.json({
				activityId: newActivity.id,
				earnedBadges: newlyEarnedBadges,
			});
		} catch (e) {
			console.error(e);
			return c.json({ error: "Failed to record activity" }, 500);
		}
	});

export default userRoute;

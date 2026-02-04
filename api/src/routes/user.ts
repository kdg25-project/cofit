import { and, count, desc, eq, gt, gte, lte, or, sql, sum } from "drizzle-orm";
import { Hono } from "hono";
import { createDb } from "../db";
import {
	badge,
	friend,
	mission,
	missionParty,
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
					url: badge.url,
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
					url: badge.url,
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
			console.log("[API] Unauthorized activity post attempt");
			return c.json({ error: "Unauthorized" }, 401);
		}

		const userId = session.user.id;
		const body = await c.req.json();
		console.log("[API] Received activity data:", { userId, body });

		const db = createDb(c.env.DB);

		if (!body.activity || typeof body.count !== "number") {
			return c.json({ error: "Invalid activity data" }, 400);
		}

		try {
			const now = new Date();
			const startTime = body.startTime ? new Date(body.startTime) : now;
			const endTime = body.endTime ? new Date(body.endTime) : now;

			// 0. ミッションの同期を確実に行う (mission_party が存在することを保証)
			const { syncPartyMissions } = await import("./mission");
			const userParties = await db.query.partyMember.findMany({
				where: eq(partyMember.userId, userId),
			});
			for (const p of userParties) {
				await syncPartyMissions(db, p.partyId);
			}

			// 1. アクティビティを記録
			const [newActivity] = await db
				.insert(userActivity)
				.values({
					userId,
					activity: body.activity,
					count: body.count,
					startTime: startTime,
					endTime: endTime,
					createdAt: now,
					updatedAt: now,
				})
				.returning();

			// 2. ミッションの更新 (旧 missionRoute のロジックを統合)
			for (const p of userParties) {
				const missionsToUpdate = await db
					.select()
					.from(missionParty)
					.innerJoin(mission, eq(missionParty.missionId, mission.id))
					.where(
						and(
							eq(missionParty.partyId, p.partyId),
							eq(mission.mode, body.activity as any),
							gt(mission.expiredAt, now),
						),
					);

				for (const m of missionsToUpdate) {
					await db
						.update(missionParty)
						.set({
							count: m.mission_party.count + body.count,
							updatedAt: now,
						})
						.where(
							and(
								eq(missionParty.missionId, m.mission_party.missionId),
								eq(missionParty.partyId, p.partyId),
							),
						);
				}
			}

			// 3. バッジの獲得判定
			const newlyEarnedBadges: any[] = [];

			const existingBadges = await db
				.select({ badgeId: userBadge.badgeId })
				.from(userBadge)
				.where(eq(userBadge.userId, userId));
			const existingBadgeIds = new Set(existingBadges.map((b) => b.badgeId));

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

			// 通算回数によるバッジ（スクワット、腹筋、腕立て伏せ）
			const totals = await db
				.select({
					activity: userActivity.activity,
					total: sum(userActivity.count),
				})
				.from(userActivity)
				.where(eq(userActivity.userId, userId))
				.groupBy(userActivity.activity);

			const squatTotal = Number(
				totals.find((t) => t.activity === "squat")?.total || 0,
			);
			const absTotal = Number(
				totals.find((t) => t.activity === "situp" || t.activity === "abs")
					?.total || 0,
			);
			const pushupTotal = Number(
				totals.find((t) => t.activity === "pushup")?.total || 0,
			);

			// スクワット
			await checkAndAddBadge(4, squatTotal >= 100);
			await checkAndAddBadge(5, squatTotal >= 1000);
			await checkAndAddBadge(6, squatTotal >= 10000);

			// 腹筋
			await checkAndAddBadge(7, absTotal >= 100);
			await checkAndAddBadge(8, absTotal >= 1000);
			await checkAndAddBadge(9, absTotal >= 10000);

			// 継続日数（ストリーク）バッジ
			const datesResult = await db
				.select({
					date: sql<string>`DATE(${userActivity.createdAt})`,
				})
				.from(userActivity)
				.where(eq(userActivity.userId, userId))
				.groupBy(sql`DATE(${userActivity.createdAt})`)
				.orderBy(desc(sql`DATE(${userActivity.createdAt})`));

			const activityDates = datesResult.map((r) => r.date);

			const calculateStreak = (dates: string[]) => {
				if (dates.length === 0) return 0;
				let streak = 0;
				const today = new Date().toISOString().split("T")[0];
				const yesterday = new Date(Date.now() - 86400000)
					.toISOString()
					.split("T")[0];

				// 最新の記録が今日か昨日でない場合は継続していない
				if (dates[0] !== today && dates[0] !== yesterday) return 0;

				for (let i = 0; i < dates.length; i++) {
					const dateToCheck = new Date(dates[0]);
					dateToCheck.setDate(dateToCheck.getDate() - i);
					const dateStr = dateToCheck.toISOString().split("T")[0];

					if (dates[i] === dateStr) {
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
				newlyEarnedBadges: newlyEarnedBadges,
			});
		} catch (e) {
			console.error(e);
			return c.json({ error: "Failed to record activity" }, 500);
		}
	})
	.get("/activities/:month", async (c) => {
		const month = c.req.param("month");
		const auth = createAuth(c.env);
		const session = await auth.api.getSession({ headers: c.req.raw.headers });

		if (!session) {
			return c.json({ error: "Unauthorized" }, 401);
		}

		const userId = session.user.id;
		const db = createDb(c.env.DB);

		try {
			const [year, mNum] = month.split("-").map(Number);
			if (Number.isNaN(year) || Number.isNaN(mNum)) {
				return c.json({ error: "Invalid month format. Expected YYYY-MM" }, 400);
			}

			const startDate = new Date(year, mNum - 1, 1);
			const endDate = new Date(year, mNum, 0, 23, 59, 59, 999);

			const activities = await db.query.userActivity.findMany({
				where: and(
					eq(userActivity.userId, userId),
					gte(userActivity.createdAt, startDate),
					lte(userActivity.createdAt, endDate),
				),
			});

			const activeDates = new Set(
				activities.map((a) => {
					const d = new Date(a.createdAt);
					return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}-${d.getDate().toString().padStart(2, "0")}`;
				}),
			);

			const daysInMonth = new Date(year, mNum, 0).getDate();
			const result: number[] = [];

			for (let i = 1; i <= daysInMonth; i++) {
				const dayStr = `${month}-${i.toString().padStart(2, "0")}`;
				if (activeDates.has(dayStr)) {
					result.push(i);
				}
			}

			return c.json(result);
		} catch (e) {
			console.error(e);
			return c.json({ error: "Internal Server Error" }, 500);
		}
	})
	.get("/activities/detail/:id", async (c) => {
		const id = Number(c.req.param("id"));
		const auth = createAuth(c.env);
		const session = await auth.api.getSession({ headers: c.req.raw.headers });

		if (!session) {
			return c.json({ error: "Unauthorized" }, 401);
		}

		if (Number.isNaN(id)) {
			return c.json({ error: "Invalid ID" }, 400);
		}

		const userId = session.user.id;
		const db = createDb(c.env.DB);

		try {
			const activity = await db.query.userActivity.findFirst({
				where: and(eq(userActivity.id, id), eq(userActivity.userId, userId)),
			});

			if (!activity) {
				return c.json({ error: "Activity not found" }, 404);
			}

			return c.json(activity);
		} catch (e) {
			console.error(e);
			return c.json({ error: "Internal Server Error" }, 500);
		}
	});

export default userRoute;

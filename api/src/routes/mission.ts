import { and, asc, desc, eq, gt, gte, inArray, lt, lte } from "drizzle-orm";
import { Hono } from "hono";
import { createDb } from "../db";
import { mission, missionParty, partyMember, userActivity } from "../db/schema";
import { createAuth } from "../lib/auth";
import type { Bindings } from "../types";

// ミッションのテンプレート定義
export const MISSION_TEMPLATES = [
	// デイリー (基準)
	{
		title: "スクワット (デイリー)",
		goalCount: 30,
		type: "daily" as const,
		mode: "squat" as const,
	},
	{
		title: "腕立て伏せ (デイリー)",
		goalCount: 20,
		type: "daily" as const,
		mode: "pushup" as const,
	},
	{
		title: "腹筋 (デイリー)",
		goalCount: 25,
		type: "daily" as const,
		mode: "situp" as const,
	},
	// ウィークリー (デイリーの約3.5倍: 2日に1回ペース)
	{
		title: "スクワット (ウィークリー)",
		goalCount: 105,
		type: "weekly" as const,
		mode: "squat" as const,
	},
	{
		title: "腕立て伏せ (ウィークリー)",
		goalCount: 70,
		type: "weekly" as const,
		mode: "pushup" as const,
	},
	{
		title: "腹筋 (ウィークリー)",
		goalCount: 90,
		type: "weekly" as const,
		mode: "situp" as const,
	},
	// マンスリー (デイリーの約30倍: 毎日ペース)
	{
		title: "スクワット (マンスリー)",
		goalCount: 900,
		type: "monthly" as const,
		mode: "squat" as const,
	},
	{
		title: "腕立て伏せ (マンスリー)",
		goalCount: 600,
		type: "monthly" as const,
		mode: "pushup" as const,
	},
	{
		title: "腹筋 (マンスリー)",
		goalCount: 750,
		type: "monthly" as const,
		mode: "situp" as const,
	},
];

export async function ensureGlobalMissions(db: any) {
	const now = new Date();
	const types: ("daily" | "weekly" | "monthly")[] = [
		"daily",
		"weekly",
		"monthly",
	];

	for (const type of types) {
		const active = await db.query.mission.findFirst({
			where: and(eq(mission.type, type), gt(mission.expiredAt, now)),
		});

		if (!active) {
			const typeTemplates = MISSION_TEMPLATES.filter((t) => t.type === type);
			const template =
				typeTemplates[Math.floor(Math.random() * typeTemplates.length)];

			if (!template) {
				console.error(`No template found for mission type: ${type}`);
				continue;
			}

			const d = new Date();
			const expiredAtDate = new Date(d);
			if (type === "daily") {
				expiredAtDate.setDate(expiredAtDate.getDate() + 1);
				expiredAtDate.setHours(0, 0, 0, 0);
			} else if (type === "weekly") {
				const day = d.getDay();
				const diff = day === 0 ? 1 : 8 - day;
				expiredAtDate.setDate(d.getDate() + diff);
				expiredAtDate.setHours(0, 0, 0, 0);
			} else {
				// Monthly
				expiredAtDate.setMonth(expiredAtDate.getMonth() + 1);
				expiredAtDate.setDate(1);
				expiredAtDate.setHours(0, 0, 0, 0);
			}

			const expiredAt = expiredAtDate;

			await db.insert(mission).values({
				title: template.title,
				goalCount: template.goalCount,
				type: template.type,
				mode: template.mode,
				createdAt: now,
				updatedAt: now,
				expiredAt: expiredAt,
			});
		}
	}
}

export async function syncPartyMissions(db: any, partyId: number) {
	const now = new Date();

	await ensureGlobalMissions(db);
	const activeGlobalMissions = await db.query.mission.findMany({
		where: gt(mission.expiredAt, now),
	});

	// パーティ人数を取得
	const members = await db.query.partyMember.findMany({
		where: eq(partyMember.partyId, partyId),
	});
	const memberCount = members.length || 1; // 最小1人

	for (const gm of activeGlobalMissions) {
		const linked = await db.query.missionParty.findFirst({
			where: and(
				eq(missionParty.missionId, gm.id),
				eq(missionParty.partyId, partyId),
			),
		});

		if (!linked) {
			await db.insert(missionParty).values({
				missionId: gm.id,
				partyId: partyId,
				goalCount: gm.goalCount * memberCount,
				count: 0,
				createdAt: now,
				updatedAt: now,
			});
		}
	}
}

const missionRoute = new Hono<{ Bindings: Bindings }>()
	.get("/", async (c) => {
		const auth = createAuth(c.env);
		const session = await auth.api.getSession({ headers: c.req.raw.headers });

		if (!session) {
			return c.json({ error: "Unauthorized" }, 401);
		}

		const db = createDb(c.env.DB);
		const userId = session.user.id;

		try {
			const userParties = await db.query.partyMember.findMany({
				where: eq(partyMember.userId, userId),
			});

			if (userParties.length === 0) {
				return c.json([]);
			}

			const now = new Date();

			for (const p of userParties) {
				await syncPartyMissions(db, p.partyId);
			}
			const partyIds = userParties.map((p) => p.partyId);
			const results = await db
				.select({
					id: mission.id,
					title: mission.title,
					goalCount: missionParty.goalCount,
					type: mission.type,
					mode: mission.mode,
					expiredAt: mission.expiredAt,
					partyId: missionParty.partyId,
					currentCount: missionParty.count,
				})
				.from(missionParty)
				.innerJoin(mission, eq(missionParty.missionId, mission.id))
				.where(
					and(
						gt(mission.expiredAt, now),
						inArray(missionParty.partyId, partyIds),
					),
				);

			return c.json(results);
		} catch (_e) {
			console.error(_e);
			return c.json({ error: "Internal Server Error" }, 500);
		}
	})
	.post("/activities", async (c) => {
		const auth = createAuth(c.env);
		const session = await auth.api.getSession({ headers: c.req.raw.headers });

		if (!session) {
			return c.json({ error: "Unauthorized" }, 401);
		}

		const body = await c.req.json();
		const db = createDb(c.env.DB);
		const userId = session.user.id;
		const now = new Date();

		try {
			await db.insert(userActivity).values({
				userId,
				activity: body.activity,
				count: body.count,
				startTime: new Date(body.startTime),
				endTime: new Date(body.endTime),
				createdAt: now,
				updatedAt: now,
			});

			const userParties = await db.query.partyMember.findMany({
				where: eq(partyMember.userId, userId),
			});

			for (const p of userParties) {
				const missionsToUpdate = await db
					.select()
					.from(missionParty)
					.innerJoin(mission, eq(missionParty.missionId, mission.id))
					.where(
						and(
							eq(missionParty.partyId, p.partyId),
							eq(mission.mode, body.activity),
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

			return c.json({ success: true });
		} catch (_e) {
			console.error(_e);
			return c.json({ error: "Failed to record activity" }, 500);
		}
	})
	.get("/activities", async (c) => {
		const auth = createAuth(c.env);
		const session = await auth.api.getSession({ headers: c.req.raw.headers });

		if (!session) {
			return c.json({ error: "Unauthorized" }, 401);
		}

		const db = createDb(c.env.DB);
		const userId = session.user.id;
		const range = c.req.query("range") || "7d";

		try {
			const now = new Date();
			let startTime = now;
			let endTime = now;

			const from = c.req.query("from");
			const to = c.req.query("to");

			if (from) {
				startTime = new Date(from);
				if (to) {
					endTime = new Date(to);
				}
			} else {
				const startDate = new Date();
				if (range === "7d") {
					startDate.setDate(startDate.getDate() - 7);
				} else if (range === "30d") {
					startDate.setDate(startDate.getDate() - 30);
				} else if (range === "all") {
					startDate.setTime(0); // 全期間
				} else {
					startDate.setDate(startDate.getDate() - 7);
				}
				startTime = startDate;
			}

			const activities = await db.query.userActivity.findMany({
				where: and(
					eq(userActivity.userId, userId),
					gt(userActivity.startTime, startTime),
					lt(userActivity.startTime, endTime),
				),
				orderBy: [desc(userActivity.startTime)],
			});

			return c.json(activities);
		} catch (_e) {
			console.error(_e);
			return c.json({ error: "Internal Server Error" }, 500);
		}
	})
	.get("/activities/summary", async (c) => {
		const auth = createAuth(c.env);
		const session = await auth.api.getSession({ headers: c.req.raw.headers });

		if (!session) {
			return c.json({ error: "Unauthorized" }, 401);
		}

		const db = createDb(c.env.DB);
		const userId = session.user.id;
		const dateStr = c.req.query("date");

		try {
			let dayStart: Date;
			let dayEnd: Date;

			if (dateStr) {
				dayStart = new Date(dateStr);
				dayStart.setHours(0, 0, 0, 0);
				dayEnd = new Date(dateStr);
				dayEnd.setHours(23, 59, 59, 999);
			} else {
				dayStart = new Date();
				dayStart.setHours(0, 0, 0, 0);
				dayEnd = new Date();
				dayEnd.setHours(23, 59, 59, 999);
			}

			const activities = await db.query.userActivity.findMany({
				where: and(
					eq(userActivity.userId, userId),
					gte(userActivity.startTime, dayStart),
					lte(userActivity.startTime, dayEnd),
				),
				orderBy: [asc(userActivity.startTime)],
			});

			const structured = activities.map((a: any) => {
				const startD = a.startTime;
				const endD = a.endTime;
				return {
					activity: a.activity,
					count: a.count,
					timeRange: `${startD.getHours().toString().padStart(2, "0")}:${startD.getMinutes().toString().padStart(2, "0")} - ${endD.getHours().toString().padStart(2, "0")}:${endD.getMinutes().toString().padStart(2, "0")}`,
					startTime: a.startTime,
					endTime: a.endTime,
				};
			});

			return c.json({
				date: dayStart.toISOString().split("T")[0],
				activities: structured,
			});
		} catch (_e) {
			console.error(_e);
			return c.json({ error: "Internal Server Error" }, 500);
		}
	});

export default missionRoute;

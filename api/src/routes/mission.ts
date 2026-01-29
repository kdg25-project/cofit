import { and, eq, gt, gte, inArray, lt, lte } from "drizzle-orm";
import { Hono } from "hono";
import { createDb } from "../db";
import { mission, missionParty, partyMember, userActivity } from "../db/schema";
import { createAuth } from "../lib/auth";
import type { Bindings } from "../types";

const missionRoute = new Hono<{ Bindings: Bindings }>();

// ミッションのテンプレート定義
export const MISSION_TEMPLATES = [
	{
		title: "スクワット",
		goalCount: 50,
		type: "daily" as const,
		mode: "squat" as const,
	},
	{
		title: "スクワット",
		goalCount: 250,
		type: "weekly" as const,
		mode: "squat" as const,
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
			where: (and as any)(
				(eq as any)(mission.type, type),
				(gt as any)(mission.expiredAt, now),
			),
		});

		if (!active) {
			const template =
				MISSION_TEMPLATES.find((t) => t.type === type) || MISSION_TEMPLATES[0];

			const expiredAt = new Date(now);
			if (type === "daily") {
				expiredAt.setDate(expiredAt.getDate() + 1);
				expiredAt.setHours(0, 0, 0, 0);
			} else if (type === "weekly") {
				const day = now.getDay();
				const diff = day === 0 ? 1 : 8 - day;
				expiredAt.setDate(now.getDate() + diff);
				expiredAt.setHours(0, 0, 0, 0);
			} else {
				expiredAt.setMonth(expiredAt.getMonth() + 1);
				expiredAt.setDate(1);
				expiredAt.setHours(0, 0, 0, 0);
			}

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
		where: (gt as any)(mission.expiredAt, now),
	});

	for (const gm of activeGlobalMissions) {
		const linked = await db.query.missionParty.findFirst({
			where: (and as any)(
				(eq as any)(missionParty.missionId, gm.id),
				(eq as any)(missionParty.partyId, partyId),
			),
		});

		if (!linked) {
			await db.insert(missionParty).values({
				missionId: gm.id,
				partyId: partyId,
				count: 0,
				createdAt: now,
				updatedAt: now,
			});
		}
	}
}

missionRoute.get("/", async (c) => {
	const auth = createAuth(c.env);
	const session = await auth.api.getSession({ headers: c.req.raw.headers });

	if (!session) {
		return c.json({ error: "Unauthorized" }, 401);
	}

	const db = createDb(c.env.DB);
	const userId = session.user.id;

	try {
		const userParties = await db.query.partyMember.findMany({
			where: (eq as any)(partyMember.userId, userId),
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
				goalCount: mission.goalCount,
				type: mission.type,
				mode: mission.mode,
				expiredAt: mission.expiredAt,
				partyId: missionParty.partyId,
				currentCount: missionParty.count,
			})
			.from(missionParty)
			.innerJoin(mission, (eq as any)(missionParty.missionId, mission.id))
			.where(
				(and as any)(
					(gt as any)(mission.expiredAt, now),
					(inArray as any)(missionParty.partyId, partyIds),
				),
			);

		return c.json(results);
	} catch (_e) {
		console.error(_e);
		return c.json({ error: "Internal Server Error" }, 500);
	}
});

missionRoute.post("/activities", async (c) => {
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
			where: (eq as any)(partyMember.userId, userId),
		});

		for (const p of userParties) {
			const missionsToUpdate = await db
				.select()
				.from(missionParty)
				.innerJoin(mission, (eq as any)(missionParty.missionId, mission.id))
				.where(
					(and as any)(
						(eq as any)(missionParty.partyId, p.partyId),
						(eq as any)(mission.mode, body.activity),
						(gt as any)(mission.expiredAt, now),
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
						(and as any)(
							(eq as any)(missionParty.missionId, m.mission_party.missionId),
							(eq as any)(missionParty.partyId, p.partyId),
						),
					);
			}
		}

		return c.json({ success: true });
	} catch (_e) {
		console.error(_e);
		return c.json({ error: "Failed to record activity" }, 500);
	}
});

missionRoute.get("/activities", async (c) => {
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
		let startTime = new Date();
		let endTime = new Date(now);

		const from = c.req.query("from");
		const to = c.req.query("to");

		if (from) {
			startTime = new Date(from);
			if (to) {
				endTime = new Date(to);
			}
		} else {
			if (range === "7d") {
				startTime.setDate(now.getDate() - 7);
			} else if (range === "30d") {
				startTime.setDate(now.getDate() - 30);
			} else if (range === "all") {
				startTime = new Date(0); // 全期間
			} else {
				startTime.setDate(now.getDate() - 7);
			}
		}

		const activities = await db.query.userActivity.findMany({
			where: (and as any)(
				(eq as any)(userActivity.userId, userId),
				(gt as any)(userActivity.startTime, startTime),
				(lt as any)(userActivity.startTime, endTime),
			),
			orderBy: (desc: any) => [desc(userActivity.startTime)],
		});

		return c.json(activities);
	} catch (_e) {
		console.error(_e);
		return c.json({ error: "Internal Server Error" }, 500);
	}
});

missionRoute.get("/activities/summary", async (c) => {
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
			where: (and as any)(
				(eq as any)(userActivity.userId, userId),
				(gte as any)(userActivity.startTime, dayStart),
				(lte as any)(userActivity.startTime, dayEnd),
			),
			orderBy: (asc: any) => [asc(userActivity.startTime)],
		});

		const structured = activities.map((a: any) => ({
			activity: a.activity,
			count: a.count,
			timeRange: `${a.startTime.getHours().toString().padStart(2, "0")}:${a.startTime.getMinutes().toString().padStart(2, "0")} - ${a.endTime.getHours().toString().padStart(2, "0")}:${a.endTime.getMinutes().toString().padStart(2, "0")}`,
			startTime: a.startTime,
			endTime: a.endTime,
		}));

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

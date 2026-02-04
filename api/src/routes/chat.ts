import { and, asc, count, desc, eq, gt, inArray, ne, or } from "drizzle-orm";
import { Hono } from "hono";
import { validator } from "hono/validator";
import { createDb } from "../db";
import {
	channel,
	channelReadStatus,
	message,
	partyMember,
	user,
} from "../db/schema";
import { createAuth } from "../lib/auth";
import type { Bindings } from "../types";

const chat = new Hono<{ Bindings: Bindings }>()
	.get("/channels", async (c) => {
		const auth = createAuth(c.env);
		const session = await auth.api.getSession({ headers: c.req.raw.headers });
		if (!session) return c.json({ error: "Unauthorized" }, 401);
		const userId = session.user.id;
		const db = createDb(c.env.DB);

		const userParties = await db.query.partyMember.findMany({
			where: eq(partyMember.userId, userId),
		});
		const partyIds = userParties.map((p) => p.partyId);

		const conditions = [
			eq(channel.firstUserId, userId),
			eq(channel.secondUserId, userId),
		];
		if (partyIds.length > 0) {
			conditions.push(inArray(channel.partyId, partyIds));
		}

		const accessibleChannels = await db.query.channel.findMany({
			where: or(...conditions),
		});

		const results = await Promise.all(
			accessibleChannels.map(async (ch) => {
				const latestMessage = await db.query.message.findFirst({
					where: eq(message.channelId, ch.id),
					orderBy: [desc(message.createdAt)],
				});

				const readStatus = await db.query.channelReadStatus.findFirst({
					where: and(
						eq(channelReadStatus.channelId, ch.id),
						eq(channelReadStatus.userId, userId),
					),
				});

				const lastReadAt = readStatus?.lastReadAt || new Date(0);

				const unreadRows = await db
					.select({ value: count() })
					.from(message)
					.where(
						and(
							eq(message.channelId, ch.id),
							gt(message.createdAt, lastReadAt),
							ne(message.userId, userId),
						),
					);

				const unreadCount = unreadRows[0].value;

				return {
					...ch,
					latestMessage: latestMessage || null,
					unreadCount,
				};
			}),
		);

		return c.json(results);
	})
	.post("/channels/:id/read", async (c) => {
		const channelId = Number.parseInt(c.req.param("id"));
		const auth = createAuth(c.env);
		const session = await auth.api.getSession({ headers: c.req.raw.headers });
		if (!session) return c.json({ error: "Unauthorized" }, 401);
		const userId = session.user.id;
		const db = createDb(c.env.DB);

		try {
			const targetChannel = await db.query.channel.findFirst({
				where: eq(channel.id, channelId),
			});

			if (!targetChannel) {
				return c.json({ error: "Channel not found" }, 404);
			}

			if (targetChannel.type === "dm") {
				if (
					targetChannel.firstUserId !== userId &&
					targetChannel.secondUserId !== userId
				) {
					return c.json({ error: "Forbidden" }, 403);
				}
			} else if (targetChannel.type === "party") {
				const membership = await db.query.partyMember.findFirst({
					where: and(
						eq(partyMember.partyId, targetChannel.partyId as number),
						eq(partyMember.userId, userId),
					),
				});
				if (!membership) {
					return c.json({ error: "Forbidden" }, 403);
				}
			}

			const now = new Date();
			await db
				.insert(channelReadStatus)
				.values({
					userId,
					channelId,
					lastReadAt: now,
				})
				.onConflictDoUpdate({
					target: [channelReadStatus.userId, channelReadStatus.channelId],
					set: { lastReadAt: now },
				});

			return c.json({ success: true });
		} catch (_e) {
			return c.json({ error: "Failed to update read status" }, 500);
		}
	})
	.get("/channels/:id/messages", async (c) => {
		const channelId = Number.parseInt(c.req.param("id"));
		const auth = createAuth(c.env);
		const session = await auth.api.getSession({ headers: c.req.raw.headers });
		if (!session) return c.json({ error: "Unauthorized" }, 401);

		const db = createDb(c.env.DB);
		try {
			const messages = await db
				.select({
					id: message.id,
					userId: message.userId,
					userName: user.name,
					displayName: user.displayName,
					content: message.content,
					createdAt: message.createdAt,
				})
				.from(message)
				.innerJoin(user, eq(message.userId, user.id))
				.where(eq(message.channelId, channelId))
				.orderBy(asc(message.createdAt));

			return c.json(messages);
		} catch (_e) {
			return c.json({ error: "Failed to fetch messages" }, 500);
		}
	})
	.post(
		"/channels/:id/messages",
		validator("json", (value, c) => {
			const body = value as { content: string };
			if (!body.content) {
				return c.json({ error: "content is required" }, 400);
			}
			return body;
		}),
		async (c) => {
			const channelId = Number.parseInt(c.req.param("id"));
			const auth = createAuth(c.env);
			const session = await auth.api.getSession({ headers: c.req.raw.headers });
			if (!session) return c.json({ error: "Unauthorized" }, 401);
			const userId = session.user.id;

			const body = c.req.valid("json");
			const db = createDb(c.env.DB);
			try {
				const now = new Date();
				const newMessage = await db
					.insert(message)
					.values({
						channelId,
						userId,
						content: body.content,
						createdAt: now,
						updatedAt: now,
					})
					.returning();

				return c.json(newMessage[0]);
			} catch (_e) {
				return c.json({ error: "Failed to send message" }, 500);
			}
		},
	)
	.post("/dm/:userId", async (c) => {
		const secondUserId = c.req.param("userId");
		const auth = createAuth(c.env);
		const session = await auth.api.getSession({ headers: c.req.raw.headers });
		if (!session) return c.json({ error: "Unauthorized" }, 401);
		const firstUserId = session.user.id;

		if (firstUserId === secondUserId) {
			return c.json({ error: "Cannot create DM with yourself" }, 400);
		}

		const db = createDb(c.env.DB);
		try {
			// 既存のDMを探す
			let targetChannel = await db.query.channel.findFirst({
				where: and(
					eq(channel.type, "dm"),
					or(
						and(
							eq(channel.firstUserId, firstUserId),
							eq(channel.secondUserId, secondUserId),
						),
						and(
							eq(channel.firstUserId, secondUserId),
							eq(channel.secondUserId, firstUserId),
						),
					),
				),
			});

			if (!targetChannel) {
				// なければ作成
				const now = new Date();
				const result = await db
					.insert(channel)
					.values({
						name: "DM",
						type: "dm",
						firstUserId,
						secondUserId,
						createdAt: now,
						updatedAt: now,
					})
					.returning();
				targetChannel = result[0];
			}

			return c.json(targetChannel);
		} catch (_e) {
			return c.json({ error: "Failed to get or create DM channel" }, 500);
		}
	})
	.get("/unread-summary", async (c) => {
		const auth = createAuth(c.env);
		const session = await auth.api.getSession({ headers: c.req.raw.headers });
		if (!session) return c.json({ error: "Unauthorized" }, 401);
		const userId = session.user.id;
		const db = createDb(c.env.DB);

		const userParties = await db.query.partyMember.findMany({
			where: eq(partyMember.userId, userId),
		});
		const partyIds = userParties.map((p) => p.partyId);

		const conditions = [
			eq(channel.firstUserId, userId),
			eq(channel.secondUserId, userId),
		];
		if (partyIds.length > 0) {
			conditions.push(inArray(channel.partyId, partyIds));
		}

		const accessibleChannels = await db.query.channel.findMany({
			where: or(...conditions),
		});

		let total = 0;
		const channelsMap: Record<number, number> = {};

		await Promise.all(
			accessibleChannels.map(async (ch) => {
				const readStatus = await db.query.channelReadStatus.findFirst({
					where: and(
						eq(channelReadStatus.channelId, ch.id),
						eq(channelReadStatus.userId, userId),
					),
				});

				const lastReadAt = readStatus?.lastReadAt || new Date(0);

				const unreadRows = await db
					.select({ value: count() })
					.from(message)
					.where(
						and(
							eq(message.channelId, ch.id),
							gt(message.createdAt, lastReadAt),
							ne(message.userId, userId),
						),
					);

				const countVal = unreadRows[0].value as number;
				total += countVal;
				channelsMap[ch.id] = countVal;
			}),
		);

		return c.json({ total, channels: channelsMap });
	});

export default chat;

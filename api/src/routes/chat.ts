import { and, count, desc, eq, gt, inArray, ne, or } from "drizzle-orm";
import { Hono } from "hono";
import { createDb } from "../db";
import { channel, channelReadStatus, message, partyMember } from "../db/schema";
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

		const accessibleChannels = await db.query.channel.findMany({
			where: or(
				eq(channel.firstUserId, userId),
				eq(channel.secondUserId, userId),
				partyIds.length > 0 ? inArray(channel.partyId, partyIds) : undefined,
			),
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
	});

export default chat;

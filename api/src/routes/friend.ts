import { and, asc, eq, or } from "drizzle-orm";
import { Hono } from "hono";
import { validator } from "hono/validator";
import { createDb } from "../db";
import { friend, user } from "../db/schema";
import { createAuth } from "../lib/auth";
import type { Bindings } from "../types";

const friendRoute = new Hono<{ Bindings: Bindings }>()
	.get("/", async (c) => {
		const auth = createAuth(c.env);
		const session = await auth.api.getSession({ headers: c.req.raw.headers });

		if (!session) {
			return c.json({ error: "Unauthorized" }, 401);
		}

		const db = createDb(c.env.DB);
		const userId = session.user.id;

		try {
			const friends = await db
				.select({
					id: user.id,
					name: user.name,
					displayName: user.displayName,
					image: user.image,
					status: friend.status,
				})
				.from(friend)
				.innerJoin(
					user,
					or(
						and(
							eq(friend.requesterId, userId),
							eq(friend.addresseeId, user.id),
						),
						and(
							eq(friend.addresseeId, userId),
							eq(friend.requesterId, user.id),
						),
					),
				)
				.where(eq(friend.status, "accepted"));

			return c.json(friends);
		} catch (_e) {
			console.error(_e);
			return c.json({ error: "Internal Server Error" }, 500);
		}
	})
	.get("/requests", async (c) => {
		const auth = createAuth(c.env);
		const session = await auth.api.getSession({ headers: c.req.raw.headers });

		if (!session) {
			return c.json({ error: "Unauthorized" }, 401);
		}

		const db = createDb(c.env.DB);
		const userId = session.user.id;

		try {
			const requests = await db
				.select({
					id: friend.id,
					from: {
						id: user.id,
						name: user.name,
						displayName: user.displayName,
						image: user.image,
					},
					createdAt: friend.createdAt,
				})
				.from(friend)
				.innerJoin(user, eq(friend.requesterId, user.id))
				.where(
					and(eq(friend.addresseeId, userId), eq(friend.status, "pending")),
				)
				.orderBy(asc(user.name));

			return c.json(requests);
		} catch (_e) {
			return c.json({ error: "Internal Server Error" }, 500);
		}
	})
	.post(
		"/requests",
		validator("json", (value, c) => {
			const body = value as { addresseeId?: string; name?: string };
			if (!body.addresseeId && !body.name) {
				return c.json({ error: "addresseeId or name is required" }, 400);
			}
			return body;
		}),
		async (c) => {
			const auth = createAuth(c.env);
			const session = await auth.api.getSession({ headers: c.req.raw.headers });

			if (!session) {
				return c.json({ error: "Unauthorized" }, 401);
			}

			const body = c.req.valid("json");
			const db = createDb(c.env.DB);
			const userId = session.user.id;

			try {
				let targetUser;
				if (body.addresseeId) {
					targetUser = await db.query.user.findFirst({
						where: eq(user.id, body.addresseeId),
					});
				} else if (body.name) {
					// 大文字小文字を区別せずに検索したい場合は sql`lower(${user.name}) = lower(${body.name})` 等を使用
					targetUser = await db.query.user.findFirst({
						where: eq(user.name, body.name),
					});
				}

				if (!targetUser) {
					return c.json({ error: "User not found" }, 404);
				}

				if (targetUser.id === userId) {
					return c.json({ error: "Cannot send request to yourself" }, 400);
				}

				const existing = await db.query.friend.findFirst({
					where: or(
						and(
							eq(friend.requesterId, userId),
							eq(friend.addresseeId, targetUser.id),
						),
						and(
							eq(friend.requesterId, targetUser.id),
							eq(friend.addresseeId, userId),
						),
					),
				});

				if (existing) {
					return c.json({ error: "Request already exists" }, 400);
				}

				const now = new Date();
				await db.insert(friend).values({
					requesterId: userId,
					addresseeId: targetUser.id,
					status: "pending",
					createdAt: now,
					updatedAt: now,
				});

				return c.json({ success: true });
			} catch (_e) {
				console.error(_e);
				return c.json({ error: "Failed to send request" }, 500);
			}
		},
	)
	.patch(
		"/requests/:id",
		validator("json", (value, c) => {
			const body = value as {
				status: "pending" | "accepted" | "rejected" | "blocked";
			};
			if (!body.status) {
				return c.json({ error: "status is required" }, 400);
			}
			return body;
		}),
		async (c) => {
			const friendId = Number(c.req.param("id"));
			const auth = createAuth(c.env);
			const session = await auth.api.getSession({ headers: c.req.raw.headers });

			if (!session) {
				return c.json({ error: "Unauthorized" }, 401);
			}

			const body = c.req.valid("json");
			const db = createDb(c.env.DB);

			try {
				const request = await db.query.friend.findFirst({
					where: eq(friend.id, friendId),
				});

				if (!request || request.addresseeId !== session.user.id) {
					return c.json({ error: "Forbidden" }, 403);
				}

				if (request.status === "pending") {
					if (body.status !== "accepted" && body.status !== "rejected") {
						return c.json(
							{ error: "Invalid status transition from pending" },
							400,
						);
					}
				} else {
					if (body.status === "pending") {
						return c.json({ error: "Cannot move back to pending" }, 400);
					}
				}

				await db
					.update(friend)
					.set({
						status: body.status,
						updatedAt: new Date(),
					})
					.where(eq(friend.id, friendId));

				return c.json({ success: true });
			} catch (_e) {
				return c.json({ error: "Failed to update request" }, 500);
			}
		},
	)
	.delete("/:id", async (c) => {
		const targetUserId = c.req.param("id");
		const auth = createAuth(c.env);
		const session = await auth.api.getSession({ headers: c.req.raw.headers });

		if (!session) {
			return c.json({ error: "Unauthorized" }, 401);
		}

		const db = createDb(c.env.DB);
		const userId = session.user.id;

		try {
			await db
				.delete(friend)
				.where(
					or(
						and(
							eq(friend.requesterId, userId),
							eq(friend.addresseeId, targetUserId),
						),
						and(
							eq(friend.requesterId, targetUserId),
							eq(friend.addresseeId, userId),
						),
					),
				);

			return c.json({ success: true });
		} catch (_e) {
			return c.json({ error: "Failed to remove friend" }, 500);
		}
	});

export default friendRoute;

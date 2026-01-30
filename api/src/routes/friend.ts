import { and, eq, or } from "drizzle-orm";
import { Hono } from "hono";
import { createDb } from "../db";
import { friend, user } from "../db/schema";
import { createAuth } from "../lib/auth";
import type { Bindings } from "../types";

const friendRoute = new Hono<{ Bindings: Bindings }>();

friendRoute.get("/", async (c) => {
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
				(or as any)(
					(and as any)(
						(eq as any)(friend.requesterId, userId),
						(eq as any)(friend.addresseeId, user.id),
					),
					(and as any)(
						(eq as any)(friend.addresseeId, userId),
						(eq as any)(friend.requesterId, user.id),
					),
				),
			)
			.where((eq as any)(friend.status, "accepted"));

		return c.json(friends);
	} catch (_e) {
		console.error(_e);
		return c.json({ error: "Internal Server Error" }, 500);
	}
});

friendRoute.get("/requests", async (c) => {
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
			.innerJoin(user, (eq as any)(friend.requesterId, user.id))
			.where(
				(and as any)(
					(eq as any)(friend.addresseeId, userId),
					(eq as any)(friend.status, "pending"),
				),
			);

		return c.json(requests);
	} catch (_e) {
		return c.json({ error: "Internal Server Error" }, 500);
	}
});

friendRoute.post("/requests", async (c) => {
	const auth = createAuth(c.env);
	const session = await auth.api.getSession({ headers: c.req.raw.headers });

	if (!session) {
		return c.json({ error: "Unauthorized" }, 401);
	}

	const body = await c.req.json();
	const db = createDb(c.env.DB);
	const userId = session.user.id;

	try {
		// 名前からユーザーを検索
		const targetUser = await db.query.user.findFirst({
			where: (eq as any)(user.name, body.name),
		});

		if (!targetUser) {
			return c.json({ error: "User not found" }, 404);
		}

		if (targetUser.id === userId) {
			return c.json({ error: "Cannot send request to yourself" }, 400);
		}

		const existing = await db.query.friend.findFirst({
			where: (or as any)(
				(and as any)(
					(eq as any)(friend.requesterId, userId),
					(eq as any)(friend.addresseeId, targetUser.id),
				),
				(and as any)(
					(eq as any)(friend.requesterId, targetUser.id),
					(eq as any)(friend.addresseeId, userId),
				),
			),
		});

		if (existing) {
			return c.json({ error: "Request already exists" }, 400);
		}

		await db.insert(friend).values({
			requesterId: userId,
			addresseeId: targetUser.id,
			status: "pending",
			createdAt: new Date(),
			updatedAt: new Date(),
		});

		return c.json({ success: true });
	} catch (_e) {
		console.error(_e);
		return c.json({ error: "Failed to send request" }, 500);
	}
});

friendRoute.patch("/requests/:id", async (c) => {
	const friendId = Number(c.req.param("id"));
	const auth = createAuth(c.env);
	const session = await auth.api.getSession({ headers: c.req.raw.headers });

	if (!session) {
		return c.json({ error: "Unauthorized" }, 401);
	}

	const body = await c.req.json();
	const db = createDb(c.env.DB);

	try {
		const request = await db.query.friend.findFirst({
			where: (eq as any)(friend.id, friendId),
		});

		if (!request || request.addresseeId !== session.user.id) {
			return c.json({ error: "Forbidden" }, 403);
		}

		await db
			.update(friend)
			.set({
				status: body.status,
				updatedAt: new Date(),
			})
			.where((eq as any)(friend.id, friendId));

		return c.json({ success: true });
	} catch (_e) {
		return c.json({ error: "Failed to update request" }, 500);
	}
});

friendRoute.delete("/:id", async (c) => {
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
				(or as any)(
					(and as any)(
						(eq as any)(friend.requesterId, userId),
						(eq as any)(friend.addresseeId, targetUserId),
					),
					(and as any)(
						(eq as any)(friend.requesterId, targetUserId),
						(eq as any)(friend.addresseeId, userId),
					),
				),
			);

		return c.json({ success: true });
	} catch (_e) {
		return c.json({ error: "Failed to remove friend" }, 500);
	}
});

export default friendRoute;

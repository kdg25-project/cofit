import { and, eq } from "drizzle-orm";
import { Hono } from "hono";
import { createDb } from "../db";
import { party, partyMember, user } from "../db/schema";
import { createAuth } from "../lib/auth";
import type { Bindings } from "../types";

const partyRoute = new Hono<{ Bindings: Bindings }>();

const generateInviteCode = () => {
	const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
	const array = new Uint8Array(6);
	crypto.getRandomValues(array);
	let code = "";
	for (let i = 0; i < 6; i++) {
		code += chars.charAt(array[i] % chars.length);
	}
	return code;
};
partyRoute.post("/", async (c) => {
	const auth = createAuth(c.env);
	const session = await auth.api.getSession({ headers: c.req.raw.headers });

	if (!session) {
		return c.json({ error: "Unauthorized" }, 401);
	}

	const body = await c.req.json();
	const db = createDb(c.env.DB);
	const userId = session.user.id;

	if (!body.name || typeof body.name !== "string" || body.name.trim() === "") {
		return c.json({ error: "Party name is required" }, 400);
	}

	let retries = 5;
	let newParty: any[] = [];

	while (retries > 0) {
		try {
			const inviteCode = generateInviteCode();
			newParty = await db
				.insert(party)
				.values({
					name: body.name,
					image: body.image,
					ownerId: userId,
					inviteCode,
					createdAt: new Date(),
					updatedAt: new Date(),
				})
				.returning();

			if (newParty && newParty.length > 0) {
				break;
			}
		} catch (e: any) {
			if (e.message?.includes("UNIQUE") && e.message?.includes("invite_code")) {
				retries--;
				if (retries === 0) {
					return c.json(
						{ error: "Failed to generate unique invite code" },
						500,
					);
				}
				continue;
			}
			throw e;
		}
	}

	if (!newParty || newParty.length === 0) {
		return c.json({ error: "Failed to create party" }, 500);
	}

	try {
		const partyId = newParty[0].id;

		await db.insert(partyMember).values({
			userId,
			partyId,
			createdAt: new Date(),
			updatedAt: new Date(),
		});

		await db.update(user).set({ partyId }).where(eq(user.id, userId));

		return c.json(newParty[0]);
	} catch (_e) {
		console.error(_e);
		return c.json({ error: "Failed to set up party member" }, 500);
	}
});

partyRoute.get("/:id", async (c) => {
	const id = Number(c.req.param("id"));
	const db = createDb(c.env.DB);

	try {
		const result = await db.query.party.findFirst({
			where: eq(party.id, id),
			with: {},
		});

		if (!result) {
			return c.json({ error: "Party not found" }, 404);
		}

		const members = await db
			.select({
				id: user.id,
				name: user.name,
				displayName: user.displayName,
				image: user.image,
			})
			.from(partyMember)
			.innerJoin(user, eq(partyMember.userId, user.id))
			.where(eq(partyMember.partyId, id));

		return c.json({
			...result,
			members,
		});
	} catch (_e) {
		return c.json({ error: "Internal Server Error" }, 500);
	}
});

partyRoute.patch("/:id", async (c) => {
	const id = Number(c.req.param("id"));
	const auth = createAuth(c.env);
	const session = await auth.api.getSession({ headers: c.req.raw.headers });

	if (!session) {
		return c.json({ error: "Unauthorized" }, 401);
	}

	const body = await c.req.json();
	const db = createDb(c.env.DB);

	try {
		const targetParty = await db.query.party.findFirst({
			where: eq(party.id, id),
		});

		if (!targetParty || targetParty.ownerId !== session.user.id) {
			return c.json({ error: "Forbidden" }, 403);
		}

		await db
			.update(party)
			.set({
				name: body.name,
				image: body.image,
				updatedAt: new Date(),
			})
			.where(eq(party.id, id));

		return c.json({ success: true });
	} catch (_e) {
		return c.json({ error: "Failed to update party" }, 500);
	}
});

partyRoute.post("/join", async (c) => {
	const auth = createAuth(c.env);
	const session = await auth.api.getSession({ headers: c.req.raw.headers });

	if (!session) {
		return c.json({ error: "Unauthorized" }, 401);
	}

	const { inviteCode } = await c.req.json();
	const db = createDb(c.env.DB);
	const userId = session.user.id;

	try {
		const targetParty = await db.query.party.findFirst({
			where: eq(party.inviteCode, inviteCode.toUpperCase()),
		});

		if (!targetParty) {
			return c.json({ error: "Invalid invite code" }, 404);
		}

		const partyId = targetParty.id;

		const existing = await db.query.partyMember.findFirst({
			where: and(
				eq(partyMember.userId, userId),
				eq(partyMember.partyId, partyId),
			),
		});

		if (existing) {
			return c.json({ error: "Already joined" }, 400);
		}

		await db.insert(partyMember).values({
			userId,
			partyId,
			createdAt: new Date(),
			updatedAt: new Date(),
		});

		await db.update(user).set({ partyId }).where(eq(user.id, userId));

		return c.json({ success: true, partyId });
	} catch (_e) {
		return c.json({ error: "Failed to join party" }, 500);
	}
});

partyRoute.post("/:id/leave", async (c) => {
	const id = Number(c.req.param("id"));
	const auth = createAuth(c.env);
	const session = await auth.api.getSession({ headers: c.req.raw.headers });

	if (!session) {
		return c.json({ error: "Unauthorized" }, 401);
	}

	const db = createDb(c.env.DB);
	const userId = session.user.id;

	try {
		const targetParty = await db.query.party.findFirst({
			where: eq(party.id, id),
		});

		if (targetParty?.ownerId === userId) {
			return c.json({ error: "Owner cannot leave" }, 400);
		}

		await db
			.delete(partyMember)
			.where(and(eq(partyMember.userId, userId), eq(partyMember.partyId, id)));

		await db.update(user).set({ partyId: null }).where(eq(user.id, userId));

		return c.json({ success: true });
	} catch (_e) {
		return c.json({ error: "Failed to leave party" }, 500);
	}
});

export default partyRoute;

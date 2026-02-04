import { and, eq } from "drizzle-orm";
import { Hono } from "hono";
import { validator } from "hono/validator";
import { createDb } from "../db";
import { channel, party, partyMember, user } from "../db/schema";
import { createAuth } from "../lib/auth";
import type { Bindings } from "../types";

const generateInviteCode = () => {
	const chars = "0123456789";
	const array = new Uint8Array(6);
	crypto.getRandomValues(array);
	let code = "";
	for (let i = 0; i < 6; i++) {
		code += chars.charAt(array[i] % chars.length);
	}
	return code;
};
const partyRoute = new Hono<{ Bindings: Bindings }>()
	.post(
		"/",
		validator("json", (value, c) => {
			const body = value as { name: string; image?: string };
			if (!body.name) {
				return c.json({ error: "Party name is required" }, 400);
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

			let retries = 5;
			let newParty: (typeof party.$inferSelect)[] = [];

			while (retries > 0) {
				try {
					const inviteCode = generateInviteCode();
					const now = new Date();
					newParty = await db
						.insert(party)
						.values({
							name: body.name,
							image: body.image,
							ownerId: userId,
							inviteCode,
							createdAt: now,
							updatedAt: now,
						})
						.returning();

					if (newParty && newParty.length > 0) {
						break;
					}
				} catch (e: any) {
					if (
						e.message?.includes("UNIQUE") &&
						e.message?.includes("invite_code")
					) {
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
				const now = new Date();

				await db.insert(partyMember).values({
					userId,
					partyId,
					createdAt: now,
					updatedAt: now,
				});

				// パーティー用のチャットチャンネルを作成
				// DBのNOT NULL制約がある場合に備えて userId をセットする
				await db.insert(channel).values({
					name: body.name,
					type: "party",
					partyId,
					firstUserId: userId,
					secondUserId: userId,
					createdAt: now,
					updatedAt: now,
				});

				await db.update(user).set({ partyId }).where(eq(user.id, userId));

				return c.json(newParty[0]);
			} catch (_e) {
				console.error(_e);
				return c.json(
					{ error: "Failed to set up party member or channel" },
					500,
				);
			}
		},
	)
	.get("/:id", async (c) => {
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
	})
	.patch(
		"/:id",
		validator("json", (value, _c) => {
			const body = value as { name?: string; image?: string };
			return body;
		}),
		async (c) => {
			const id = Number(c.req.param("id"));
			const auth = createAuth(c.env);
			const session = await auth.api.getSession({ headers: c.req.raw.headers });

			if (!session) {
				return c.json({ error: "Unauthorized" }, 401);
			}

			const body = c.req.valid("json");
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
		},
	)
	.post(
		"/join",
		validator("json", (value, c) => {
			const body = value as { inviteCode: string };
			if (!body.inviteCode) {
				return c.json({ error: "Invite code is required" }, 400);
			}
			return body;
		}),
		async (c) => {
			const auth = createAuth(c.env);
			const session = await auth.api.getSession({ headers: c.req.raw.headers });

			if (!session) {
				return c.json({ error: "Unauthorized" }, 401);
			}

			const { inviteCode } = c.req.valid("json");
			const db = createDb(c.env.DB);
			const userId = session.user.id;

			try {
				const targetParty = await db.query.party.findFirst({
					where: eq(party.inviteCode, inviteCode),
				});

				if (!targetParty) {
					return c.json({ error: "Invalid invite code" }, 404);
				}

				const partyId = targetParty.id;
				const now = new Date();

				const existing = await db.query.partyMember.findFirst({
					where: and(
						eq(partyMember.userId, userId),
						eq(partyMember.partyId, partyId),
					),
				});

				if (!existing) {
					await db.insert(partyMember).values({
						userId,
						partyId,
						createdAt: now,
						updatedAt: now,
					});
					await db.update(user).set({ partyId }).where(eq(user.id, userId));
				}

				// チャンネルの存在確認、なければ作成
				const existingChannel = await db.query.channel.findFirst({
					where: eq(channel.partyId, partyId),
				});

				if (!existingChannel) {
					await db.insert(channel).values({
						name: targetParty.name,
						type: "party",
						partyId,
						firstUserId: userId,
						secondUserId: userId,
						createdAt: now,
						updatedAt: now,
					});
				}

				// ミッションの同期
				const { syncPartyMissions } = await import("./mission");
				await syncPartyMissions(db, partyId);

				return c.json({ success: true, partyId });
			} catch (_e) {
				console.error(_e);
				return c.json({ error: "Failed to join party" }, 500);
			}
		},
	)
	.post("/:id/leave", async (c) => {
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
				.where(
					and(eq(partyMember.userId, userId), eq(partyMember.partyId, id)),
				);

			await db.update(user).set({ partyId: null }).where(eq(user.id, userId));

			return c.json({ success: true });
		} catch (_e) {
			return c.json({ error: "Failed to leave party" }, 500);
		}
	});

export default partyRoute;

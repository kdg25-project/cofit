import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { party, user } from "./auth";

export const userActivity = sqliteTable("user_activity", {
	id: integer("id").primaryKey(),
	userId: text("user_id")
		.notNull()
		.references(() => user.id),
	activity: text("activity").notNull(),
	count: integer("count").notNull(),
	startTime: integer("start_time", { mode: "timestamp" }).notNull(),
	endTime: integer("end_time", { mode: "timestamp" }).notNull(),
	createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
	updatedAt: integer("updated_at", { mode: "timestamp" })
		.notNull()
		.$onUpdate(() => new Date()),
});

export const friend = sqliteTable("friend", {
	id: integer("id").primaryKey(),
	requesterId: text("requester_id")
		.notNull()
		.references(() => user.id),
	addresseeId: text("addressee_id")
		.notNull()
		.references(() => user.id),
	status: text("status", {
		enum: ["pending", "accepted", "rejected", "blocked"],
	}).notNull(),
	createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
	updatedAt: integer("updated_at", { mode: "timestamp" })
		.notNull()
		.$onUpdate(() => new Date()),
});

export const partyMember = sqliteTable("party_member", {
	id: integer("id").primaryKey(),
	userId: text("user_id")
		.notNull()
		.references(() => user.id),
	partyId: integer("party_id")
		.notNull()
		.references(() => party.id),
	createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
	updatedAt: integer("updated_at", { mode: "timestamp" })
		.notNull()
		.$onUpdate(() => new Date()),
});

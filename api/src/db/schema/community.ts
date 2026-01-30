import {
	integer,
	primaryKey,
	sqliteTable,
	text,
} from "drizzle-orm/sqlite-core";
import { party, user } from "./auth";

export const channel = sqliteTable("channel", {
	id: integer("id").primaryKey(),
	name: text("name").notNull(),
	createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
	updatedAt: integer("updated_at", { mode: "timestamp" })
		.notNull()
		.$onUpdate(() => new Date()),
	type: text("type", {
		enum: ["dm", "party"],
	}).notNull(),
	firstUserId: text("first_user_id")
		.notNull()
		.references(() => user.id),
	secondUserId: text("second_user_id")
		.notNull()
		.references(() => user.id),
	partyId: integer("party_id").references(() => party.id),
});

export const message = sqliteTable("message", {
	id: integer("id").primaryKey(),
	channelId: integer("channel_id").references(() => channel.id),
	userId: text("user_id")
		.notNull()
		.references(() => user.id),
	content: text("content").notNull(),
	createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
	updatedAt: integer("updated_at", { mode: "timestamp" })
		.notNull()
		.$onUpdate(() => new Date()),
});

export const channelReadStatus = sqliteTable(
	"channel_read_status",
	{
		userId: text("user_id")
			.notNull()
			.references(() => user.id),
		channelId: integer("channel_id")
			.notNull()
			.references(() => channel.id),
		lastReadAt: integer("last_read_at", { mode: "timestamp" }).notNull(),
	},
	(table) => [primaryKey({ columns: [table.userId, table.channelId] })],
);

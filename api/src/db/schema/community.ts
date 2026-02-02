import { sql } from "drizzle-orm";
import {
	customType,
	integer,
	primaryKey,
	sqliteTable,
	text,
} from "drizzle-orm/sqlite-core";
import { party, user } from "./auth";

const datetime = customType<{ data: Date; driverData: string }>({
	dataType() {
		return "text";
	},
	fromDriver(value: string) {
		return new Date(value);
	},
	toDriver(value: Date) {
		return value.toISOString().replace("T", " ").split(".")[0];
	},
});

export const channel = sqliteTable("channel", {
	id: integer("id").primaryKey(),
	name: text("name").notNull(),
	createdAt: datetime("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
	updatedAt: datetime("updated_at")
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`)
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
	createdAt: datetime("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
	updatedAt: datetime("updated_at")
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`)
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
		lastReadAt: datetime("last_read_at").notNull(),
	},
	(table) => [primaryKey({ columns: [table.userId, table.channelId] })],
);

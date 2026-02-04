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
	firstUserId: text("first_user_id").references(() => user.id, {
		onDelete: "cascade",
	}),
	secondUserId: text("second_user_id").references(() => user.id, {
		onDelete: "cascade",
	}),
	partyId: integer("party_id").references(() => party.id, {
		onDelete: "cascade",
	}),
});

export const message = sqliteTable("message", {
	id: integer("id").primaryKey(),
	channelId: integer("channel_id").references(() => channel.id, {
		onDelete: "cascade",
	}),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
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
			.references(() => user.id, { onDelete: "cascade" }),
		channelId: integer("channel_id")
			.notNull()
			.references(() => channel.id, { onDelete: "cascade" }),
		lastReadAt: datetime("last_read_at").notNull(),
	},
	(table) => [primaryKey({ columns: [table.userId, table.channelId] })],
);

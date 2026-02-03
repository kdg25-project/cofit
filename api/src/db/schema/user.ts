import { sql } from "drizzle-orm";
import {
	customType,
	integer,
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

export const userActivity = sqliteTable("user_activity", {
	id: integer("id").primaryKey(),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	activity: text("activity").notNull(),
	count: integer("count").notNull(),
	startTime: datetime("start_time").notNull(),
	endTime: datetime("end_time").notNull(),
	createdAt: datetime("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
	updatedAt: datetime("updated_at")
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`)
		.$onUpdate(() => new Date()),
});

export const friend = sqliteTable("friend", {
	id: integer("id").primaryKey(),
	requesterId: text("requester_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	addresseeId: text("addressee_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	status: text("status", {
		enum: ["pending", "accepted", "rejected", "blocked"],
	}).notNull(),
	createdAt: datetime("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
	updatedAt: datetime("updated_at")
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`)
		.$onUpdate(() => new Date()),
});

export const partyMember = sqliteTable("party_member", {
	id: integer("id").primaryKey(),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	partyId: integer("party_id")
		.notNull()
		.references(() => party.id, { onDelete: "cascade" }),
	createdAt: datetime("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
	updatedAt: datetime("updated_at")
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`)
		.$onUpdate(() => new Date()),
});

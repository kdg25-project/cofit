import { sql } from "drizzle-orm";
import {
	customType,
	integer,
	primaryKey,
	sqliteTable,
	text,
} from "drizzle-orm/sqlite-core";
import { user } from "./auth";

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

export const badge = sqliteTable("badge", {
	id: integer("id").primaryKey(),
	name: text("name").notNull(),
	url: text("url"),
	description: text("description").notNull(),
	howToGet: text("how_to_get").notNull(),
	createdAt: datetime("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
	updatedAt: datetime("updated_at")
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`)
		.$onUpdate(() => new Date()),
});

export const userBadge = sqliteTable(
	"user_badge",
	{
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		badgeId: integer("badge_id")
			.notNull()
			.references(() => badge.id, { onDelete: "cascade" }),
		createdAt: datetime("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
		updatedAt: datetime("updated_at")
			.notNull()
			.default(sql`CURRENT_TIMESTAMP`)
			.$onUpdate(() => new Date()),
	},
	(table) => [primaryKey({ columns: [table.userId, table.badgeId] })],
);

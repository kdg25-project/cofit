import {
	integer,
	primaryKey,
	sqliteTable,
	text,
} from "drizzle-orm/sqlite-core";
import { user } from "./auth";

export const badge = sqliteTable("badge", {
	id: integer("id").primaryKey(),
	name: text("name").notNull(),
	image: text("image").notNull(),
	description: text("description").notNull(),
	howToGet: text("how_to_get").notNull(),
});

export const userBadge = sqliteTable(
	"user_badge",
	{
		userId: text("user_id")
			.notNull()
			.references(() => user.id),
		badgeId: integer("badge_id")
			.notNull()
			.references(() => badge.id),
		createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
		updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
	},
	(table) => [primaryKey({ columns: [table.userId, table.badgeId] })],
);

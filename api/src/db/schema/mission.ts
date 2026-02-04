import { sql } from "drizzle-orm";
import {
	customType,
	integer,
	sqliteTable,
	text,
} from "drizzle-orm/sqlite-core";
import { party } from "./auth";

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

export const mission = sqliteTable("mission", {
	id: integer("id").primaryKey(),
	title: text("title").notNull(),
	goalCount: integer("goal_count").notNull(), // 1人あたりの目標数
	createdAt: datetime("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
	updatedAt: datetime("updated_at")
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`)
		.$onUpdate(() => new Date()),
	expiredAt: datetime("expired_at").notNull(),
	type: text("type", {
		enum: ["daily", "weekly", "monthly"],
	}).notNull(),
	mode: text("mode", { enum: ["squat", "pushup", "situp"] }).notNull(),
});

// 実装メモ
// パーティに所属していない場合、ミッションは作成できない
// フロントでミッションをgetした際に有効なこのテーブルのrowがない場合は作成を行う
// パーティに所属していない場合はミッションを取得できない
export const missionParty = sqliteTable("mission_party", {
	id: integer("id").primaryKey(),
	missionId: integer("mission_id")
		.notNull()
		.references(() => mission.id, { onDelete: "cascade" }),
	partyId: integer("party_id")
		.notNull()
		.references(() => party.id, { onDelete: "cascade" }),
	goalCount: integer("goal_count").notNull(), // パーティ人数 x 1人あたりの目標数
	count: integer("count").notNull().default(0),
	createdAt: datetime("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
	updatedAt: datetime("updated_at")
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`)
		.$onUpdate(() => new Date()),
});

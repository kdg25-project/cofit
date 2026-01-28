import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { party, user } from "./auth";

export const mission = sqliteTable("mission", {
	id: integer("id").primaryKey(),
	title: text("title").notNull(),
	goalCount: integer("goal_count").notNull(),
	createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
	updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
	expiredAt: integer("expired_at", { mode: "timestamp" }).notNull(),
	type: text("type", {
		enum: ["daily", "weekly", "monthly"],
	}).notNull(),
});

// 実装メモ
// パーティに所属していない場合、ミッションは作成できない
// フロントでミッションをgetした際に有効なこのテーブルのrowがない場合は作成を行う
// パーティに所属していない場合はミッションを取得できない
export const missionParty = sqliteTable("mission_party", {
	missionId: integer("mission_id")
		.notNull()
		.references(() => mission.id),
	partyId: integer("party_id")
		.notNull()
		.references(() => party.id),
	count: integer("count").notNull().default(0),
	createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
	updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});
